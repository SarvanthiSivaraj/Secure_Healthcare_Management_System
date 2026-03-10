from langchain_classic.memory import ConversationBufferWindowMemory
from typing import Dict

# In-memory store for session memories
_memories: Dict[str, ConversationBufferWindowMemory] = {}

def get_session_memory(session_id: str, k: int = 10) -> ConversationBufferWindowMemory:
    """
    Retrieves or creates a conversation memory for a given session.
    Keeps the last k interactions.
    """
    if session_id not in _memories:
        _memories[session_id] = ConversationBufferWindowMemory(
            k=k,
            return_messages=True,
            memory_key="chat_history",
            output_key="output"
        )
    return _memories[session_id]


def clear_session_memory(session_id: str):
    """Clears the memory for a specific session."""
    if session_id in _memories:
        del _memories[session_id]


def get_all_memory_messages(session_id: str) -> str:
    """Returns the string representation of the conversation history."""
    if session_id in _memories:
        return _memories[session_id].buffer_as_str
    return ""