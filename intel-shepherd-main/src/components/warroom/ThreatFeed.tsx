import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FEED_POOL, SEVERITY_STYLES, buildFeedEntryFromFlaggedSite, type FeedEntry, type ThreatType } from "./threats";
import { play } from "@/lib/sounds";
import { usePiracyStore } from "@/store/piracyStore";

interface Props {
  onCritical: (lat: number, lng: number) => void;
}

const TIME_LABELS = ["just now", "8s ago", "14s ago", "22s ago", "31s ago", "45s ago", "1m ago", "2m ago"];

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let nextId = 0;

function makeEntry(): FeedEntry {
  const tpl = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)];
  return { ...tpl, id: `e-${nextId++}`, time: TIME_LABELS[0] };
}

export function ThreatFeed({ onCritical }: Props) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const flaggedSites = usePiracyStore((s) => s.flaggedSites);
  const seenUrls = useRef<Set<string>>(new Set());

  // Boot: pre-populate with shuffled pool
  useEffect(() => {
    const initial = shuffle(FEED_POOL).slice(0, 6).map((tpl, i) => ({
      ...tpl,
      id: `e-${nextId++}`,
      time: TIME_LABELS[i] || "2m ago",
    }));
    setEntries(initial);
    play("feed_boot");
  }, []);

  // Auto-append fake entries every 2–3s
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      const entry = makeEntry();
      setEntries((prev) => {
        const next = [entry, ...prev].slice(0, 12).map((e, i) => ({
          ...e,
          time: i === 0 ? "just now" : TIME_LABELS[Math.min(i, TIME_LABELS.length - 1)],
        }));
        return next;
      });
      if (entry.type === "CRITICAL") {
        play("critical_entry");
        onCritical(entry.lat, entry.lng);
      } else if (entry.type === "RESOLVED") {
        play("resolved");
      } else if (entry.type === "ELEVATED") {
        play("elevated");
      }
      timeoutId = setTimeout(tick, 2000 + Math.random() * 1000);
    };
    timeoutId = setTimeout(tick, 2500);
    return () => clearTimeout(timeoutId);
  }, [onCritical]);

  // Merge real flagged sites into the feed
  useEffect(() => {
    const newSites = flaggedSites.filter((s) => !seenUrls.current.has(s.url));
    if (newSites.length === 0) return;

    newSites.forEach((site) => {
      seenUrls.current.add(site.url);
      const realEntry = buildFeedEntryFromFlaggedSite(site, `real-${nextId++}`);

      setEntries((prev) => {
        const next = [realEntry, ...prev].slice(0, 12).map((e, i) => ({
          ...e,
          time: i === 0 ? "just now" : TIME_LABELS[Math.min(i, TIME_LABELS.length - 1)],
        }));
        return next;
      });

      if (realEntry.type === "CRITICAL") {
        play("critical_entry");
        onCritical(realEntry.lat, realEntry.lng);
      }
    });
  }, [flaggedSites, onCritical]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
      className="w-[320px] flex-shrink-0 glass-elevated scanlines flex flex-col h-full overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex">
            <span className="w-2 h-2 rounded-full bg-green-safe" style={{ boxShadow: "0 0 8px hsl(var(--green-safe))" }} />
            <span className="absolute inset-0 rounded-full bg-green-safe animate-ping opacity-70" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-primary">
            LIVE THREAT FEED
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
          IPL 2026
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <FeedRow key={e.id} entry={e} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FeedRow({ entry }: { entry: FeedEntry }) {
  const s = SEVERITY_STYLES[entry.type as ThreatType];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="px-4 py-2.5 border-b border-border-subtle/50 hover:bg-text-primary/5 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="relative inline-flex mt-1.5 flex-shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${s.color} ${s.pulse}`}
            style={{ boxShadow: `0 0 8px ${s.bg}` }}
          />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[13px] font-semibold text-text-primary truncate">
              {entry.city}
            </span>
            <span className="font-mono text-[10px] text-text-muted flex-shrink-0">{entry.time}</span>
          </div>
          <p className="font-mono text-[11px] text-text-secondary mt-0.5 truncate">{entry.msg}</p>
          {entry.realUrl && (
            <p className="font-mono text-[9px] text-blue-intel/60 mt-0.5 truncate">◆ REAL DETECTION</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
