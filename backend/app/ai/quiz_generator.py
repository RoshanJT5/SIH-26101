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
            
            if not validated_questions:
                return QuizGenerator.get_mock_fallback_quiz(topic, num_questions, difficulty)
            
            return {"questions": validated_questions}
        except Exception:
            # Fallback generator in case of LLM failure or credential issues
            return QuizGenerator.get_mock_fallback_quiz(topic, num_questions, difficulty)

    @staticmethod
    def get_mock_fallback_quiz(topic: str, num_questions: int, difficulty: str) -> dict:
        topic_lower = (topic or "").lower()
        
        question_bank = [
            {
                "topic_keywords": ["sampling", "survey", "sample"],
                "questions": [
                    {
                        "question": "In multi-stage stratified sampling commonly employed by NSSO, why are Urban Frame Survey (UFS) blocks stratified before sample selection?",
                        "options": [
                            "To minimize intra-stratum variance and ensure representative geographic coverage",
                            "To reduce the number of field investigators required for data entry",
                            "To eliminate the need for sampling weights during estimation",
                            "To convert non-probabilistic samples into census counts"
                        ],
                        "correct_answer": "To minimize intra-stratum variance and ensure representative geographic coverage",
                        "explanation": "Stratification groups homogeneous sampling units together, significantly reducing sampling variance and enhancing precision across diverse socio-economic strata.",
                        "topic": "Survey Sampling Methodology & Frame Design",
                        "difficulty": "medium",
                        "source_reference": "NSSO Survey Design Manual & Sampling Strategy, Chapter 3"
                    },
                    {
                        "question": "When calculating the Design Effect (Deff) for a complex survey design, what does a Deff value greater than 1.0 indicate?",
                        "options": [
                            "The complex survey design has higher sampling variance than Simple Random Sampling (SRS)",
                            "The survey sample has zero non-sampling errors",
                            "The sample size can be reduced without loss of statistical precision",
                            "The survey estimators are strictly non-linear and biased"
                        ],
                        "correct_answer": "The complex survey design has higher sampling variance than Simple Random Sampling (SRS)",
                        "explanation": "Design Effect is the ratio of the variance under the complex design to the variance under simple random sampling of the same size. Deff > 1 indicates variance inflation due to clustering.",
                        "topic": "Survey Sampling Methodology & Frame Design",
                        "difficulty": "hard",
                        "source_reference": "UN Handbook on Designing Household Sample Surveys"
                    },
                    {
                        "question": "Which weighting technique is primarily applied in Indian Official Statistics to correct for unit non-response in household surveys?",
                        "options": [
                            "Inverse Probability Weighting / Calibration Estimation",
                            "Simple Arithmetic Mean Imputation",
                            "Unweighted Average Aggregation",
                            "Markov Chain Monte Carlo Truncation"
                        ],
                        "correct_answer": "Inverse Probability Weighting / Calibration Estimation",
                        "explanation": "Inverse probability weighting adjusts design weights to compensate for non-responding units by matching known population margins.",
                        "topic": "Survey Sampling Methodology & Frame Design",
                        "difficulty": "medium",
                        "source_reference": "MoSPI Technical Standards for Data Quality & Weighting"
                    }
                ]
            },
            {
                "topic_keywords": ["cpi", "inflation", "index", "price", "iip"],
                "questions": [
                    {
                        "question": "Which index formula is standardly utilized in the compilation of India's Consumer Price Index (CPI) and Index of Industrial Production (IIP)?",
                        "options": [
                            "Laspeyres Base-Weighted Price/Quantity Index",
                            "Paasche Current-Weighted Price Index",
                            "Fisher's Ideal Geometric Index",
                            "Marshall-Edgeworth Hybrid Index"
                        ],
                        "correct_answer": "Laspeyres Base-Weighted Price/Quantity Index",
                        "explanation": "Official indices in India predominantly utilize the Laspeyres index formulation with fixed base-year weighting structures.",
                        "topic": "Price Indices & Macroeconomic Indicators",
                        "difficulty": "medium",
                        "source_reference": "MoSPI CPI Methodology Manual & Index Numbers Guide"
                    },
                    {
                        "question": "In the compilation of the Index of Industrial Production (IIP), what is the weight allocation methodology for the three broad sectors (Mining, Manufacturing, Electricity)?",
                        "options": [
                            "Gross Value Added (GVA) contributions in the base year (2011-12)",
                            "Total volume of physical units produced annually",
                            "Number of registered industrial workers per enterprise",
                            "Export earnings reported under Directorate General of Commercial Intelligence"
                        ],
                        "correct_answer": "Gross Value Added (GVA) contributions in the base year (2011-12)",
                        "explanation": "Sectoral weights in IIP are apportioned strictly on the basis of relative Gross Value Added shares established in the base year.",
                        "topic": "Price Indices & Macroeconomic Indicators",
                        "difficulty": "hard",
                        "source_reference": "Index of Industrial Production Compilation Guidelines, CSO"
                    }
                ]
            },
            {
                "topic_keywords": ["national accounts", "gdp", "gva", "economic"],
                "questions": [
                    {
                        "question": "Under the System of National Accounts (SNA 2008) adopted by India in 2015, how is GDP at Market Prices derived from GVA at Basic Prices?",
                        "options": [
                            "GDP at Market Prices = GVA at Basic Prices + Product Taxes - Product Subsidies",
                            "GDP at Market Prices = GVA at Factor Cost + Production Taxes - Production Subsidies",
                            "GDP at Market Prices = GVA at Basic Prices - Intermediate Consumption",
                            "GDP at Market Prices = Gross Fixed Capital Formation + Net Exports"
                        ],
                        "correct_answer": "GDP at Market Prices = GVA at Basic Prices + Product Taxes - Product Subsidies",
                        "explanation": "In SNA 2008, GVA at basic prices plus net product taxes (product taxes minus product subsidies) equals GDP at market prices.",
                        "topic": "National Accounts & Macroeconomic Aggregates",
                        "difficulty": "hard",
                        "source_reference": "National Accounts Statistics: Sources and Methods 2015, MoSPI"
                    }
                ]
            },
            {
                "topic_keywords": ["data quality", "audit", "validation", "scrutiny", "governance"],
                "questions": [
                    {
                        "question": "What is the primary role of Range and Consistency Checks during Computer-Assisted Personal Interviewing (CAPI) survey data collection?",
                        "options": [
                            "Real-time detection of logical inconsistencies and impossible values at point of capture",
                            "Automatic anonymization of respondent biometric data",
                            "Generating synthetic replacements for missing sampling primary units",
                            "Encrypting survey schedules for cross-departmental sharing"
                        ],
                        "correct_answer": "Real-time detection of logical inconsistencies and impossible values at point of capture",
                        "explanation": "Built-in validation rules in CAPI platforms prevent invalid ranges and illogical relationships right during field enumeration.",
                        "topic": "Data Quality, Validation & Statistical Scrutiny",
                        "difficulty": "easy",
                        "source_reference": "Field Scrutiny and Data Entry Verification Guidelines, MoSPI"
                    }
                ]
            }
        ]

        # Gather matching or general questions
        matched_pool = []
        for group in question_bank:
            if any(k in topic_lower for k in group["topic_keywords"]):
                matched_pool.extend(group["questions"])

        # Fallback pool if no specific match
        if not matched_pool:
            for group in question_bank:
                matched_pool.extend(group["questions"])

        selected = []
        for i in range(num_questions):
            template = matched_pool[i % len(matched_pool)]
            # Clone and format
            q = {
                "question": template["question"],
                "options": list(template["options"]),
                "correct_answer": template["correct_answer"],
                "explanation": template["explanation"],
                "topic": template.get("topic", topic or "Official Statistics"),
                "difficulty": difficulty or template.get("difficulty", "medium"),
                "source_reference": template.get("source_reference", "Indian Official Statistical System Curriculum")
            }
            selected.append(q)

        return {"questions": selected}
