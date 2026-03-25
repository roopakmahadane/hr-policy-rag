import shutil
import os
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.messages import HumanMessage
from fastapi import UploadFile, File, FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()
llm = ChatAnthropic(model="claude-opus-4-6")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared embeddings — create once, reuse everywhere
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Make sure uploads folder exists
os.makedirs("uploads", exist_ok=True)

class AskRequest(BaseModel):
    question: str

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        # Step 1: Save uploaded file to disk
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Step 2: Load PDF
        loader = PyPDFLoader(file_path)
        pages = loader.load()

        # Step 3: Chunk
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = splitter.split_documents(pages)

        # Step 4: Embed and store in ChromaDB
        Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory="./chroma_db"
        )

        return {
            "message": "PDF processed successfully!",
            "filename": file.filename,
            "pages": len(pages),
            "chunks": len(chunks)
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/ask")
def ask(request: AskRequest):
    try:
        # Load vectorstore from disk
        vectorstore = Chroma(
            persist_directory="./chroma_db",
            embedding_function=embeddings
        )

        # Search for relevant chunks
        results = vectorstore.similarity_search(request.question, k=3)

        # Build context from chunks
        context = "\n\n".join([doc.page_content for doc in results])

        # Build prompt
        prompt = f"""You are an HR assistant. Answer the question 
based ONLY on the context provided below.
If the answer isn't in the context, say "I don't know."
Always mention which part of the document you're referencing.

Context:
{context}

Question: {request.question}
"""
        # Ask Claude
        response = llm.invoke([HumanMessage(content=prompt)])

        seen = set()
        unique_sources = []
        for doc in results:
            if doc.page_content not in seen:
                seen.add(doc.page_content)
                unique_sources.append(doc.page_content[:150])

        return {
            "answer": response.content,
            "sources": unique_sources
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
def health():
    return {"status": "ok"}
