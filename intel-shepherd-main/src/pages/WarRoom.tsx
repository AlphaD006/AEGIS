import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "@/components/warroom/Globe";
import { MetricsSidebar } from "@/components/warroom/MetricsSidebar";
import { ThreatFeed } from "@/components/warroom/ThreatFeed";
import { MatchBar } from "@/components/warroom/MatchBar";
import { useThreatStore } from "@/store/threatStore";
import { play } from "@/lib/sounds";

interface Snap {
  lat: number;
  lng: number;
  ts: number;
}

const WarRoom = () => {
  const [snap, setSnap] = useState<Snap | undefined>();
  const threatLevel = useThreatStore((s) => s.level);
  const [pulseBadge, setPulseBadge] = useState(false);

  useEffect(() => {
    document.title = "AEGIS — War Room";
    const t = setTimeout(() => play("boot"), 1600);
    const t2 = setTimeout(() => setPulseBadge(true), 1400);
    const t3 = setTimeout(() => setPulseBadge(false), 2400);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleCritical = (lat: number, lng: number) => {
    setSnap({ lat, lng, ts: Date.now() });
  };

  const badgeStyle =
    threatLevel === "CRITICAL"
      ? "bg-red-critical/20 text-red-critical border-red-critical/50"
      : threatLevel === "ELEVATED"
        ? "bg-orange-high/20 text-orange-high border-orange-high/50"
        : "bg-green-safe/20 text-green-safe border-green-safe/50";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="relative h-[calc(100vh-3.5rem)] overflow-hidden bg-void"
      data-demo="war-room"
    >
      <div className="flex h-full w-full">
        {/* Left: Threat Feed */}
        <ThreatFeed onCritical={handleCritical} />

        {/* Center: Globe + top badge + bottom matches */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Top badge bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.4 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              animate={pulseBadge ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.6 }}
              className={`font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 rounded border ${badgeStyle} backdrop-blur-md`}
              style={{
                boxShadow:
                  threatLevel === "CRITICAL"
                    ? "0 0 24px hsl(var(--red-critical) / 0.5)"
                    : threatLevel === "ELEVATED"
                      ? "0 0 24px hsl(var(--orange-high) / 0.4)"
                      : "0 0 16px hsl(var(--green-safe) / 0.3)",
              }}
            >
              ◆ THREAT LEVEL: {threatLevel}
            </motion.div>
          </motion.div>

          {/* Globe area */}
          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 80, damping: 18 }}
              className="absolute inset-0"
            >
              <Globe snapTarget={snap} />
            </motion.div>

            {/* Corner readouts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="absolute bottom-3 left-3 font-mono text-[10px] text-text-muted uppercase tracking-widest space-y-0.5 pointer-events-none"
            >
              <div>◆ AEGIS // WAR ROOM</div>
              <div className="text-blue-intel/60">◆ 8 ACTIVE THREATS</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="absolute bottom-3 right-3 font-mono text-[10px] text-text-muted uppercase tracking-widest text-right space-y-0.5 pointer-events-none"
            >
              <div>◆ TELEMETRY ONLINE</div>
              <div className="text-green-safe/60">◆ 1,247 NODES</div>
            </motion.div>
          </div>

          {/* Match bar */}
          <MatchBar />
        </div>

        {/* Right: Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="border-l border-border-subtle bg-bg-surface/30 flex"
        >
          <MetricsSidebar />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WarRoom;
