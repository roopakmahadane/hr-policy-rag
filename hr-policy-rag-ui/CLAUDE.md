@AGENTS.md

# HR Policy RAG System

## Project Overview
FastAPI backend + Next.js frontend for querying 
HR policy documents using RAG (LangChain + ChromaDB)

## Tech Stack
- Python/FastAPI (backend)
- LangChain + ChromaDB (RAG pipeline)
- Next.js + TypeScript + Tailwind (frontend)
- Anthropic Claude API

## Project Structure
- main.py → FastAPI endpoints (/upload, /ask)
- test_rag.py → RAG pipeline testing
- chroma_db/ → vector store (never edit manually)
- uploads/ → uploaded PDFs

## Commands
- Start backend: uvicorn main:app --reload
- Start frontend: cd hr-policy-rag-ui && npm run dev

## Rules
- Always use async for file upload endpoints
- Handle errors with try/except on all API calls
- Never commit .env or chroma_db/ to git
- Keep chunk_size=500, chunk_overlap=50 unless testing

## Gotchas
- ChromaDB requires embeddings to match on load
- HuggingFace model downloads on first run (slow!)
- File uploads need shutil.copyfileobj not file.read()


## The Compounding Engineering Concept 

Every time Claude does something wrong, add a note to your CLAUDE.md so it doesn't happen again.