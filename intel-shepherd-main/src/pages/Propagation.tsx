import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PropagationGraph } from "@/components/propagation/PropagationGraph";
import { IntelligencePanel } from "@/components/propagation/IntelligencePanel";
import { NODES, NODE_BY_ID, COLLAPSE_ORDER } from "@/components/propagation/nodes";
import { play } from "@/lib/sounds";
import { GitBranch, Filter, Crosshair } from "lucide-react";
import { usePiracyStore } from "@/store/piracyStore";

const TOTAL_NODES = NODES.length; // 13

export default function Propagation() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [collapsing, setCollapsing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    document.title = "AEGIS — Propagation Graph";
  }, []);

  // Boot tone after entry animation
  useEffect(() => {
    const t = window.setTimeout(() => {
      play("feed_boot");
      setBootDone(true);
    }, 1800);
    return () => window.clearTimeout(t);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleIntervene = useCallback(() => {
    if (collapsing) return;
    setCollapsing(true);
    play("intervene");

    // Origin flicker is implicit — we collapse leaves first, origin last.
    // Here we collapse 12 downstream nodes 400ms apart in COLLAPSE_ORDER.
    COLLAPSE_ORDER.forEach((id, idx) => {
      window.setTimeout(() => {
        setCollapsedIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        play("critical_entry");
      }, 400 * (idx + 1));
    });

    // After all 12 collapsed, also retire origin then show banner
    const allCollapseAt = 400 * (COLLAPSE_ORDER.length + 1);
    window.setTimeout(() => {
      setCollapsedIds((prev) => {
        const next = new Set(prev);
        next.add("origin");
        return next;
      });
      play("dmca_done");
      setSuccess(true);
    }, allCollapseAt);

    // Reset after 5s
    window.setTimeout(() => {
      setSuccess(false);
      setCollapsedIds(new Set());
      setCollapsing(false);
      play("resolved");
    }, allCollapseAt + 5000);
  }, [collapsing]);

  const selectedNode = selectedId ? NODE_BY_ID[selectedId] ?? null : null;

  // Real flagged sites from piracy store — show in stats overlay
  const flaggedSites = usePiracyStore((s) => s.flaggedSites);
  const realOriginLabel = flaggedSites.length > 0
    ? (() => { try { return new URL(flaggedSites[0].url).hostname; } catch { return "DDoS-Guard / RU"; } })()
    : "DDoS-Guard / RU";
  const totalLiveNodes = TOTAL_NODES - collapsedIds.size + flaggedSites.length;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-void" data-demo="propagation">
      {/* Graph fills entire space */}
      <div className="absolute inset-0">
        <PropagationGraph
          selectedId={selectedId}
          onSelect={handleSelect}
          collapsedIds={collapsedIds}
        />
      </div>

      {/* Toolbar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.4, ease: "easeOut" }}
        className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 z-10 pointer-events-none"
      >
        <div className="glass-elevated scanlines rounded-lg px-4 py-2.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-blue-intel" />
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted">
              AEGIS // PROPAGATION
            </p>
          </div>
          <p className="font-display text-base text-text-primary mt-0.5">
            IPL 2026 — Live Piracy Mirror Network
          </p>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <ToolbarButton icon={<Filter size={12} />} label="All Tiers" />
          <ToolbarButton icon={<Crosshair size={12} />} label="Auto-Track" active />
          <div className="glass rounded-md px-3 py-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-safe" style={{ boxShadow: "0 0 8px hsl(var(--green-safe))" }} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
              {bootDone ? "LIVE" : "BOOTING"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 0.4 }}
        className="absolute bottom-4 left-4 glass-elevated rounded-lg px-4 py-3 z-10"
      >
        <p className="font-mono text-[9px] uppercase tracking-widest text-text-muted mb-2">
          Tier Legend
        </p>
        <div className="flex items-center gap-4">
          <LegendDot color="#ff2d2d" label="Origin" />
          <LegendDot color="#ff6a00" label="Mirror" />
          <LegendDot color="#f5c518" label="Leaf" />
        </div>
      </motion.div>

      {/* Stats readout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 0.4 }}
        className="absolute bottom-4 right-4 glass-elevated rounded-lg px-4 py-3 z-10 font-mono text-[10px] uppercase tracking-widest"
      >
        <div className="flex items-center gap-6">
          <Stat label="Nodes" value={`${TOTAL_NODES - collapsedIds.size}/${totalLiveNodes}`} accent="text-blue-intel" />
          <Stat label="Active Edges" value="12" accent="text-orange-high" />
          <Stat label="Origin" value={realOriginLabel} accent="text-red-critical" />
        </div>
      </motion.div>

      {/* Intelligence side panel */}
      <IntelligencePanel
        node={selectedNode}
        open={selectedId !== null}
        collapsing={collapsing}
        collapsedCount={collapsedIds.size}
        totalNodes={TOTAL_NODES}
        onClose={handleClose}
        onIntervene={handleIntervene}
      />

      {/* Success banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="banner"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="absolute top-0 left-0 right-0 z-30 py-3 text-center font-display font-bold tracking-[0.25em] uppercase text-sm"
            style={{
              background: "linear-gradient(90deg, hsl(var(--green-safe) / 0.15), hsl(var(--green-safe) / 0.35), hsl(var(--green-safe) / 0.15))",
              borderBottom: "1px solid hsl(var(--green-safe) / 0.6)",
              color: "hsl(var(--green-safe))",
              textShadow: "0 0 12px hsl(var(--green-safe) / 0.7)",
            }}
          >
            ⚡ Network Neutralised — 94% Collapse Achieved
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`glass rounded-md px-3 py-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
        active ? "text-red-critical border-red-critical/40" : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
        {label}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div>
      <p className="text-text-muted">{label}</p>
      <p className={`mt-0.5 ${accent}`}>{value}</p>
    </div>
  );
}
