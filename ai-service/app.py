from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from chatbot import process_chat_message, generate_soap_summary, init_chatbot
from memory import clear_session_memory
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Chatbot Service")

# Request Models
class MessageRequest(BaseModel):
    session_id: str
    message: str

class StartSessionRequest(BaseModel):
    session_id: str

@app.on_event("startup")
async def startup_event():
    print("Initializing AI Chatbot Vector Store and Retriever...")
    init_chatbot()

@app.post("/chatbot/start")
async def start_session(req: StartSessionRequest):
    # Clear existing memory for this session if starting fresh
    clear_session_memory(req.session_id)
    return {"status": "started", "message": "Session initialized."}

@app.post("/chatbot/message")
async def handle_message(req: MessageRequest):
    try:
        reply = process_chat_message(req.session_id, req.message)
        return {"reply": reply}
    except Exception as e:
        print(f"Error processing message: {e}")
        # Fallback mechanism if AI fails
        return {"reply": "I am currently unable to process your request. If this is an emergency, please seek immediate medical attention."}

@app.get("/chatbot/summary/{session_id}")
async def get_summary(session_id: str):
    try:
        summary = generate_soap_summary(session_id)
        return {"summary": summary}
    except Exception as e:
        print(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)