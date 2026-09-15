from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    options: List[str]
    competency_id: Optional[int] = None
    competency_name: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = "medium"
    source_reference: Optional[str] = None

    class Config:
        from_attributes = True

class QuizResponse(BaseModel):
    id: int
    topic: Optional[str] = None
    difficulty: Optional[str] = "medium"
    quiz_type: Optional[str] = "DIAGNOSTIC"
    number_of_questions: int
    document_id: Optional[int] = None
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

class QuizGenerateRequest(BaseModel):
    document_id: Optional[int] = None
    competency_id: Optional[int] = None
    topic: Optional[str] = "Official Statistics"
    number_of_questions: Optional[int] = 5
    difficulty: Optional[str] = "medium"
    quiz_type: Optional[str] = "DIAGNOSTIC"

class QuizSubmitRequest(BaseModel):
    answers: Dict[str, str] # Map of question_id (as str) -> chosen option string

class CompetencyScoreDetail(BaseModel):
    competency_id: Optional[int] = None
    competency_name: str
    total_questions: int
    correct_answers: int
    percentage: float
    previous_level: int
    new_level: int
    level_changed: bool
    status: str # "MASTERY", "PROFICIENT", "NEEDS_IMPROVEMENT"

class QuizSubmitResponse(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    feedback: str
    correct_details: Dict[str, Any]
    result_id: int
    competency_breakdown: List[CompetencyScoreDetail] = []
    level_upgrades: List[str] = [] # e.g. ["Sampling upgraded from Level 2 to Level 3 (+1)"]
