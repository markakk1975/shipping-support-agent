import uuid
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

import config
from agent import leads
from agent.core import chat, clear_session

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await leads.init_db()
    yield


app = FastAPI(title="ShippingExplorer Support Agent", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="web/static"), name="static")


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    lang: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    escalated: bool = False
    lead_captured: bool = False


@app.post("/api/chat", response_model=ChatResponse)
async def api_chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())
    message = req.message
    if req.lang and req.lang != "en":
        lang_names = {"es": "Spanish", "ru": "Russian"}
        lang_name = lang_names.get(req.lang)
        if lang_name:
            message = f"[User language: {lang_name}] {message}"
    result = await chat(session_id, message, source="web")
    return ChatResponse(
        reply=result["reply"],
        session_id=session_id,
        escalated=result["escalated"],
        lead_captured=result["lead_captured"],
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/demo", response_class=HTMLResponse)
async def demo():
    with open("web/templates/demo.html") as f:
        return f.read()


if __name__ == "__main__":
    uvicorn.run("web.server:app", host="0.0.0.0", port=config.PORT,
                log_level=config.LOG_LEVEL, reload=True)
