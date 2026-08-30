from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any
import json

class QuizGenerateRequest(BaseModel):
    document_id: int
    topic: Optional[str] = None
    number_of_questions: Optional[int] = 5
    difficulty: Optional[str] = "medium" # easy, medium, hard

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    options: List[str]
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    source_reference: Optional[str] = None

    @field_validator('options', mode='before')
    @classmethod
    def parse_options(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return [v]
        return v

    class Config:
        from_attributes = True

class QuizResponse(BaseModel):
    id: int
    document_id: Optional[int] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

class QuizSubmitRequest(BaseModel):
    # Mapping of question_id to selected option text (or index / letter if needed)
    answers: Dict[str, str]

class QuizSubmitResponse(BaseModel):
    score: float # Percentage
    total_questions: int
    correct_answers: int
    feedback: str
    correct_details: Dict[str, Dict[str, str]] # question_id -> {"correct": "...", "explanation": "..."}
    result_id: int
