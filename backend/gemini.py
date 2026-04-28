import os
from datetime import date
import httpx


async def generate_dmca_notice(url: str, rights_holder: str, content_type: str) -> str:
    """
    Call Google Gemini API to generate a formal DMCA takedown notice.
    Returns the generated notice text as a string.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment")

    today = date.today().strftime("%B %d, %Y")

    prompt = f"""You are a legal assistant. Generate a formal DMCA takedown notice under 17 U.S.C. § 512(c) for the following:
- Rights Holder: {rights_holder}
- Infringing URL: {url}
- Protected Content: {content_type} (IPL 2026 Live Cricket Broadcast)
- Hosting Authority: JioHotstar (Star India Pvt Ltd)
- Date: {today}

Generate a complete, legally formatted DMCA notice. Include: sender identification, infringing URL, description of infringement, good faith statement, accuracy statement under penalty of perjury, and digital signature block. Format it as plain text with clear section separators (use ━━━ lines). Make it professional and legally rigorous."""

    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(endpoint, json=payload)
        response.raise_for_status()
        data = response.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return text.strip()
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected Gemini response structure: {e}\nRaw: {data}")
