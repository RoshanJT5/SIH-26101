from sqlalchemy.orm import Session
from app.models.document import DocumentChunk, Document
from app.ai.rag import retrieve_similar_chunks
from app.ai.llm import get_llm
from app.schemas.rag import QueryRequest, QueryResponse, SourceMetadata
from app.core.config import settings

class RAGService:
    @staticmethod
    def answer_query(db: Session, query_in: QueryRequest) -> QueryResponse:
        # Fetch relevant chunks
        query = db.query(DocumentChunk)
        if query_in.document_id:
            query = query.filter(DocumentChunk.document_id == query_in.document_id)
        
        all_chunks = query.all()
        if not all_chunks:
            return QueryResponse(
                answer="No documents have been uploaded or processed yet. Please upload learning materials first.",
                sources=[]
            )

        # Retrieve top K similar chunks using custom Python search
        top_chunks_data = retrieve_similar_chunks(all_chunks, query_in.question, top_k=settings.TOP_K)
        
        if not top_chunks_data or top_chunks_data[0]["score"] < 0.2: # Low similarity threshold
            return QueryResponse(
                answer="The requested information could not be found in the uploaded material.",
                sources=[]
            )

        # Format context for the LLM
        context_parts = []
        sources = []
        for i, item in enumerate(top_chunks_data):
            chunk = item["chunk"]
            doc = db.query(Document).filter(Document.id == chunk.document_id).first()
            doc_name = doc.filename if doc else "Unknown Source"
            
            context_parts.append(f"Source: {doc_name}, Page: {chunk.page_number}\nContent:\n{chunk.content}")
            
            sources.append(SourceMetadata(
                document=doc_name,
                page=chunk.page_number,
                content_snippet=chunk.content[:200] + "..."
            ))

        context = "\n\n---\n\n".join(context_parts)
        
        prompt = f"""
You are an expert statistical tutor guiding a student.
Answer the user's question based strictly on the provided Context.
If the answer cannot be found in the Context, state clearly:
"The requested information could not be found in the uploaded material."

Do not use external knowledge or invent facts.

Context:
{context}

Question: {query_in.question}

Answer:
"""
        
        try:
            llm = get_llm()
            response = llm.invoke(prompt)
            answer = response.content.strip()
        except Exception as e:
            # Fallback when LLM API keys are unconfigured
            answer = f"[Mock AI response because ChatGroq is not fully configured] Based on similarity, the material discusses this, but Groq API returned an error: {str(e)}"

        return QueryResponse(
            answer=answer,
            sources=sources
        )
