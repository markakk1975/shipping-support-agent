import json
import re
import anthropic
from typing import Optional

import config
from agent.knowledge import SYSTEM_PROMPT
from agent import leads

client = anthropic.AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)

# In-memory conversation histories keyed by session_id
_sessions: dict[str, list[dict]] = {}

LEAD_CAPTURE_TOOL = {
    "name": "save_lead",
    "description": (
        "Save a potential customer's contact information when they voluntarily provide it "
        "during the conversation. Only call this when the user has shared their name and email."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Customer's name"},
            "email": {"type": "string", "description": "Customer's email address"},
            "company": {"type": "string", "description": "Customer's company name (if provided)"},
            "interest": {"type": "string", "description": "What the customer is interested in"},
        },
        "required": ["name", "email"],
    },
}

ESCALATE_TOOL = {
    "name": "escalate_to_human",
    "description": (
        "Escalate the conversation to a human agent. Use when the user explicitly asks "
        "to speak with a person, has a billing dispute, or you cannot answer their question."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "reason": {"type": "string", "description": "Why the conversation is being escalated"},
        },
        "required": ["reason"],
    },
}

TOOLS = [LEAD_CAPTURE_TOOL, ESCALATE_TOOL]


def get_history(session_id: str) -> list[dict]:
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]


def trim_history(history: list[dict], max_turns: int = 40):
    """Keep conversation history manageable."""
    if len(history) > max_turns:
        del history[: len(history) - max_turns]


async def chat(session_id: str, user_message: str, source: str = "web") -> dict:
    """
    Process a user message and return the agent's response.

    Returns dict with keys:
      - reply: str (the text response)
      - escalated: bool
      - lead_captured: bool
    """
    history = get_history(session_id)
    history.append({"role": "user", "content": user_message})
    trim_history(history)

    result = {"reply": "", "escalated": False, "lead_captured": False}

    # Allow up to 3 rounds of tool use
    for _ in range(3):
        response = await client.messages.create(
            model=config.CLAUDE_MODEL,
            max_tokens=config.MAX_TOKENS,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=history,
        )

        # Collect text blocks and tool use blocks
        text_parts = []
        tool_uses = []
        for block in response.content:
            if block.type == "text":
                text_parts.append(block.text)
            elif block.type == "tool_use":
                tool_uses.append(block)

        # If no tool use, we're done
        if response.stop_reason == "end_of_turn" or not tool_uses:
            result["reply"] = "\n".join(text_parts)
            history.append({"role": "assistant", "content": response.content})
            break

        # Handle tool calls
        history.append({"role": "assistant", "content": response.content})
        tool_results = []

        for tool_use in tool_uses:
            if tool_use.name == "save_lead":
                inp = tool_use.input
                await leads.save_lead(
                    session_id=session_id,
                    name=inp.get("name", ""),
                    email=inp.get("email", ""),
                    company=inp.get("company", ""),
                    interest=inp.get("interest", ""),
                    source=source,
                )
                result["lead_captured"] = True
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": "Lead saved successfully.",
                })

            elif tool_use.name == "escalate_to_human":
                result["escalated"] = True
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": "Escalation noted. The user will be connected with the support team.",
                })

        history.append({"role": "user", "content": tool_results})

        # Continue loop to get the final text response after tool use
    else:
        # If we exhausted the loop, grab whatever text we have
        if not result["reply"]:
            result["reply"] = "I'm sorry, I'm having trouble processing your request. Please try again."

    return result


def clear_session(session_id: str):
    _sessions.pop(session_id, None)
