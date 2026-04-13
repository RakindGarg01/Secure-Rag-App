import os
from fastapi import FastAPI, UploadFile, File, Form , HTTPException , status
from typing import List
import pdfplumber
from dotenv import load_dotenv

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

app = FastAPI()


# =========================
# 🔹 CORE FUNCTIONS
# =========================

def extract_text(files):
    all_text = ""

    for file in files:
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    all_text += text + "\n"

    return all_text


def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=os.getenv("GoogleAPIKey")
    )


def create_vector_store(text, user_id):
    splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ". ", " ", ""],
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_text(text)

    vector_store = FAISS.from_texts(chunks, get_embeddings())

    os.makedirs(f"data/{user_id}", exist_ok=True)
    vector_store.save_local(f"data/{user_id}")

    return len(chunks)


def load_vector_store(user_id):
    import os
    from fastapi import HTTPException

    user_id = str(user_id).replace("/", "").replace("..", "")
    path = f"data/{user_id}"

    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail="No data found. Upload first.")

    required_files = ["index.faiss", "index.pkl"]
    for f in required_files:
        if not os.path.exists(os.path.join(path, f)):
            raise HTTPException(status_code=500, detail="Vector store corrupted")

    return FAISS.load_local(
        path,
        get_embeddings(),
        allow_dangerous_deserialization=True
    )


def build_chain(vector_store):
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 3}
    )

    def format_docs(docs):
        return "\n\n".join([doc.page_content for doc in docs])

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.3,
        max_tokens=1000,
        google_api_key=os.getenv("GoogleAPIKey")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a helpful assistant answering questions about a PDF document.\n\n"
         "Guidelines:\n"
         "1. Provide complete, well-explained answers using the context below.\n"
          "2. Include relevant details, numbers, and explanations to give a thorough response.\n"
          "3. If the context mentions related information, include it to give fuller picture.\n"
          "4. Only use information from the provided context - do not use outside knowledge.\n"
          "5. Summarize long information, ideally in bullets where needed\n"
          "6. If the information is not in the context, say so politely.\n"
          "7. Cite relevant parts of the context when possible.\n\n"
         "Context:\n{context}"),
        ("human", "{question}")
    ])

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain



# =========================
# 🚀 API ENDPOINTS
# =========================

# @app.post("/upload")
# async def upload(
#     user_id: str = Form(...),
#     files: List[UploadFile] = File(...)
# ):
#     text = extract_text(files)

#     if not text.strip():
#         raise HTTPException(status_code=400, detail="No text found")

#     chunk_count = create_vector_store(text, user_id)

#     return {
#         "status" : "success",
#         "message": "Processed successfully",
#         "chunks": chunk_count
#     }

@app.post("/upload")
async def upload(
        user_id: str = Form(...),
        file: UploadFile = File(...)
    ):
    try:
        text = extract_text([file])

        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found")

        chunk_count = create_vector_store(text, user_id)

        return {
            "status": "success",
            "message": "Files processed successfully",
            "chunks": chunk_count
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/ask")
async def ask(
    user_id: str = Form(...),
    question: str = Form(...)
):
    try:
        vector_store = load_vector_store(user_id)
        chain = build_chain(vector_store)

        answer = chain.invoke(question)

        return {
            "status": "success",
            "answer": answer
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def home():
    return {"message": "RAG API running 🚀"}