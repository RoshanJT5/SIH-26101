import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower().replace(".", "")
    if ext not in ["pdf", "docx", "pptx", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Supported extensions: .pdf, .docx, .pptx, .txt"
        )
    
    # Save file locally
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )

    # Process and extract text/embeddings
    try:
        doc = DocumentService.process_and_store_document(db, file_path, file.filename)
        return doc
    except Exception as e:
        # Cleanup file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not process document embeddings: {str(e)}"
        )
