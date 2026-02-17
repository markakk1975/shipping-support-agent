import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
PORT = int(os.getenv("PORT", "8000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")
CLAUDE_MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 1024
DB_PATH = os.getenv("DB_PATH", "leads.db")
