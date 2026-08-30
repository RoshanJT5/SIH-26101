from pydantic import BaseModel
from typing import Optional

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str

    class Config:
        from_attributes = True

class DocumentChunkResponse(BaseModel):
    id: int
    document_id: int
    page_number: int
    content: str

    class Config:
        from_attributes = True
