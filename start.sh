#!/bin/bash

python -m tgbot.bot &
uvicorn web.server:app --host 0.0.0.0 --port ${PORT:-8000}
