import aiosqlite
import json
from datetime import datetime, timezone

import config


async def init_db():
    async with aiosqlite.connect(config.DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                name TEXT,
                email TEXT,
                company TEXT,
                interest TEXT,
                source TEXT DEFAULT 'web',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()


async def save_lead(session_id: str, name: str, email: str, company: str = "",
                    interest: str = "", source: str = "web"):
    async with aiosqlite.connect(config.DB_PATH) as db:
        await db.execute(
            "INSERT INTO leads (session_id, name, email, company, interest, source, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (session_id, name, email, company, interest, source,
             datetime.now(timezone.utc).isoformat())
        )
        await db.commit()


async def get_leads(limit: int = 50) -> list[dict]:
    async with aiosqlite.connect(config.DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM leads ORDER BY created_at DESC LIMIT ?", (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
