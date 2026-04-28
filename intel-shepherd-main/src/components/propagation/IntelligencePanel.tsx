import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, AlertTriangle, Globe, Server, Wifi, Clock, Users, Activity } from "lucide-react";
import type { PropagationNode } from "./nodes";

interface Props {
  node: PropagationNode | null;
  open: boolean;
  collapsing: boolean;
  collapsedCount: number;
  totalNodes: number;
  onClose: () => void;
  onIntervene: () => void;
}

export function IntelligencePanel({
  node,
  open,
  collapsing,
  collapsedCount,
  totalNodes,
  onClose,
  onIntervene,
}: Props) {
  return (
    <AnimatePresence>
      {open && node && (
        <motion.aside
          key="panel"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 28 }}
          className="absolute top-0 right-0 h-full w-[320px] bg-elevated border-l border-border-glow z-20 overflow-y-auto"
          style={{ background: "#080818" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle sticky top-0 bg-[#080818] z-10">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-muted">
                AEGIS // INTEL // {node.tier === "origin" ? "ORIGIN" : node.tier === "first" ? "MIRROR" : "LEAF"}
              </p>
              <p className="font-display text-sm text-text-primary mt-1 break-all">
                {node.domain}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            <Field icon={<Globe size={12} />} label="Platform" value={node.platform} />
            <Field icon={<Globe size={12} />} label="Country" value={`${node.country} (${node.countryCode})`} />
            <Field icon={<Wifi size={12} />} label="IP Address" value={node.ip} mono />
            <Field icon={<Server size={12} />} label="Hosting" value={node.hosting} />
            <Field icon={<Clock size={12} />} label="First Seen" value={node.firstSeen} mono />
            <Field icon={<Users size={12} />} label="Viewers" value={node.viewers.toLocaleString()} mono />
            <Field icon={<Activity size={12} />} label="Bandwidth" value={node.bandwidth} mono />

            {/* Impact score */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Impact Score
                </span>
                <span className="font-mono text-xs text-red-critical">
                  {node.impactScore}/100
                </span>
              </div>
              <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{
                    background: "linear-gradient(90deg, #ff6a00, #ff2d2d)",
                    boxShadow: "0 0 8px hsl(var(--red-critical) / 0.7)",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${node.impactScore}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Collapse warning */}
            <div className="rounded-md border border-orange-high/40 bg-orange-high/5 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-orange-high mt-0.5 shrink-0" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-orange-high mb-1">
                    Collapse Forecast
                  </p>
                  <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
                    {node.collapseWarning}
                  </p>
                </div>
              </div>
            </div>

            {/* Collapse counter (active during intervene) */}
            {collapsing && (
              <div className="rounded-md border border-red-critical/40 bg-red-critical/5 p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-red-critical mb-1">
                  Cascade in progress
                </p>
                <p className="font-mono text-xs text-text-primary">
                  Nodes neutralised: {collapsedCount} / {totalNodes}
                </p>
              </div>
            )}

            {/* INTERVENE button */}
            <button
              type="button"
              disabled={collapsing}
              onClick={onIntervene}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-md font-display font-bold text-sm uppercase tracking-[0.2em] text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
              style={{
                background: "linear-gradient(180deg, #ff2d2d, #b81b1b)",
                boxShadow: "0 0 24px hsl(var(--red-critical) / 0.55), inset 0 1px 0 hsl(var(--text-primary) / 0.15)",
              }}
            >
              <Zap size={14} />
              {collapsing ? "Neutralising…" : "AEGIS Intervene"}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Field({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-text-muted mb-0.5">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-xs text-text-primary break-all ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
