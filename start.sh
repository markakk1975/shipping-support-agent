#!/bin/sh
set -e

echo "Starting Telegram bot..."
python -m tgbot.bot 2>&1 &
TG_PID=$!
echo "Telegram bot started (PID: $TG_PID)"

echo "Starting web server..."
uvicorn web.server:app --host 0.0.0.0 --port ${PORT:-8000} 2>&1 &
WEB_PID=$!
echo "Web server started (PID: $WEB_PID)"

# Wait for either process to exit, then kill the other
wait -n $TG_PID $WEB_PID 2>/dev/null || true
echo "A process exited, shutting down..."
kill $TG_PID $WEB_PID 2>/dev/null || true
wait
