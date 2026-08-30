from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    question: str
    document_id: Optional[int] = None

class SourceMetadata(BaseModel):
    document: str
    page: int
    content_snippet: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceMetadata]
