import pytest
import os
from unittest.mock import patch, MagicMock
from vector_store import get_vector_store

@patch("vector_store.Chroma")
@patch("vector_store.HuggingFaceEmbeddings")
def test_vector_store_initializes(mock_embeddings, mock_chroma):
    db = get_vector_store(persist_directory=".test_chroma", docs_dir="medical_docs")
    assert db is not None
    # We just want to ensure it tries to load or create Chroma
    assert mock_chroma.called or mock_chroma.from_documents.called
