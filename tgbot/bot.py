import logging

from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

import config
from agent.core import chat, clear_session
from agent import leads

logger = logging.getLogger(__name__)


async def post_init(application):
    await leads.init_db()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Hello! I'm the ShippingExplorer support assistant.\n\n"
        "I can help you with:\n"
        "- Product features & capabilities\n"
        "- Pricing plans & discounts\n"
        "- Technical questions about AIS tracking\n"
        "- Getting started with ShippingExplorer\n\n"
        "Just type your question or use /pricing, /contact, or /help."
    )


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Available commands:\n"
        "/start — Welcome message\n"
        "/pricing — View pricing plans\n"
        "/contact — Contact information\n"
        "/help — This help message\n\n"
        "Or just type any question and I'll do my best to help!"
    )


async def pricing(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "ShippingExplorer Pricing Plans (VAT included):\n\n"
        "Basic License — €42/month (1 user)\n"
        "  Includes: Coastal & Satellite AIS, Alerts, Track History, Traffic Analysis\n\n"
        "Satellite — €220/month\n"
        "  Full real-time satellite AIS coverage\n\n"
        "Satellite 12h Delay — €150/month\n"
        "  Satellite AIS with 12-hour delay\n\n"
        "Volume discounts available for multiple users and longer terms.\n"
        "Enterprise pricing on request.\n\n"
        "Ask me for more details or type /contact to reach our sales team."
    )


async def contact(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "ShippingExplorer Contact:\n\n"
        "Phone: +44 (203) 411 64 54\n"
        "Email: info@shippingexplorer.net\n"
        "Web: shippingexplorer.net\n\n"
        "Our team is happy to help with custom plans, API access, or any questions."
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    session_id = f"tg_{update.effective_chat.id}"
    user_text = update.message.text

    result = await chat(session_id, user_text, source="telegram")
    await update.message.reply_text(result["reply"])


def main():
    logging.basicConfig(
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        level=logging.INFO,
    )

    app = (
        Application.builder()
        .token(config.TELEGRAM_BOT_TOKEN)
        .post_init(post_init)
        .build()
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("pricing", pricing))
    app.add_handler(CommandHandler("contact", contact))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Telegram bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
