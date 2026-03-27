Live demo: hr-policy-rag.vercel.app

# HR Policy RAG System

Ask questions about any HR policy document 
using AI. Upload a PDF and get accurate answers 
with source citations.

## Tech Stack
- FastAPI
- LangChain
- ChromaDB (vector database)
- Anthropic Claude API
- HuggingFace Embeddings

## How It Works
1. Upload HR policy PDF
2. System chunks and embeds document
3. Ask questions in natural language
4. Claude answers using only document context

## Setup
1. pip install -r requirements.txt
2. Add ANTHROPIC_API_KEY to .env
3. uvicorn main:app --reload

## Endpoints
- POST /upload — Upload and process PDF
- POST /ask — Ask questions about the document
