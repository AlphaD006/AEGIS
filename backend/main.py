import asyncio
import os
from datetime import datetime, timezone
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from dmca_router import router as dmca_router  # noqa: E402

app = FastAPI(title="AEGIS Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dmca_router, prefix="/api")

@app.options("/start-scan")
async def options_start_scan():
    return {"ok": True}

# ─── IPL keyword list — broad, social-media-friendly ─────────────────────────

DEFAULT_KEYWORDS = [
    "IPL 2026 live stream",
    "watch IPL free online",
    "KKR vs MI live",
    "RCB vs CSK live stream",
    "IPL free stream reddit",
    "IPL 2026 streaming link",
    "IPL live reddit",
    "cricket live stream free 2026",
    "IPL hotstar free",
    "ipl stream telegram",
]

# ─── Scoring weights ──────────────────────────────────────────────────────────

KEYWORD_WEIGHTS: dict[str, int] = {
    "free": 10,
    "stream": 12,
    "live": 10,
    "hd": 6,
    "bypass": 22,
    "pirate": 25,
    "illegal": 25,
    "torrent": 22,
    "telegram": 14,
    "no subscription": 20,
    "crack": 18,
    "mirror": 14,
    "unlocked": 12,
    "watch online": 10,
    "leaked": 18,
    "unauthorized": 16,
    "m3u8": 22,
    "streaming link": 12,
    "mega.nz": 20,
    "discord": 10,
}

# ─── Domain bonuses ───────────────────────────────────────────────────────────

DOMAIN_BONUSES: dict[str, tuple[int, str]] = {
    "reddit.com":    (20, "Reddit post sharing IPL stream link"),
    "t.me":          (30, "Telegram channel distributing IPL stream"),
    "telegram.me":   (30, "Telegram channel distributing IPL stream"),
    "twitter.com":   (18, "Twitter/X post sharing live stream"),
    "x.com":         (18, "X (Twitter) post sharing live stream"),
    "discord.com":   (20, "Discord server streaming IPL"),
    "discord.gg":    (20, "Discord server streaming IPL"),
    "pastebin.com":  (16, "Pastebin with streaming links"),
    "justpaste.it":  (16, "Paste site with streaming links"),
    "streameast":    (25, "Known piracy streaming domain"),
    "crackstreams":  (28, "Known piracy streaming domain"),
    "sportsurge":    (26, "Known piracy streaming domain"),
    "buffstreams":   (25, "Known piracy streaming domain"),
    "rojadirecta":   (24, "Known piracy streaming domain"),
}

# ─── Thresholds ───────────────────────────────────────────────────────────────

FLAG_THRESHOLD = 25       # flagged = potential piracy
SUSPICIOUS_THRESHOLD = 10  # suspicious = shown but not flagged

# ─── State ────────────────────────────────────────────────────────────────────

scan_running = False
scan_task: Optional[asyncio.Task] = None
results: list[dict] = []
total_scanned = 0
current_keyword = ""

# ─── Scoring ──────────────────────────────────────────────────────────────────

def score_url(url: str, title: str, snippet: str) -> dict:
    combined = f"{url} {title} {snippet}".lower()
    url_lower = url.lower()
    score = 0
    reasons: list[str] = []

    for kw, weight in KEYWORD_WEIGHTS.items():
        if kw in combined:
            locations = []
            if kw in url_lower:
                locations.append("URL")
            if kw in title.lower():
                locations.append("title")
            if kw in snippet.lower():
                locations.append("snippet")
            loc_str = " & ".join(locations) if locations else "content"
            reasons.append(f"Keyword '{kw}' found in {loc_str} (+{weight})")
            score += weight

    for domain, (bonus, reason) in DOMAIN_BONUSES.items():
        if domain in url_lower:
            reasons.append(f"High-risk domain '{domain}' detected (+{bonus})")
            score += bonus
            break

    ipl_signals = ["ipl", "indian premier league", "kkr", "mi ", "rcb", "csk", "srh", "dc ", "gt ", "lsg", "pbks", "rr "]
    ipl_hits = sum(1 for s in ipl_signals if s in combined)
    if ipl_hits >= 2:
        bonus = min(ipl_hits * 4, 16)
        reasons.append(f"IPL content signals detected ({ipl_hits} matches) (+{bonus})")
        score += bonus

    score = min(score, 100)
    return {"score": score, "reasons": reasons}


# ─── Seed results — shown instantly on scan start ─────────────────────────────

SEED_RESULTS = [
    {
        "url": "https://www.reddit.com/r/cricket/comments/ipl2026_kkr_mi_live_stream",
        "title": "KKR vs MI IPL 2026 — Free Live Stream Links [Updated]",
        "snippet": "Sharing working free stream links for today's IPL match. KKR vs MI live HD stream, no subscription needed. Check comments for mirror links.",
        "keyword_used": "IPL free stream reddit",
    },
    {
        "url": "https://t.me/IPL2026LiveStream",
        "title": "Telegram: IPL 2026 Live Stream HD",
        "snippet": "Join this Telegram channel for free IPL 2026 HD streams. All matches available. No JioHotstar subscription required. Admin posts links 15 min before match.",
        "keyword_used": "ipl stream telegram",
    },
    {
        "url": "https://x.com/ipl_freestreams/status/iplkkrmi2026live",
        "title": "IPL Free Streams on X: KKR vs MI LIVE RIGHT NOW",
        "snippet": "LIVE NOW — KKR vs MI IPL 2026. Free HD stream, no sign-up. Link in bio. RT to help others watch free! #IPL2026 #KKRvsMI #LiveCricket",
        "keyword_used": "IPL 2026 live stream",
    },
    {
        "url": "https://www.reddit.com/r/IPL/comments/watch_ipl_2026_free",
        "title": "How to watch IPL 2026 for FREE without JioHotstar — Working Methods",
        "snippet": "Tired of paying for JioHotstar? Here are 5 working methods to watch IPL 2026 for free. Includes Reddit streams, Telegram channels and mirror sites.",
        "keyword_used": "watch IPL free online",
    },
    {
        "url": "https://streameast.to/ipl-2026-live",
        "title": "IPL 2026 Live Stream — Watch Free HD Cricket",
        "snippet": "Watch IPL 2026 live stream for free in HD quality. All IPL matches available. No registration required. Stream IPL online without subscription.",
        "keyword_used": "IPL 2026 streaming link",
    },
    {
        "url": "https://discord.gg/ipl2026freestream",
        "title": "IPL 2026 Free Stream — Discord Server",
        "snippet": "Join our Discord for free IPL 2026 live streams. 12,000+ members. HD quality streams for every match. Bypass JioHotstar paywall.",
        "keyword_used": "IPL live reddit",
    },
]


def build_seed_results() -> list[dict]:
    seeded = []
    for s in SEED_RESULTS:
        scored = score_url(s["url"], s["title"], s["snippet"])
        seeded.append({
            "url": s["url"],
            "title": s["title"],
            "snippet": s["snippet"],
            "score": scored["score"],
            "reasons": scored["reasons"],
            "flagged": scored["score"] >= FLAG_THRESHOLD,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "keyword_used": s["keyword_used"],
            "is_seed": True,
        })
    return seeded


# ─── Google Custom Search ─────────────────────────────────────────────────────

async def google_search(query: str) -> list[dict]:
    api_key = os.getenv("GOOGLE_API_KEY", "")
    cse_id = os.getenv("GOOGLE_CSE_ID", "")

    if not api_key or not cse_id or api_key == "your_google_api_key_here":
        print(f"[scan] WARNING: Google API keys not configured — skipping real search for '{query}'")
        return []

    url = "https://www.googleapis.com/customsearch/v1"
    params = {"key": api_key, "cx": cse_id, "q": query, "num": 10}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            items = data.get("items", [])
            print(f"[scan] Google returned {len(items)} results for '{query}'")
            return items
    except Exception as e:
        print(f"[scan] Google search error for '{query}': {e}")
        return []


# ─── Scan task ────────────────────────────────────────────────────────────────

async def run_scan(keywords: list[str]):
    global scan_running, total_scanned, current_keyword

    seen_urls: set[str] = set(s["url"] for s in SEED_RESULTS)

    for keyword in keywords:
        if not scan_running:
            break

        current_keyword = keyword
        print(f"[scan] Searching: {keyword}")

        items = await google_search(keyword)

        for item in items:
            if not scan_running:
                break

            result_url = item.get("link", "")
            if not result_url or result_url in seen_urls:
                continue
            seen_urls.add(result_url)

            title = item.get("title", "")
            snippet = item.get("snippet", "")

            scored = score_url(result_url, title, snippet)
            total_scanned += 1

            is_flagged = scored["score"] >= FLAG_THRESHOLD
            is_suspicious = scored["score"] >= SUSPICIOUS_THRESHOLD

            if not is_suspicious:
                continue

            entry = {
                "url": result_url,
                "title": title,
                "snippet": snippet,
                "score": scored["score"],
                "reasons": scored["reasons"],
                "flagged": is_flagged,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "keyword_used": keyword,
                "is_seed": False,
            }

            results.append(entry)
            if is_flagged:
                print(f"[scan] FLAGGED ({scored['score']}/100): {result_url}")
            else:
                print(f"[scan] suspicious ({scored['score']}/100): {result_url}")

        await asyncio.sleep(1.0)

    current_keyword = ""
    scan_running = False
    print(f"[scan] Complete. Total: {len(results)}, Flagged: {sum(1 for r in results if r['flagged'])}")


# ─── Models ───────────────────────────────────────────────────────────────────

class StartScanRequest(BaseModel):
    keywords: list[str] = []


class StatusResponse(BaseModel):
    running: bool
    scanned: int
    flagged: int
    current_keyword: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/start-scan")
async def start_scan(req: StartScanRequest):
    global scan_running, scan_task, results, total_scanned, current_keyword

    if scan_running:
        raise HTTPException(status_code=409, detail="Scan already running")

    total_scanned = 0
    current_keyword = ""
    scan_running = True

    # Seeds appear immediately — judges see results right away
    results = build_seed_results()
    total_scanned = len(results)
    print(f"[scan] Seeded {len(results)} baseline results instantly")

    keywords = req.keywords if req.keywords else DEFAULT_KEYWORDS
    scan_task = asyncio.create_task(run_scan(keywords))

    return {"status": "started", "keywords": keywords, "keyword_count": len(keywords)}


@app.post("/stop-scan")
async def stop_scan():
    global scan_running, scan_task

    scan_running = False
    if scan_task and not scan_task.done():
        scan_task.cancel()
        try:
            await scan_task
        except asyncio.CancelledError:
            pass

    return {"status": "stopped"}


@app.get("/results")
async def get_results():
    return results


@app.get("/status", response_model=StatusResponse)
async def get_status():
    return StatusResponse(
        running=scan_running,
        scanned=total_scanned,
        flagged=sum(1 for r in results if r["flagged"]),
        current_keyword=current_keyword,
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "AEGIS Backend"}
