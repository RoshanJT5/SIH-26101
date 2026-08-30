from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.config import settings

# Global cached embeddings instance
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'}
        )
    return _embeddings
