from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from typing import List, Dict

app = FastAPI(title="SmartGen Chatbot API")

# CORS - Update with your actual domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smartgentools.com", "https://bayzed123.github.io", "*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client using your secret
client = Groq(api_key=os.getenv("YOUR_GROQ_KEY"))

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    model: str = "llama-3.1-8b-instant"

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        completion = client.chat.completions.create(
            model=request.model,
            messages=request.messages,
            temperature=0.7,
            max_tokens=800,
            top_p=0.9,
        )
        return {
            "response": completion.choices[0].message.content,
            "model": request.model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "SmartGen Groq Chatbot API is running"}