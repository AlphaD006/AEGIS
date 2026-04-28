import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle } from "lucide-react";
import { play } from "@/lib/sounds";

type MatchStatus = "LIVE" | "UPCOMING" | "COMPLETED";

interface IPLMatch {
  id: string;
  home: string;
  away: string;
  status: MatchStatus;
  score: string;
  venue: string;
  viewers: number;
}

const INITIAL_MATCHES: IPLMatch[] = [
  { id: "m1", home: "KKR", away: "MI", status: "LIVE", score: "KKR 142/4 (17.2)", venue: "Eden Gardens", viewers: 41200 },
  { id: "m2", home: "RCB", away: "CSK", status: "UPCOMING", score: "19:30 IST", venue: "Chinnaswamy Stadium", viewers: 28400 },
  { id: "m3", home: "DC", away: "SRH", status: "COMPLETED", score: "DC won by 6 wkts", venue: "Arun Jaitley Stadium", viewers: 9100 },
];

const STATUS_PILL: Record<MatchStatus, string> = {
  LIVE: "bg-red-critical/20 text-red-critical border-red-critical/40",
  UPCOMING: "bg-blue-intel/20 text-blue-intel border-blue-intel/40",
  COMPLETED: "bg-green-safe/20 text-green-safe border-green-safe/40",
};

export function MatchBar() {
  const [matches, setMatches] = useState(INITIAL_MATCHES);

  // Tick up viewers on live match
  useEffect(() => {
    const i = setInterval(() => {
      setMatches((prev) =>
        prev.map((m) =>
          m.status === "LIVE"
            ? { ...m, viewers: m.viewers + Math.floor(Math.random() * 80) + 10 }
            : m
        ),
      );
    }, 1500);
    return () => clearInterval(i);
  }, []);

  const liveCount = matches.filter((m) => m.status === "LIVE").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
      className="px-3 py-2 border-t border-border-subtle bg-bg-surface/40 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          🏏 IPL 2026 — ACTIVE MATCHES
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-red-critical/80">
          {liveCount} LIVE
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {matches.map((m, idx) => (
          <MatchCard key={m.id} match={m} idx={idx} />
        ))}
      </div>
    </motion.div>
  );
}

function MatchCard({ match, idx }: { match: IPLMatch; idx: number }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 0 24px hsl(var(--blue-intel) / 0.3)" }}
      onHoverStart={() => play("card_hover")}
      transition={{ duration: 0.2 }}
      className="glass-elevated rounded-lg px-3 py-2 min-w-[260px] flex-shrink-0 relative overflow-hidden cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">🏏</span>
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
              IPL 2026 · {match.venue}
            </div>
            <div className="font-mono text-[13px] text-text-primary font-semibold truncate">
              {match.home} vs {match.away}
            </div>
          </div>
        </div>
        <StatusPill status={match.status} />
      </div>

      <div className="flex items-end justify-between mt-1.5">
        <span className="font-mono text-[12px] text-text-secondary">{match.score}</span>
        {match.status === "LIVE" && (
          <span className="font-mono text-[12px] text-text-primary tabular-nums">
            {match.viewers.toLocaleString()}
            <span className="text-[9px] text-text-muted ml-1 uppercase">viewers</span>
          </span>
        )}
      </div>

      {match.status === "LIVE" && <Heartbeat idx={idx} />}
    </motion.div>
  );
}

function StatusPill({ status }: { status: MatchStatus }) {
  return (
    <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 flex-shrink-0 ${STATUS_PILL[status]}`}>
      {status === "LIVE" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-critical animate-pulse inline-block" />
      )}
      {status === "UPCOMING" && <Clock size={8} />}
      {status === "COMPLETED" && <CheckCircle size={8} />}
      {status}
    </span>
  );
}

function Heartbeat({ idx }: { idx: number }) {
  const stroke = "hsl(var(--red-critical))";
  useEffect(() => {
    const interval = setInterval(() => play("heartbeat"), 1800 + idx * 200);
    return () => clearInterval(interval);
  }, [idx]);
  return (
    <div className="mt-1 h-5 overflow-hidden">
      <svg width="100%" height="20" viewBox="0 0 240 20" preserveAspectRatio="none">
        <motion.path
          d="M0,10 L60,10 L70,4 L80,16 L90,2 L100,18 L110,10 L240,10"
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, x: 240 }}
          animate={{ pathLength: 1, x: -240 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: idx * 0.2 }}
          style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}
        />
      </svg>
    </div>
  );
}
