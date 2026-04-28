import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Square, ExternalLink, Info } from "lucide-react";
import { usePiracyStore, FlaggedSite } from "@/store/piracyStore";
import { play } from "@/lib/sounds";

// ─── Scoring logic display data ───────────────────────────────────────────────

const SCORE_WEIGHTS = [
  { kw: "pirate", w: 25 }, { kw: "illegal", w: 25 }, { kw: "m3u8", w: 22 },
  { kw: "bypass", w: 22 }, { kw: "torrent", w: 22 }, { kw: "no subscription", w: 20 },
  { kw: "leaked", w: 18 }, { kw: "crack", w: 18 }, { kw: "unauthorized", w: 16 },
  { kw: "telegram", w: 14 }, { kw: "mirror", w: 14 }, { kw: "streaming link", w: 12 },
  { kw: "stream", w: 12 }, { kw: "unlocked", w: 12 }, { kw: "live", w: 10 },
  { kw: "free", w: 10 }, { kw: "watch online", w: 10 }, { kw: "discord", w: 10 },
];

const DOMAIN_BONUSES = [
  { domain: "t.me / telegram.me", bonus: 30 },
  { domain: "crackstreams.*", bonus: 28 },
  { domain: "sportsurge.*", bonus: 26 },
  { domain: "streameast.to", bonus: 25 },
  { domain: "buffstreams.*", bonus: 25 },
  { domain: "reddit.com", bonus: 20 },
  { domain: "discord.gg", bonus: 20 },
  { domain: "twitter.com / x.com", bonus: 18 },
  { domain: "pastebin.com", bonus: 16 },
];

// ─── Score badge colour ───────────────────────────────────────────────────────

function scoreBadgeStyle(score: number) {
  if (score >= 90) return { bg: "hsl(var(--red-critical) / 0.15)", border: "hsl(var(--red-critical))", color: "hsl(var(--red-critical))" };
  if (score >= 70) return { bg: "hsl(var(--orange-high) / 0.15)", border: "hsl(var(--orange-high))", color: "hsl(var(--orange-high))" };
  if (score >= 25) return { bg: "hsl(var(--yellow-medium) / 0.15)", border: "hsl(var(--yellow-medium))", color: "hsl(var(--yellow-medium))" };
  return { bg: "hsl(var(--blue-intel) / 0.15)", border: "hsl(var(--blue-intel))", color: "hsl(var(--blue-intel))" };
}

// ─── Animated dots for scan active bar ───────────────────────────────────────

