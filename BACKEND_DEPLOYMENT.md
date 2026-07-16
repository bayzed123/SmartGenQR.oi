# SmartGen Chatbot Backend Deployment Guide

This repository includes a FastAPI backend (`main.py`) designed to power the SmartGen AI Chatbot using the Groq API.

## Prerequisites

- A [Groq API Key](https://console.groq.com/)
- A hosting provider that supports Python/FastAPI (e.g., Vercel, Railway, Render)

## Deployment Steps (Vercel Example)

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Configure Vercel**: Create a `vercel.json` file in the root:
   ```json
   {
     "rewrites": [{ "source": "/api/(.*)", "destination": "/main.py" }],
     "functions": {
       "main.py": { "runtime": "vercel-python@0.0.6" }
     }
   }
   ```
3. **Set Environment Variables**:
   - `GROQ_API_KEY`: Your real Groq API key (added as a GitHub Secret or Vercel Environment Variable).
4. **Deploy**: Run `vercel` or connect your GitHub repository to Vercel.

## Security Note

The `GROQ_API_KEY` is sensitive and should **never** be hardcoded in the frontend. The frontend `chatbot.js` is configured to call this backend, which securely communicates with Groq using the secret key.

## Knowledge Base

The backend automatically scans `sitemap.xml` and `data/faq.json` on startup to provide context-aware answers about the SmartGen platform.
