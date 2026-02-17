# ShippingExplorer Customer Support Agent

## Overview
AI-powered customer support agent for ShippingExplorer (shippingexplorer.net). Available as a web chat widget, Telegram bot, and (planned) WhatsApp bot. Powered by Claude API (Haiku 4.5 for speed).

## Architecture
```
shipping-support-agent/
├── agent/
│   ├── core.py           # Claude API interaction, conversation history, tool use (lead capture, escalation)
│   ├── knowledge.py      # System prompt with all ShippingExplorer knowledge baked in
│   └── leads.py          # SQLite lead capture storage
├── web/
│   ├── server.py         # FastAPI backend (POST /api/chat, GET /api/health, GET /demo)
│   ├── static/
│   │   └── widget.js     # Embeddable vanilla JS chat widget (single script tag)
│   └── templates/
│       └── demo.html     # Demo page to test the widget
├── tgbot/
│   └── bot.py            # Telegram bot (python-telegram-bot 21.x)
├── config.py             # Environment vars, settings
├── requirements.txt
├── Dockerfile
├── start.sh              # Entrypoint: runs tgbot in background + uvicorn
└── render.yaml
```

## Stack
Python 3.11, FastAPI, python-telegram-bot 21.x, anthropic SDK (Haiku 4.5), SQLite, vanilla JS

## Deployment
- **Render.com** — Docker web service, auto-deploys on push to main
- **Service URL**: https://shipping-support-agent.onrender.com
- **Demo page**: https://shipping-support-agent.onrender.com/demo
- **Render Service ID**: srv-d6abdeali9vc73e08dp0
- **Render Dashboard**: https://dashboard.render.com/web/srv-d6abdeali9vc73e08dp0
- **GitHub repo**: https://github.com/markakk1975/shipping-support-agent (private)

## Telegram Bot
- **Username**: @ShippingExplorer_bot
- **Bot ID**: 8261753961
- `/start` shows language picker (English, Español, Русский), then localized greeting
- `/help`, `/pricing`, `/contact` commands for quick info
- Free-text messages routed through `agent/core.py` with typing indicator

## Web Chat Widget
- Language picker on first open (English, Español, Русский)
- Clickable suggestion chips per language
- Markdown rendering in bot responses
- "Need human help?" bar appears on escalation (with call/email links)
- Embed on any site with:
```html
<script>window.SE_SUPPORT_API = "https://shipping-support-agent.onrender.com";</script>
<script src="https://shipping-support-agent.onrender.com/static/widget.js"></script>
```

## Agent Behavior
- **Language**: User chooses language; non-English messages get a `[User language: X]` prefix hint
- **Lead capture**: Claude tool `save_lead` — captures name, email, company when user shows purchase intent
- **Escalation**: Claude tool `escalate_to_human` — provides phone (+44 203 411 64 54) and email (info@shippingexplorer.net)
- **Knowledge**: Full ShippingExplorer content embedded in system prompt (company info, features, pricing with volume discounts, FAQ, free access via AIS hosting)

## Environment Variables
- `ANTHROPIC_API_KEY` — Claude API key
- `TELEGRAM_BOT_TOKEN` — Full token: `8261753961:AAHGHxlA...`
- `PORT` — Web server port (default 8000)
- `DB_PATH` — SQLite path (default `leads.db`)

## Running Locally
```bash
pip install -r requirements.txt
cp .env.example .env  # fill in ANTHROPIC_API_KEY and TELEGRAM_BOT_TOKEN

# Web server (includes demo page at /demo)
PYTHONPATH=. python3 -m uvicorn web.server:app --host 0.0.0.0 --port 8000

# Telegram bot (separate terminal)
PYTHONPATH=. python3 -m tgbot.bot
```

## Key Design Decisions
- Knowledge base embedded in system prompt (site content is small enough)
- Claude tools for lead capture and escalation (structured, reliable)
- Haiku 4.5 model for fast responses (switched from Sonnet for speed)
- In-memory conversation history (resets on restart — fine for support chat)
- Widget is vanilla JS for easy embedding with a single script tag
- `tgbot/` directory (not `telegram/`) to avoid shadowing python-telegram-bot package

## TODO: WhatsApp Integration
- **Approach**: Meta Cloud API direct (they already have a WhatsApp Business number)
- **Library**: `pywa` (https://github.com/david-lev/pywa) — has native FastAPI support
- **What's needed from Meta Developer Portal**:
  1. Create a WhatsApp App at developers.facebook.com
  2. Get: Phone Number ID, permanent Access Token, set a Verify Token
  3. Configure webhook URL pointing to our FastAPI server (e.g., `/whatsapp/webhook`)
- **Implementation plan**:
  - Add `whatsapp/` module similar to `tgbot/`
  - Add webhook endpoint to FastAPI server
  - Route incoming messages through same `agent/core.py`
  - Add `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN` env vars