function AnimatedDots() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }}
      className="inline-block"
    >
      ···
    </motion.span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Prediction() {
  const navigate = useNavigate();
  const {
    flaggedSites, scanRunning, totalScanned, totalFlagged,
    currentKeyword, backendOnline, startScan, stopScan, checkBackend,
  } = usePiracyStore();

  // Check backend health on mount
  useEffect(() => {
    document.title = "AEGIS — Piracy Prediction";
    checkBackend();
  }, [checkBackend]);

  const handleStart = () => {
    play("ac_gavel");
    startScan();
  };

  const handleStop = () => {
    play("resolved");
    stopScan();
  };

  const handleSendToAction = async (site: FlaggedSite) => {
    try {
      await navigator.clipboard.writeText(site.url);
    } catch {
      // clipboard may fail in some envs — silent
    }
    play("ac_paste");
    navigate("/action-center");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-void px-6 py-8 max-w-[1400px] mx-auto"
      data-demo="prediction"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-text-primary">
            PIRACY PREDICTION ENGINE
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-muted mt-1">
            ◆ IPL 2026 — REAL-TIME THREAT DETECTION
          </p>
          {!backendOnline && !scanRunning && (
            <p className="font-mono text-[10px] text-orange-high/70 mt-1">
              ◆ BACKEND OFFLINE — start the FastAPI server on port 8000 to enable live scanning
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Live counter */}
          {(scanRunning || totalFlagged > 0) && (
            <div className="font-mono text-[11px] uppercase tracking-widest text-text-muted glass rounded-md px-3 py-2">
              <span className="text-text-secondary">Scanned:</span>{" "}
              <span className="text-text-primary">{totalScanned}</span>
              <span className="text-border-subtle mx-2">|</span>
              <span className="text-text-secondary">Flagged:</span>{" "}
              <span className="text-red-critical">{totalFlagged}</span>
            </div>
          )}

          {/* Stop button — visible only when running */}
          <AnimatePresence>
            {scanRunning && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md font-mono text-sm font-semibold uppercase tracking-wider border transition-all"
                style={{
                  background: "hsl(var(--red-critical) / 0.1)",
                  borderColor: "hsl(var(--red-critical) / 0.6)",
                  color: "hsl(var(--red-critical))",
                  boxShadow: "0 0 16px hsl(var(--red-critical) / 0.2)",
                }}
              >
                <Square size={14} /> STOP SCAN
              </motion.button>
            )}
          </AnimatePresence>

          {/* Start button */}
          <AnimatePresence>
            {!scanRunning && (
              <motion.button
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1, scale: 1,
                  boxShadow: [
                    "0 0 10px hsl(var(--green-safe) / 0.3)",
                    "0 0 28px hsl(var(--green-safe) / 0.7)",
                    "0 0 10px hsl(var(--green-safe) / 0.3)",
                  ],
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ boxShadow: { duration: 2, repeat: Infinity }, opacity: { duration: 0.2 } }}
                onClick={handleStart}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-md font-mono text-sm font-semibold uppercase tracking-wider border"
                style={{
                  background: "hsl(var(--green-safe) / 0.1)",
                  borderColor: "hsl(var(--green-safe))",
                  color: "hsl(var(--green-safe))",
                }}
              >
                <Play size={14} /> START SCAN
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Scan status bar ── */}
      <AnimatePresence>
        {scanRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-md px-4 py-3 font-mono text-[12px] flex items-center justify-between"
            style={{
              background: "hsl(var(--green-safe) / 0.07)",
              border: "1px solid hsl(var(--green-safe) / 0.3)",
              color: "hsl(var(--green-safe))",
            }}
          >
            <span>
              ◆ SCAN ACTIVE — SEARCHING FOR IPL PIRACY <AnimatedDots />
            </span>
            {currentKeyword && (
              <span className="text-text-muted text-[10px] truncate max-w-[320px]">
                QUERY: "{currentKeyword}"
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* ── Left: Flagged Sites Table or idle state ── */}
        <div>
          {flaggedSites.length === 0 && !scanRunning ? (
            /* Empty / idle state */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-[400px] glass rounded-md"
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="font-mono text-sm text-text-muted uppercase tracking-widest text-center"
              >
                ◆ SYSTEM IDLE<br />
                <span className="text-[11px]">PRESS START SCAN TO BEGIN IPL PIRACY DETECTION</span>
              </motion.div>
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                className="mt-4 font-mono text-green-safe text-lg"
              >
                _
              </motion.div>
            </motion.div>
          ) : (
            <div className="glass rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                  ◆ FLAGGED PIRACY SITES
                </span>
                <span className="font-mono text-[11px] text-red-critical">
                  {flaggedSites.length} DETECTED
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      {["SCORE", "URL", "TOP REASON", "KEYWORD", "TIME", "ACTION"].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {flaggedSites.map((site, i) => (
                        <SiteRow key={site.url} site={site} idx={i} onAction={handleSendToAction} />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Scoring logic panel ── */}
        <div className="glass rounded-md p-4 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Info size={12} className="text-blue-intel" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
              ◆ SCORING LOGIC
            </span>
          </div>
          <p className="font-mono text-[10px] text-text-muted mb-3 leading-relaxed">
            Each result scored 0–100. Sites scoring ≥ 25 are flagged as piracy threats. Domain bonuses applied automatically.
          </p>

          <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted mb-2">Keywords</div>
          <div className="space-y-1.5 mb-4">
            {SCORE_WEIGHTS.map(({ kw, w }) => (
              <div key={kw} className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-text-secondary truncate">"{kw}"</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${(w / 30) * 48}px`,
                      background: w >= 22 ? "hsl(var(--red-critical))" : w >= 14 ? "hsl(var(--orange-high))" : "hsl(var(--blue-intel))",
                      opacity: 0.7,
                    }}
                  />
                  <span className="font-mono text-[10px] text-text-muted w-6 text-right">+{w}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted mb-2 pt-3 border-t border-border-subtle">
            Domain Bonuses
          </div>
          <div className="space-y-1 mb-4">
            {DOMAIN_BONUSES.map(({ domain, bonus }) => (
              <div key={domain} className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-orange-high/80 truncate">{domain}</span>
                <span className="font-mono text-[10px] text-text-muted flex-shrink-0">+{bonus}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border-subtle">
            <div className="font-mono text-[10px] text-text-muted space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--blue-intel))" }} />
                <span>10–24 = Suspicious signal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--yellow-medium))" }} />
                <span>25–69 = Potential piracy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--orange-high))" }} />
                <span>70–89 = High risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--red-critical))" }} />
                <span>90–100 = Critical piracy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Table row component ──────────────────────────────────────────────────────

function SiteRow({
  site, idx, onAction,
}: {
  site: FlaggedSite;
  idx: number;
  onAction: (s: FlaggedSite) => void;
}) {
  const badge = scoreBadgeStyle(site.score);
  const truncUrl = site.url.length > 50 ? site.url.slice(0, 50) + "…" : site.url;
  const topReason = site.reasons[0] ?? "—";
  const ts = new Date(site.timestamp).toLocaleTimeString();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.3 }}
      className="border-t border-border-subtle/50 hover:bg-text-primary/5 transition-colors"
    >
      {/* Score badge */}
      <td className="px-4 py-3">
        <span
          className="font-mono text-[11px] font-bold px-2 py-0.5 rounded"
          style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}
        >
          {site.score}/100
        </span>
      </td>

      {/* URL */}
      <td className="px-4 py-3">
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-blue-intel/80 hover:text-blue-intel transition-colors flex items-center gap-1"
          title={site.url}
        >
          {truncUrl}
          <ExternalLink size={10} className="flex-shrink-0" />
        </a>
      </td>

      {/* Top reason */}
      <td className="px-4 py-3 font-mono text-[10px] text-text-muted max-w-[220px]">
        <span className="truncate block" title={topReason}>{topReason}</span>
      </td>

      {/* Keyword used */}
      <td className="px-4 py-3 font-mono text-[10px] text-text-secondary max-w-[160px]">
        <span className="truncate block" title={site.keyword_used}>"{site.keyword_used}"</span>
      </td>

      {/* Timestamp */}
      <td className="px-4 py-3 font-mono text-[10px] text-text-muted whitespace-nowrap">
        {ts}
      </td>

      {/* Action */}
      <td className="px-4 py-3">
        <button
          onClick={() => onAction(site)}
          className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition-all hover:bg-red-critical/10"
          style={{
            borderColor: "hsl(var(--red-critical) / 0.4)",
            color: "hsl(var(--red-critical) / 0.8)",
          }}
        >
          SEND TO ACTION CENTER
        </button>
      </td>
    </motion.tr>
  );
}
