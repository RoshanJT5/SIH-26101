from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.rag import QueryRequest, QueryResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/rag", tags=["AI Learning Assistant (RAG)"])

@router.post("/query", response_model=QueryResponse)
def query_ai_tutor(query_in: QueryRequest, db: Session = Depends(get_db)):
    return RAGService.answer_query(db, query_in)
