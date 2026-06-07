"""
Ollama API integration service.
Handles prompt construction and streaming/non-streaming completion.
"""

import requests
import json

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "mistral:latest"
OLLAMA_TIMEOUT = 120  # seconds — LLM can be slow on first run


# ---------------------------------------------------------------------------
# Prompt templates per summary type
# ---------------------------------------------------------------------------

PROMPTS = {
    "short": """\
You are a professional summarization assistant. Your task is to produce a concise summary.

Instructions:
- Return EXACTLY 3 to 5 bullet points.
- Each bullet point must start with "• ".
- Capture only the most important information.
- Do NOT include any preamble, headers, or closing remarks — bullets only.

Content to summarize:
{text}
""",

    "medium": """\
You are a professional summarization assistant. Your task is to produce a clear, detailed paragraph summary.

Instructions:
- Write a single cohesive paragraph of 150–250 words.
- Preserve all important information and context.
- Remove filler, redundancy, and unimportant details.
- Do NOT include bullet points or headers — prose only.

Content to summarize:
{text}
""",

    "detailed": """\
You are a professional summarization assistant. Your task is to produce a comprehensive structured summary.

Return your output using EXACTLY this structure (use these exact headings):

## Key Points
- List the 4–6 most important facts or ideas as bullet points.

## Important Insights
- List 2–4 deeper observations, themes, or takeaways as bullet points.

## Conclusion
Write 2–3 sentences summarising the overall message or outcome.

## Action Items
- List any explicit or implied next steps. If none exist, write "None identified."

Do NOT add any content before "## Key Points" or after the Action Items section.

Content to summarize:
{text}
"""
}


def check_ollama_health() -> bool:
    """Ping Ollama to verify it's running."""
    try:
        r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return r.status_code == 200
    except Exception:
        return False


def generate_summary(text: str, summary_type: str) -> str:
    """
    Call Ollama's /api/generate endpoint and return the full response string.
    Uses non-streaming mode for simplicity and reliability.
    """
    prompt_template = PROMPTS.get(summary_type, PROMPTS["short"])
    prompt = prompt_template.format(text=text.strip())

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,      # Lower = more factual, consistent
            "top_p": 0.9,
            "num_predict": 1024,
        }
    }

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=OLLAMA_TIMEOUT
        )
        response.raise_for_status()
    except requests.exceptions.ConnectionError:
        raise ConnectionError(
            "Cannot reach Ollama at localhost:11434. "
            "Make sure Ollama is running: `ollama serve`"
        )
    except requests.exceptions.Timeout:
        raise ConnectionError(
            f"Ollama did not respond within {OLLAMA_TIMEOUT}s. "
            "The model may still be loading — try again in a moment."
        )
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(f"Ollama returned HTTP {response.status_code}: {e}")

    data = response.json()
    result = data.get("response", "").strip()

    if not result:
        raise RuntimeError("Ollama returned an empty response. Check model availability.")

    return result
