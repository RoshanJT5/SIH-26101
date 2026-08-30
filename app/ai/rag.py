import json
import numpy as np
from typing import List, Dict
from app.ai.embeddings import get_embeddings

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """
    Computes cosine similarity between two lists of floats.
    """
    a = np.array(v1)
    b = np.array(v2)
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(dot_product / (norm_a * norm_b))

def retrieve_similar_chunks(db_chunks, query_text: str, top_k: int = 5) -> List[Dict]:
    """
    Computes the embeddings of query_text and finds the top_k most similar chunks.
    db_chunks is a list of SQLAlchemy DocumentChunk models.
    """
    if not db_chunks:
        return []

    # Get query embedding
    embeddings_service = get_embeddings()
    query_vector = embeddings_service.embed_query(query_text)

    scored_chunks = []
    for chunk in db_chunks:
        try:
            # Parse saved vector
            chunk_vector = json.loads(chunk.embedding)
            sim = cosine_similarity(query_vector, chunk_vector)
            scored_chunks.append({
                "chunk": chunk,
                "score": sim
            })
        except Exception:
            continue

    # Sort descending by similarity score
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]
