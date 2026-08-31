try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
except ImportError:
    HuggingFaceEmbeddings = None

from app.core.config import settings

class MockEmbeddings:
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[0.0] * 384 for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [0.0] * 384

# Global cached embeddings instance
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        if HuggingFaceEmbeddings:
            try:
                _embeddings = HuggingFaceEmbeddings(
                    model_name=settings.EMBEDDING_MODEL,
                    model_kwargs={'device': 'cpu'}
                )
            except Exception:
                _embeddings = MockEmbeddings()
        else:
            _embeddings = MockEmbeddings()
    return _embeddings
