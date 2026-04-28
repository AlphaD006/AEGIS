import { motion } from "framer-motion";

const TEXT = "PROTECT. DETECT. RECOVER.";

/**
 * Tagline: types character by character starting at t=1s, ~1s total.
 */
export function Tagline() {
  return (
    <div className="font-display text-text-secondary text-xs md:text-sm uppercase" style={{ letterSpacing: "0.3em" }}>
      <span className="sr-only">{TEXT}</span>
      <span aria-hidden className="inline-flex">
        {TEXT.split("").map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.04, delay: 1 + i * 0.035 }}
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        ))}
      </span>
      {/* Caret */}
      <motion.span
        className="inline-block w-[2px] h-3 bg-red-critical ml-1 align-middle"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 2 }}
      />
    </div>
  );
}
