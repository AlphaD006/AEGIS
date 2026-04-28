import { motion } from "framer-motion";

/**
 * Subtle ghosted globe. Pure SVG, no external deps.
 * Rendered behind the AEGIS logo at low opacity.
 */
export function GhostGlobe({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 600 600"
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 0.18, scale: 1 }}
      transition={{ duration: 1.2, delay: 2, ease: "easeOut" }}
      aria-hidden
    >
      <defs>
        <radialGradient id="atmos" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="hsl(var(--blue-intel))" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(var(--blue-intel))" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id="globe" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(var(--blue-intel))" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(var(--bg-void))" stopOpacity="0.95" />
        </radialGradient>
      </defs>

      {/* Atmospheric glow */}
      <circle cx="300" cy="300" r="270" fill="url(#atmos)" />
      {/* Globe */}
      <circle cx="300" cy="300" r="240" fill="url(#globe)" stroke="hsl(var(--blue-intel) / 0.3)" strokeWidth="1" />

      {/* Latitude lines */}
      {[-60, -30, 0, 30, 60].map((lat) => {
        const ry = 240 * Math.cos((lat * Math.PI) / 180);
        const cy = 300 + lat * 0.6;
        return (
          <ellipse
            key={lat}
            cx="300"
            cy={cy}
            rx="240"
            ry={Math.abs(ry) * 0.35}
            fill="none"
            stroke="hsl(var(--blue-intel) / 0.25)"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Longitude lines */}
      {[0, 30, 60, 90, 120, 150].map((rot) => (
        <ellipse
          key={rot}
          cx="300"
          cy="300"
          rx={240 * Math.abs(Math.cos((rot * Math.PI) / 180)) || 0.5}
          ry="240"
          fill="none"
          stroke="hsl(var(--blue-intel) / 0.18)"
          strokeWidth="0.8"
        />
      ))}

      {/* Scattered nodes */}
      {[
        [180, 220], [380, 180], [280, 320], [420, 360], [220, 400], [340, 250],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--red-critical))" opacity="0.7">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </motion.svg>
  );
}
