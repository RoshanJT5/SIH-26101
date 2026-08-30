import os
from langchain_groq import ChatGroq
from app.core.config import settings

def get_llm():
    """
    Returns an instance of ChatGroq using the configured model and API key.
    """
    # If the user has a mock API key or no key set, we will gracefully check env or fallback to a dummy to prevent app crash on startup.
    api_key = settings.GROQ_API_KEY
    if not api_key or api_key == "gsk_mock_key_for_now":
        # Check system environment variable
        api_key = os.environ.get("GROQ_API_KEY", "gsk_mock_key_for_now")
        
    return ChatGroq(
        groq_api_key=api_key,
        model_name=settings.GROQ_MODEL,
        temperature=0.0
    )
