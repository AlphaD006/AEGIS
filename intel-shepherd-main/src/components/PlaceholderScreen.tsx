import { motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
  title: string;
  subtitle?: string;
  /** data-demo target id this screen exposes for the demo guide ring */
  demoTarget?: string;
  /** Tailwind text color class for the title accent */
  accent?: "red" | "blue" | "green" | "orange" | "purple";
}

const accentMap = {
  red: { color: "text-red-critical", glow: "text-glow-red" },
  blue: { color: "text-blue-intel", glow: "text-glow-blue" },
  green: { color: "text-green-safe", glow: "text-glow-green" },
  orange: { color: "text-orange-high", glow: "" },
  purple: { color: "text-purple-ai", glow: "" },
};

/**
 * Branded placeholder screen for unbuilt routes.
 * Includes scanline panel, animated radar, and "Building in next segment" status.
 */
export function PlaceholderScreen({ title, subtitle = "Building in next segment", demoTarget, accent = "red" }: Props) {
  const a = accentMap[accent];

  // Set page title
  useEffect(() => {
    const prev = document.title;
    document.title = `AEGIS — ${title}`;
    return () => { document.title = prev; };
  }, [title]);

  return (
    <div className="relative min-h-full p-6 md:p-10" data-demo={demoTarget}>
      {/* Backdrop radar */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.07]">
        <motion.div
          className="w-[60vmin] h-[60vmin] rounded-full border border-text-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, hsl(var(--blue-intel) / 0.4) 30deg, transparent 60deg)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-3xl mx-auto mt-12"
      >
        {/* Breadcrumb */}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted mb-3">
          AEGIS // SECTOR // {title.toUpperCase()}
        </p>

        {/* Title */}
        <h1 className={`font-display font-bold text-5xl md:text-6xl mb-4 ${a.color} ${a.glow}`}>
          {title}
        </h1>

        {/* Status panel */}
        <div className="glass-elevated scanlines rounded-xl p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative inline-flex">
              <span className="w-2.5 h-2.5 rounded-full bg-green-safe" style={{ boxShadow: "0 0 10px hsl(var(--green-safe))" }} />
              <span className="absolute inset-0 rounded-full bg-green-safe animate-ping opacity-60" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-text-secondary">
              MODULE STATUS
            </span>
          </div>
          <p className="font-mono text-sm text-text-primary mb-1">
            ◆ {subtitle}
          </p>
          <p className="font-mono text-xs text-text-muted">
            All telemetry online. Awaiting payload deployment.
          </p>

          {/* Loading bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              <span>SYSTEM CALIBRATION</span>
              <span className="text-blue-intel">73.2%</span>
            </div>
            <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-intel to-purple-ai"
                initial={{ width: "0%" }}
                animate={{ width: "73.2%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ boxShadow: "0 0 8px hsl(var(--blue-intel) / 0.6)" }}
              />
            </div>
          </div>
        </div>

        {/* Telemetry grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { k: "UPTIME", v: "99.998%" },
            { k: "LATENCY", v: "12ms" },
            { k: "NODES", v: "1,247" },
          ].map((t) => (
            <div key={t.k} className="glass scanlines rounded-lg p-3">
              <p className="font-mono text-[9px] uppercase tracking-widest text-text-muted">{t.k}</p>
              <p className="font-mono text-lg text-text-primary mt-1">{t.v}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
