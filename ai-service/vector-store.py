from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma

embedding = HuggingFaceEmbeddings()

vector_db = Chroma.from_documents(
    docs,
    embedding
)   