FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD python -m tgbot.bot & uvicorn web.server:app --host 0.0.0.0 --port ${PORT:-8000}
