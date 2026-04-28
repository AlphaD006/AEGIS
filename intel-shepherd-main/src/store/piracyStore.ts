import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FlaggedSite {
  url: string;
  title: string;
  snippet: string;
  score: number;
  reasons: string[];
  flagged: boolean;
  timestamp: string;
  keyword_used: string;
}

interface ScanStatus {
  running: boolean;
  scanned: number;
  flagged: number;
  current_keyword: string;
}

// ─── Default IPL keywords (mirrors backend) ───────────────────────────────────

const IPL_KEYWORDS = [
  "ipl 2026 live streaming free",
  "kkr vs mi live stream hd",
  "rcb vs csk live free watch",
  "ipl match today free stream",
  "watch ipl 2026 online free",
  "ipl live cricket stream reddit",
  "free hd ipl stream 2026",
  "ipl t20 live free no subscription",
  "jiohotstar bypass ipl stream",
  "ipl pirate stream telegram",
];

const BACKEND = "http://localhost:8000";

// ─── Store ────────────────────────────────────────────────────────────────────

interface PiracyState {
  flaggedSites: FlaggedSite[];
  allResults: FlaggedSite[];
  scanRunning: boolean;
  totalScanned: number;
  totalFlagged: number;
  currentKeyword: string;
  backendOnline: boolean;

  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  pollResults: () => Promise<void>;
  initPolling: () => () => void; // returns cleanup fn
  checkBackend: () => Promise<void>;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const usePiracyStore = create<PiracyState>((set, get) => ({
  flaggedSites: [],
  allResults: [],
  scanRunning: false,
  totalScanned: 0,
  totalFlagged: 0,
  currentKeyword: "",
  backendOnline: false,

  checkBackend: async () => {
    try {
      const res = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(3000) });
      set({ backendOnline: res.ok });
    } catch {
      set({ backendOnline: false });
    }
  },

  startScan: async () => {
    try {
      const res = await fetch(`${BACKEND}/start-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: IPL_KEYWORDS }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to start scan");
      }
      set({ scanRunning: true, flaggedSites: [], allResults: [], totalScanned: 0, totalFlagged: 0 });
      get().initPolling();
    } catch (e) {
      console.error("[piracyStore] startScan error:", e);
      set({ backendOnline: false });
    }
  },

  stopScan: async () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    try {
      await fetch(`${BACKEND}/stop-scan`, { method: "POST" });
    } catch (e) {
      console.error("[piracyStore] stopScan error:", e);
    }
    set({ scanRunning: false, currentKeyword: "" });
  },

  pollResults: async () => {
    try {
      // Poll /results and /status in parallel
      const [resultsRes, statusRes] = await Promise.all([
        fetch(`${BACKEND}/results`),
        fetch(`${BACKEND}/status`),
      ]);

      if (!resultsRes.ok || !statusRes.ok) return;

      const allResults: FlaggedSite[] = await resultsRes.json();
      const status: ScanStatus = await statusRes.json();

      const flaggedSites = allResults.filter((r) => r.flagged);

      set({
        allResults,
        flaggedSites,
        totalScanned: status.scanned,
        totalFlagged: status.flagged,
        currentKeyword: status.current_keyword,
        scanRunning: status.running,
        backendOnline: true,
      });

      // If backend finished scan, stop polling
      if (!status.running && pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    } catch (e) {
      console.error("[piracyStore] pollResults error:", e);
      set({ backendOnline: false });
    }
  },

  initPolling: () => {
    if (pollInterval) clearInterval(pollInterval);
    // Immediately poll once, then every 3s
    get().pollResults();
    pollInterval = setInterval(() => {
      get().pollResults();
    }, 3000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };
  },
}));
