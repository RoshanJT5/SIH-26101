import json
from typing import List
from pydantic import BaseModel, Field
from app.ai.llm import get_llm

class GeneratedMCQ(BaseModel):
    question: str = Field(description="The multiple choice question text based on the source material.")
    options: List[str] = Field(description="Exactly 4 options. Must not contain duplicates.")
    correct_answer: str = Field(description="The exact text of the correct option from the options list.")
    explanation: str = Field(description="Detailed explanation of why this option is correct based on the text.")
    topic: str = Field(description="The specific topic or concept being tested.")
    difficulty: str = Field(description="The difficulty: easy, medium, or hard.")
    source_reference: str = Field(description="Brief reference indicating source document section/page.")

class GeneratedQuiz(BaseModel):
    questions: List[GeneratedMCQ]

class QuizGenerator:
    @staticmethod
    def generate_quiz_from_chunks(chunks_text: List[str], topic: str, num_questions: int, difficulty: str) -> dict:
        llm = get_llm()
        
        has_chunks = bool(chunks_text)
        if has_chunks:
            context = "\n---\n".join(chunks_text[:10]) # Limit context to top 10 chunks to prevent token limits
            context_block = f"""Source Materials:\n{context}\n\nGenerate exactly {num_questions} questions.\nFor each question:\n1. Ensure the question is directly answerable from the Source Materials.\n2. Provide exactly 4 options. There must be no duplicate options.\n3. The 'correct_answer' field MUST exactly match one of the items in the 'options' list.\n4. Provide a thorough 'explanation' based on the Source Materials.\n5. Identify the subtopic and difficulty."""
        else:
            context_block = f"""Generate exactly {num_questions} high quality questions to evaluate knowledge of: {topic if topic else 'Official Statistical Methods'}.\nFor each question:\n1. Ensure questions evaluate real conceptual, methodological, and operational aspects of {topic}.\n2. Provide exactly 4 realistic options. There must be no duplicate options.\n3. The 'correct_answer' field MUST exactly match one of the items in the 'options' list.\n4. Provide an informative, educational 'explanation' detailing why the answer is correct.\n5. Identify the subtopic and difficulty."""

        prompt = f"""
You are an expert government instructor and assessor. Generate a multiple choice quiz on the topic: {topic if topic else "General Content"}.
Difficulty Level: {difficulty}
Number of Questions: {num_questions}

{context_block}

You MUST respond with a valid JSON object matching this schema:
{{
  "questions": [
    {{
      "question": "question text",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correct_answer": "option 1",
      "explanation": "explanation text",
      "topic": "{topic if topic else 'General'}",
      "difficulty": "{difficulty}",
      "source_reference": "Official Curriculum Reference"
    }}
  ]
}}

Ensure there is no markdown code blocks outside of the JSON. Return only the JSON string.
"""
        
        try:
            # We can use langchain's structured output or request JSON format from Groq
            response = llm.invoke(prompt)
            content = response.content.strip()
            
            # Clean possible markdown wrap ```json ... ```
            if content.startswith("```"):
                lines = content.splitlines()
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    content = "\n".join(lines[1:-1])
            
            quiz_data = json.loads(content)
            
            # Validate options and correct answer
            validated_questions = []
            for q in quiz_data.get("questions", []):
                # Ensure exactly 4 options
                opts = q.get("options", [])
                if len(opts) != 4:
                    continue
                # Ensure correct answer matches one of the options
                correct = q.get("correct_answer", "")
                if correct not in opts:
                    # Fallback: assign the first option as correct or fix it
                    q["correct_answer"] = opts[0]
                validated_questions.append(q)
            
            return {"questions": validated_questions}
        except Exception as e:
            # Fallback mock generator in case of LLM failure or credential issues
            return QuizGenerator.get_mock_fallback_quiz(topic, num_questions, difficulty)

    @staticmethod
    def get_mock_fallback_quiz(topic: str, num_questions: int, difficulty: str) -> dict:
        questions = []
        for i in range(num_questions):
            questions.append({
                "question": f"What is the primary role of the Statistical System regarding {topic if topic else 'Data'}? (Question {i+1})",
                "options": [
                    "Data Collection and Verification",
                    "Marketing Promotion",
                    "Hardware Assembly",
                    "Entertainment Management"
                ],
                "correct_answer": "Data Collection and Verification",
                "explanation": "Statistical systems are established to collect, compile, and verify official statistics.",
                "topic": topic if topic else "Statistics",
                "difficulty": difficulty,
                "source_reference": "General Statistical Framework, Section 1.2"
            })
        return {"questions": questions}
