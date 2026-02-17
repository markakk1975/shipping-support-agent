#!/bin/bash
set -e

echo "Starting Telegram bot..."
python -m tgbot.bot &
TG_PID=$!

echo "Starting web server..."
exec uvicorn web.server:app --host 0.0.0.0 --port ${PORT:-8000}
