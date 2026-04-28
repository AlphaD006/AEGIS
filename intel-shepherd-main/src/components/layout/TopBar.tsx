import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { ThreatBadge } from "./ThreatBadge";
import { SoundToggle } from "@/components/SoundToggle";
import { usePersonaStore } from "@/store/personaStore";
import { useDemoStore } from "@/store/demoStore";
import { play } from "@/lib/sounds";

export function TopBar() {
  const persona = usePersonaStore((s) => s.current);
  const startDemo = useDemoStore((s) => s.start);
  const demoActive = useDemoStore((s) => s.active);

  const initial = persona?.name?.[0] ?? "?";
  const personaColor = persona ? `hsl(var(--${persona.color}))` : "hsl(var(--text-muted))";

  return (
    <header className="relative z-20 h-14 shrink-0 bg-surface/80 backdrop-blur-md border-b border-border-subtle flex items-center px-4 gap-4">
      {/* Wordmark */}
      <div className="font-display font-bold text-xl tracking-wider">
        <span className="text-glow-red text-text-primary">A</span>
        <span className="text-text-primary">EGIS</span>
      </div>

      {/* Center event pill */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated/60 border border-border-glow max-w-full">
          <span className="relative inline-flex shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-safe" style={{ boxShadow: "0 0 8px hsl(var(--green-safe))" }} />
            <span className="absolute inset-0 rounded-full bg-green-safe animate-ping opacity-60" />
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-text-secondary truncate">
            ⚽ UCL SEMIFINAL — REAL MADRID vs BAYERN MUNICH
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 shrink-0">
        <ThreatBadge />
        <SoundToggle />

        <motion.button
          onClick={() => {
            if (!demoActive) {
              play("demo_step");
              startDemo();
            }
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-[11px] uppercase tracking-wider transition-colors ${
            demoActive
              ? "border-purple-ai text-purple-ai bg-purple-ai/10"
              : "border-border-glow text-text-secondary hover:text-text-primary hover:border-blue-intel"
          }`}
        >
          <Play size={12} />
          {demoActive ? "DEMO ON" : "DEMO MODE"}
        </motion.button>

        {/* Persona avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm border-2"
          style={{
            borderColor: personaColor,
            color: personaColor,
            boxShadow: `0 0 12px ${personaColor.replace(")", " / 0.4)")}`,
            background: "hsl(var(--bg-elevated))",
          }}
          title={persona?.name ?? "No persona"}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
