from groq import Groq
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def load_manuals():
    docs = []
    for file in os.listdir("manuals/"):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(f"manuals/{file}")
            docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )
    chunks = splitter.split_documents(docs)
    return chunks

def answer_question(question, chunks):
    question_words = question.lower().split()

    relevant = []
    for chunk in chunks:
        text = chunk.page_content.lower()
        score = sum(1 for word in question_words if word in text)
        if score > 0:
            relevant.append((score, chunk.page_content))

    relevant.sort(reverse=True)
    context = "\n\n".join([text for _, text in relevant[:3]])

    if not context:
        context = chunks[0].page_content if chunks else "No manual content found."

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""You are a mechanical engineering expert.
Using the following content from a maintenance manual, answer the question.

MANUAL CONTENT:
{context}

QUESTION: {question}

Give a clear, practical answer based on the manual content."""
            }
        ],
        max_tokens=1000
    )
    return response.choices[0].message.content