import os
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from document_loader import load_and_split_documents
from dotenv import load_dotenv

load_dotenv()

def get_vector_store(persist_directory="./chroma_db", docs_dir="medical_docs"):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Simple check to see if database exists and has files
    if os.path.exists(persist_directory) and len(os.listdir(persist_directory)) > 0:
        print("Loading existing vector store...")
        vectordb = Chroma(persist_directory=persist_directory, embedding_function=embeddings)
    else:
        print("Creating new vector store from documents...")
        chunks = load_and_split_documents(docs_dir)
        if not chunks:
            print("Warning: No documents found to process. Initializing empty vector store.")
            vectordb = Chroma(persist_directory=persist_directory, embedding_function=embeddings)
        else:
            vectordb = Chroma.from_documents(
                documents=chunks,
                embedding=embeddings,
                persist_directory=persist_directory
            )
            print(f"Created Chroma vector store with {len(chunks)} chunks.")
            
    return vectordb

if __name__ == "__main__":
    db = get_vector_store()
    print("Vector store ready.")
