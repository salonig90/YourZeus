"""
Conversation memory using ChromaDB.
Stores recent conversation turns as embeddings for context retrieval.
Falls back gracefully to in-memory list if chromadb isn't installed.
"""
import logging
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)

# In-memory fallback storage: {session_id: [{query, response, intent, ts}]}
_memory_store: dict = {}


def _get_chroma_collection(session_id: str):
    """Return a ChromaDB collection for the session, or None if unavailable."""
    try:
        import chromadb
        client = chromadb.Client()  # In-memory client
        collection = client.get_or_create_collection(
            name=f"zeus_chat_{hashlib.md5(session_id.encode()).hexdigest()[:8]}"
        )
        return collection
    except Exception:
        return None


def save_turn(session_id: str, query: str, response: str, intent: str):
    """Save a conversation turn to memory."""
    turn = {
        'query': query,
        'response': response[:500],  # truncate long responses
        'intent': intent,
        'ts': datetime.now().isoformat()
    }

    # In-memory fallback
    if session_id not in _memory_store:
        _memory_store[session_id] = []
    _memory_store[session_id].append(turn)
    # Keep only last 20 turns per session
    _memory_store[session_id] = _memory_store[session_id][-20:]

    # Try ChromaDB
    try:
        collection = _get_chroma_collection(session_id)
        if collection:
            doc_id = f"{session_id}_{len(_memory_store[session_id])}"
            collection.add(
                documents=[f"Q: {query}\nA: {response[:300]}"],
                metadatas=[{'intent': intent, 'ts': turn['ts']}],
                ids=[doc_id]
            )
    except Exception as e:
        logger.debug(f"ChromaDB save skipped: {e}")


def get_context(session_id: str, n: int = 5) -> str:
    """Retrieve last n conversation turns as context string."""
    turns = _memory_store.get(session_id, [])[-n:]
    if not turns:
        return ''
    lines = []
    for t in turns:
        lines.append(f"User: {t['query']}")
        lines.append(f"Zeus: {t['response'][:150]}...")
    return '\n'.join(lines)


def clear_session(session_id: str):
    """Clear all memory for a session."""
    _memory_store.pop(session_id, None)
