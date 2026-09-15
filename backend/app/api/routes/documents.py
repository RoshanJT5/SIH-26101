import os
import shutil
import re
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService
from app.models.document import Document
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()


UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def sanitize_filename(filename: str) -> str:
    base = os.path.basename(filename)
    # Remove any dangerous characters, keep only alphanumeric, dots, hyphens, and underscores
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', base)
    return clean or "uploaded_document"

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty."
        )

    # Validate extension
    safe_name = sanitize_filename(file.filename)
    ext = os.path.splitext(safe_name)[1].lower().replace(".", "")
    if ext not in ["pdf", "docx", "pptx", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Supported extensions: .pdf, .docx, .pptx, .txt"
        )
    
    # Save file locally
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    try:
        bytes_read = 0
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 64):
                bytes_read += len(chunk)
                if bytes_read > max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                    )
                buffer.write(chunk)
    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save uploaded document."
        )

    # Process and extract text/embeddings
    try:
        doc = DocumentService.process_and_store_document(db, file_path, safe_name)
        return doc
    except Exception as e:
        # Cleanup file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not process document text and embeddings."
        )

