# chatbot.py
import os
import logging
from dotenv import load_dotenv
import httpx  # Async HTTP client

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def get_bot_response(message: str) -> str:
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama3-8b-8192",
            "messages": [
                {"role": "system", "content": (
                    "You are AskVerse, a kind, relatable, and trustworthy civic guidance assistant. "
                    "You talk like a supportive friend—simple, short, and emotionally sensitive. "
                    "You help users understand laws, social behavior, civil duties, and what to do or avoid in everyday life, based on their age and context. "
                    "Avoid legal jargon. Keep it casual, human, and engaging—like you're texting a friend. Use bullet points, emojis, or line breaks where helpful."
                )},
                {"role": "user", "content": message}
            ],
            "temperature": 0.7
        }

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()

        return response.json()["choices"][0]["message"]["content"].strip()

    except Exception as e:
        logging.error(f"Groq API call failed: {e}")
        return f"Bot error: {str(e)}"
