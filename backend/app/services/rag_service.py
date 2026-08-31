import hashlib
import json
from sqlalchemy.orm import Session
from app.models.document import DocumentChunk, Document
from app.models.ai_cache import AICache
from app.ai.rag import retrieve_similar_chunks
from app.ai.llm import get_llm
from app.schemas.rag import QueryRequest, QueryResponse, SourceMetadata
from app.core.config import settings


def get_local_greeting(question: str) -> str | None:
    normalized = " ".join(question.strip().casefold().rstrip("!?.,").split())
    greetings = {
        "hi", "hello", "hey", "hiya", "howdy", "greetings", "bonjour", "salut",
        "hola", "ciao", "namaste", "salaam", "salam", "hallo", "olá", "ola",
        "good morning", "good afternoon", "good evening", "good night", "bonsoir",
        "buenos días", "buenos dias", "buenas tardes", "buenas noches",
    }
    if normalized in greetings:
        return "Hi, I am your personalized AI Tutor. How can I help you today?"
    if normalized in {"how are you", "how are you doing"}:
        return "I am ready to help you learn from your uploaded study materials. What would you like to explore?"
    return None


class RAGService:
    @staticmethod
    def answer_query(db: Session, query_in: QueryRequest) -> QueryResponse:
        local_greeting = get_local_greeting(query_in.question)
        if local_greeting:
            return QueryResponse(answer=local_greeting, sources=[])

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

        source_signature = hashlib.sha256(
            "|".join(f"{chunk.id}:{chunk.content}" for chunk in all_chunks).encode("utf-8")
        ).hexdigest()
        cache_data = {
            "document_id": query_in.document_id,
            "question": query_in.question.strip().casefold(),
            "source_signature": source_signature,
            "top_k": settings.TOP_K,
        }
        cache_key = hashlib.sha256(json.dumps(cache_data, sort_keys=True).encode("utf-8")).hexdigest()
        cached = db.query(AICache).filter(
            AICache.cache_type == "rag",
            AICache.cache_key == cache_key,
        ).first()
        if cached:
            cached_payload = json.loads(cached.payload)
            return QueryResponse.model_validate(cached_payload)

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

Format your response with a short heading, then concise sections using Markdown. Use bullet points for multiple items and bold labels only when helpful. Keep paragraphs short and do not return one long block of text.

Answer:
"""
        
        try:
            llm = get_llm()
            response = llm.invoke(prompt)
            answer = response.content.strip()
        except Exception as e:
            # Fallback when LLM API keys are unconfigured
            answer = f"[Mock AI response because ChatGroq is not fully configured] Based on similarity, the material discusses this, but Groq API returned an error: {str(e)}"

        result = QueryResponse(
            answer=answer,
            sources=sources
        )
        db.add(AICache(
            cache_type="rag",
            cache_key=cache_key,
            payload=json.dumps(result.model_dump()),
        ))
        db.commit()
        return result
