# AEGIS — IPL 2026 Setup & Running Guide

## Project Structure

```
project-root/
├── backend/               ← FastAPI Python backend (NEW)
│   ├── main.py            ← Core API server + scan engine
│   ├── gemini.py          ← Gemini AI DMCA notice generator
│   ├── email_sender.py    ← SMTP emailer for JioHotstar
│   ├── dmca_router.py     ← /api/generate-dmca endpoint
│   ├── requirements.txt
│   └── .env               ← API keys (fill this in!)
│
└── intel-shepherd-main/   ← React frontend (MODIFIED)
    └── src/
        ├── store/
        │   └── piracyStore.ts     ← NEW: real scan state store
        ├── pages/
        │   └── Prediction.tsx     ← NEW: full working prediction page
        └── components/
            ├── warroom/
            │   ├── threats.ts         ← UPDATED: IPL data + real entries
            │   ├── ThreatFeed.tsx     ← UPDATED: shows real flagged sites
            │   └── MetricsSidebar.tsx ← UPDATED: real stream count
            └── action/
                └── DMCATab.tsx        ← UPDATED: real Gemini API + email
```

---

## Step 1 — Get API Keys

### A. Google Custom Search API (for scan engine)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Custom Search API**
3. Go to **Credentials** → Create API Key → copy it
4. Go to [cse.google.com/cse/all](https://cse.google.com/cse/all)
5. Click **New Search Engine** → set "Search the entire web" → Create
6. Copy the **Search Engine ID** (cx value)

### B. Google Gemini API (for DMCA notice generation)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → Create API key in new project
3. Copy the key (free tier is enough — 60 req/min)

### C. Gmail App Password (for sending DMCA email)
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** if not already
3. Go to **App passwords** → Select "Mail" → Generate
4. Copy the 16-character password

---

## Step 2 — Configure Backend

Edit `backend/.env`:

```env
GOOGLE_API_KEY=AIza...your_key_here
GOOGLE_CSE_ID=123456789012345678901:abc...
GEMINI_API_KEY=AIza...your_gemini_key
DMCA_RECIPIENT_EMAIL=copyright@jiohotstar.com
DMCA_SENDER_EMAIL=youremail@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

> ⚠️ `DMCA_RECIPIENT_EMAIL` is already set to `copyright@jiohotstar.com`. The email will be sent there when you generate a notice from Action Center.

---

## Step 3 — Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Test it: [http://localhost:8000/health](http://localhost:8000/health) → should return `{"status":"ok"}`

---

## Step 4 — Start the Frontend

```bash
cd intel-shepherd-main
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## How It Works End-to-End

### 1. Prediction Engine
- Go to **/prediction** in the sidebar
- Click **START SCAN** (green glowing button)
- Backend searches Google for 10 IPL piracy keywords
- Each result is scored 0–100 based on piracy keyword weights
- Sites scoring ≥ 50 appear in the table, progressively
- Colors: Yellow (50–69) · Orange (70–89) · Red (90–100)
- Frontend polls `/results` and `/status` every 3 seconds

### 2. War Room (real data blend)
- As the scan runs, flagged sites automatically appear in the **Live Threat Feed**
- They blend seamlessly with the existing animated entries
- The **Unauthorized Streams** counter increases with real flagged count

### 3. Action Center → DMCA Tab
- From Prediction, click **SEND TO ACTION CENTER** on any flagged site
- URL is copied to clipboard automatically
- In Action Center → DMCA tab: paste the URL (or it auto-fills)
- Click **GENERATE NOTICE**
- Gemini AI generates a real, legally-formatted DMCA takedown notice
- The notice is automatically emailed to `copyright@jiohotstar.com`
- Confirmation shown: `◆ DMCA NOTICE SENT TO: copyright@jiohotstar.com`
- Advance the status tracker: DRAFTED → SUBMITTED → ACKNOWLEDGED → ACTIONED

### 4. Propagation Graph
- Shows "IPL 2026 — Live Piracy Mirror Network"
- Stats panel shows real detected hostnames from the scan
- Click any node → Intelligence panel → AEGIS INTERVENE for cascade collapse animation

---

## If Backend Is Offline

All pages show their original fake/demo data. Nothing breaks.
The Prediction page shows: `◆ BACKEND OFFLINE — start the FastAPI server on port 8000`
The DMCA tab falls back to a local template notice.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/start-scan` | Start IPL piracy scan |
| POST | `/stop-scan` | Stop running scan |
| GET | `/results` | All scan results |
| GET | `/status` | Scan status + counts |
| POST | `/api/generate-dmca` | Generate + email DMCA notice |

---

## Troubleshooting

**Scan returns 0 results:**
- Check `GOOGLE_API_KEY` and `GOOGLE_CSE_ID` in `.env`
- Make sure the Custom Search Engine is set to "Search the entire web"
- Free tier allows 100 searches/day — restart tomorrow if exceeded

**Gemini notice generation fails:**
- Check `GEMINI_API_KEY` in `.env`
- Falls back to a local template notice automatically — UI still works

**Email not sending:**
- Check `DMCA_SENDER_EMAIL` and `SMTP_PASSWORD` (use App Password, not regular password)
- `sent: false` in the response means email failed but notice was still generated

**Frontend can't reach backend:**
- Make sure backend is on port 8000 (`uvicorn main:app --port 8000`)
- CORS is already configured for `localhost:5173` and `localhost:8080`
