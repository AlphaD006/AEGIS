import { motion } from "framer-motion";

const LETTERS = ["A", "E", "G", "I", "S"];

/**
 * AEGIS logo: each letter assembles from scattered particles.
 * The 'A' carries a subtle red glow.
 */
export function LogoAssemble() {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {LETTERS.map((letter, i) => (
        <Letter key={letter} letter={letter} index={i} accent={letter === "A"} />
      ))}
    </div>
  );
}

function Letter({ letter, index, accent }: { letter: string; index: number; accent: boolean }) {
  // Particle starting offsets per letter
  const particles = Array.from({ length: 6 }).map((_, i) => ({
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200,
    delay: index * 0.08 + i * 0.02,
  }));

  return (
    <div className="relative">
      {/* Particles converging */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute top-1/2 left-1/2 w-1 h-1 rounded-full ${accent ? "bg-red-critical" : "bg-text-secondary"}`}
          initial={{ x: p.x, y: p.y, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: p.delay, ease: "easeOut" }}
        />
      ))}
      {/* Letter */}
      <motion.span
        className={`font-display font-bold text-7xl md:text-9xl tracking-tight ${
          accent ? "text-text-primary text-glow-red" : "text-text-primary"
        }`}
        initial={{ opacity: 0, scale: 0.6, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        {letter}
      </motion.span>
    </div>
  );
}
