from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()
llm = ChatAnthropic(model="claude-opus-4-6")

loader = PyPDFLoader("uploads/Sample Employee Handbook.pdf")
pages = loader.load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size = 500,
    chunk_overlap = 50
)
chunks = splitter.split_documents(pages)
print(f"Total chunks: {len(chunks)}")

embeddings = HuggingFaceEmbeddings(
     model_name="all-MiniLM-L6-v2"
)


vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)
 
print("All chunks embedded and stored!")
query = "how many annual leave days do employees get?"

results = vectorstore.similarity_search(query, k=3)

for i, doc in enumerate(results):
    context = "\n\n".join([doc.page_content for doc in results])

prompt = f"""You are an HR assistant. Answer the question 
based ONLY on the context provided below.
If the answer isn't in the context, say "I don't know."
Always mention which part of the document you're 
referencing.

Context:
{context}

Question: {query}
"""


response = llm.invoke([HumanMessage(content=prompt)])

print("\nClaude's Answer:")
print(response.content)
