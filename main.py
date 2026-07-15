from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import AsyncGroq
import os
from typing import List, Dict

app = FastAPI(title="SmartGen Chatbot API")

# Strict CORS - NO wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smartgentools.com",
        "https://bayzed123.github.io",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

client = AsyncGroq(api_key=os.getenv("YOUR_GROQ_KEY"))

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Secure system prompt - never comes from client
        messages = [
            {
                "role": "system",
                "content": "You are a helpful, friendly, and concise AI assistant for SmartGen — a completely free web tools platform with 130+ utilities for developers, marketers, and creators. Always be accurate and helpful."
            }
        ] + request.messages[-6:]  # Limit context

        completion = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=800,
            top_p=0.9
        )

        return {
            "response": completion.choices[0].message.content.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health():
    return {"status": "healthy"}