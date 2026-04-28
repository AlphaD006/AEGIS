import { motion } from "framer-motion";
import { useThreatStore } from "@/store/threatStore";

export function ThreatBadge() {
  const level = useThreatStore((s) => s.level);

  const map = {
    LOW: {
      label: "● LOW THREAT",
      color: "hsl(var(--green-safe))",
      glow: "hsl(var(--green-safe) / 0.4)",
      pulse: "none" as const,
    },
    ELEVATED: {
      label: "⚠ ELEVATED",
      color: "hsl(var(--orange-high))",
      glow: "hsl(var(--orange-high) / 0.5)",
      pulse: "slow" as const,
    },
    CRITICAL: {
      label: "🔴 CRITICAL",
      color: "hsl(var(--red-critical))",
      glow: "hsl(var(--red-critical) / 0.7)",
      pulse: "fast" as const,
    },
  };

  const cfg = map[level];

  return (
    <motion.div
      key={level}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-md border bg-elevated/50"
      style={{
        borderColor: cfg.color,
        color: cfg.color,
        boxShadow: `0 0 12px ${cfg.glow}`,
        animation:
          cfg.pulse === "fast"
            ? "pulse-fast 0.8s ease-in-out infinite"
            : cfg.pulse === "slow"
            ? "pulse-slow 2s ease-in-out infinite"
            : undefined,
      }}
    >
      {cfg.label}
    </motion.div>
  );
}

/** Full-screen red bleed when CRITICAL — placed at the AppShell root. */
export function CriticalBleed() {
  const level = useThreatStore((s) => s.level);
  if (level !== "CRITICAL") return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{
        boxShadow: "inset 0 0 200px 40px hsl(var(--red-critical) / 0.35)",
      }}
    />
  );
}
