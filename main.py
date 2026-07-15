import os
import json
import xml.etree.ElementTree as ET
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import AsyncGroq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="SmartGen Advanced Chatbot API")

# Strict CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smartgentools.com",
        "https://bayzed123.github.io",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize Groq Client
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# Global variable to hold the scraped website data in memory
website_knowledge = ""

@app.on_event("startup")
async def load_knowledge_base():
    """
    Runs automatically when the server starts. 
    Scans sitemap.xml and JSON files to build the AI's knowledge base.
    """
    global website_knowledge
    knowledge_parts = []

    # 1. Scan and Extract Links from sitemap.xml
    try:
        # Assuming sitemap.xml is in the root directory of your backend
        tree = ET.parse("sitemap.xml")
        root = tree.getroot()
        # Handle XML namespaces usually found in sitemaps
        namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = []
        for url in root.findall('ns:url', namespace):
            loc = url.find('ns:loc', namespace)
            if loc is not None:
                urls.append(loc.text)
        
        if urls:
            knowledge_parts.append("Available Direct Links on SmartGen:\n" + "\n".join(urls))
    except Exception as e:
        print(f"⚠️ Warning: Could not parse sitemap.xml. Make sure the file exists. Error: {e}")

    # 2. Scan FAQ, Policies, or Blogs from JSON
    try:
        # Assuming you keep a JSON file for About, Terms, Cookies, and FAQs
        with open("data/faq.json", "r", encoding="utf-8") as file:
            faq_data = json.load(file)
            knowledge_parts.append("Frequently Asked Questions & Platform Policies:\n" + json.dumps(faq_data, indent=2))
    except Exception as e:
        print(f"⚠️ Warning: Could not load data/faq.json. Make sure the file exists. Error: {e}")

    # Combine all scanned data into a single context string
    if knowledge_parts:
        website_knowledge = "\n\n".join(knowledge_parts)
        print("✅ Website Knowledge Base Loaded Successfully!")
    else:
        website_knowledge = "SmartGen is a free tools platform with over 130+ utilities for developers and marketers."


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]


@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Dynamic System Prompt injecting the verified website knowledge
        system_instruction = f"""You are the official AI Assistant for 'SmartGen' — a free web tools platform by Connect with Bayezid.
        
        [VERIFIED PLATFORM DATA]:
        {website_knowledge}
        
        Your Strict Rules:
        1. If a user asks about policies (About, Terms, Cookies, Privacy), answer accurately based on the [VERIFIED PLATFORM DATA].
        2. If a user asks for a specific tool, blog, or feature, provide a brief summary and MUST include the exact Direct Link from the verified data.
        3. Do NOT invent or guess URLs. If a specific tool's link is not in the data, politely say you couldn't find the exact link and ask them to check the platform's menu.
        4. Keep your answers concise, smart, and highly engaging.
        5. Always respond in the exact language the user is speaking (e.g., reply in Bengali if asked in Bengali)."""

        # Prepend the system instruction to the last 6 messages of the conversation history
        messages = [{"role": "system", "content": system_instruction}] + request.messages[-6:]

        # Call Groq API
        completion = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.4,  # Lower temperature makes the AI strictly stick to facts and avoid making up fake links
            max_tokens=800,
            top_p=0.9
        )

        return {"response": completion.choices[0].message.content.strip()}
    
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/health")
async def health():
    return {"status": "healthy", "message": "SmartGen Advanced API is running perfectly"}