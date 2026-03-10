import os

from langchain_community.document_loaders import (
    DirectoryLoader,
    TextLoader,
    PyPDFLoader,
)

from langchain_text_splitters import RecursiveCharacterTextSplitter


def load_and_split_documents(docs_dir="medical_docs"):
    """
    Loads .txt and .pdf medical documents and splits them into chunks
    suitable for embedding in the vector database.
    """

    if not os.path.exists(docs_dir):
        print(f"[WARNING] Directory '{docs_dir}' not found.")
        return []

    documents = []

    # -----------------------------
    # Load TXT files
    # -----------------------------
    try:
        txt_loader = DirectoryLoader(
            docs_dir,
            glob="**/*.txt",
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"},
        )
        documents.extend(txt_loader.load())
    except Exception as e:
        print(f"[ERROR] Failed loading TXT documents: {e}")

    # -----------------------------
    # Load PDF files
    # -----------------------------
    try:
        pdf_loader = DirectoryLoader(
            docs_dir,
            glob="**/*.pdf",
            loader_cls=PyPDFLoader,
        )
        documents.extend(pdf_loader.load())
    except Exception as e:
        print(f"[WARNING] Failed to load PDFs: {e}")

    if not documents:
        print("[WARNING] No documents found.")
        return []

    # -----------------------------
    # Split documents into chunks
    # -----------------------------
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
    )

    chunks = text_splitter.split_documents(documents)

    print(f"[INFO] Loaded {len(documents)} documents.")
    print(f"[INFO] Created {len(chunks)} chunks.")

    return chunks


if __name__ == "__main__":
    chunks = load_and_split_documents()
    print(f"Loaded {len(chunks)} document chunks.")