import { motion } from "framer-motion";
import type { Persona } from "@/store/personaStore";
import { play } from "@/lib/sounds";

interface Props {
  persona: Persona;
  index: number;
  onSelect: (p: Persona) => void;
}

/**
 * Glassmorphic persona card with subtle background motif and hover glow.
 */
export function PersonaCard({ persona, index, onSelect }: Props) {
  const colorVar = `hsl(var(--${persona.color}))`;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(persona)}
      onMouseEnter={() => play("hover_persona")}
      className="group relative overflow-hidden rounded-xl glass-elevated scanlines text-left w-full md:w-72 p-6 cursor-pointer"
      style={{ borderColor: "hsl(var(--border-glow))" }}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 4 + index * 0.15,
        type: "spring",
        stiffness: 90,
        damping: 14,
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 0 32px ${colorVar.replace(")", " / 0.45)")}`,
        borderColor: colorVar,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background motif */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <PersonaMotif id={persona.id} />
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <span className="text-4xl drop-shadow-lg" aria-hidden>
            {persona.icon}
          </span>
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded border"
            style={{ borderColor: colorVar, color: colorVar }}
          >
            {persona.clearance}
          </span>
        </div>

        <div>
          <h3 className="font-display font-bold text-2xl text-text-primary tracking-wide">
            {persona.name}
          </h3>
          <p className="font-mono text-[10px] text-text-muted mt-1 uppercase" style={{ letterSpacing: "0.2em" }}>
            CLEARANCE LEVEL: {persona.clearance}
          </p>
        </div>

        <div
          className="font-mono text-xs uppercase py-2.5 px-4 rounded border text-center transition-colors group-hover:bg-white/5"
          style={{ borderColor: colorVar, color: colorVar, letterSpacing: "0.25em" }}
        >
          [ ENTER SYSTEM ]
        </div>
      </div>

      {/* Edge glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `inset 0 0 40px ${colorVar.replace(")", " / 0.15)")}`,
        }}
      />
    </motion.button>
  );
}

function PersonaMotif({ id }: { id: Persona["id"] }) {
  if (id === "uefa") {
    // Rotating UCL-style trophy silhouette
    return (
      <motion.svg
        viewBox="0 0 100 100"
        className="w-40 h-40"
        style={{ opacity: 0.05 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <path
          d="M30 20 L70 20 L72 35 Q72 55 50 60 Q28 55 28 35 Z M40 60 L60 60 L60 70 L65 70 L65 78 L35 78 L35 70 L40 70 Z"
          fill="hsl(var(--blue-intel))"
        />
        <circle cx="50" cy="40" r="3" fill="hsl(var(--bg-void))" />
      </motion.svg>
    );
  }
  if (id === "netflix") {
    // Pulsing N
    return (
      <motion.div
        className="font-display font-black text-[140px] leading-none text-red-critical"
        style={{ opacity: 0.05 }}
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        N
      </motion.div>
    );
  }
  // IPL: cricket stadium silhouette
  return (
    <svg viewBox="0 0 200 80" className="w-56 h-24" style={{ opacity: 0.05 }} aria-hidden>
      <ellipse cx="100" cy="60" rx="90" ry="18" fill="hsl(var(--orange-high))" />
      <ellipse cx="100" cy="55" rx="70" ry="14" fill="hsl(var(--bg-void))" />
      <rect x="40" y="20" width="120" height="35" fill="hsl(var(--orange-high))" opacity="0.6" />
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={42 + i * 4} y={22} width="2" height="6" fill="hsl(var(--bg-void))" />
      ))}
    </svg>
  );
}
