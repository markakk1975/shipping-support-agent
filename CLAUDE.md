# ShippingExplorer Customer Support Agent

## Overview
AI-powered customer support agent for ShippingExplorer (shippingexplorer.net), available as a web chat widget and Telegram bot. Powered by Claude API.

## Architecture
- `agent/core.py` — Claude API interaction, conversation management, tool use (lead capture, escalation)
- `agent/knowledge.py` — System prompt with all ShippingExplorer knowledge baked in
- `agent/leads.py` — SQLite lead capture storage
- `web/server.py` — FastAPI backend serving the chat API and widget
- `web/static/widget.js` — Embeddable vanilla JS chat widget
- `tgbot/bot.py` — Telegram bot using python-telegram-bot

## Stack
Python 3.11, FastAPI, python-telegram-bot 21.x, anthropic SDK, SQLite, vanilla JS

## Running Locally
```bash
# Install deps
pip install -r requirements.txt

# Set env vars
cp .env.example .env  # then fill in ANTHROPIC_API_KEY and TELEGRAM_BOT_TOKEN

# Run web server (includes demo page at /demo)
python web/server.py

# Run Telegram bot (separate terminal)
python -m tgbot.bot
```

## Deployment
Deployed on Render.com via Docker. Push to main triggers auto-deploy.
Both FastAPI server and Telegram bot run in the same container.

## Key Design Decisions
- Knowledge base is embedded in the system prompt (site content is small enough)
- Claude tools used for lead capture and escalation (structured, reliable)
- In-memory conversation history (resets on restart — fine for support chat)
- Widget is vanilla JS for easy embedding with a single script tag
