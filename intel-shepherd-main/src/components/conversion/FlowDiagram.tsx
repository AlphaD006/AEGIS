import { motion } from "framer-motion";
import { useEffect } from "react";
import { play } from "@/lib/sounds";

const STEPS = [
  { icon: "🏴‍☠️", label: "Pirate visits" },
  { icon: "🚫", label: "Domain blocked" },
  { icon: "🛡️", label: "AEGIS intercepts" },
  { icon: "🧠", label: "Appetite scored" },
  { icon: "📺", label: "Legal offer served" },
  { icon: "💰", label: "Conversion", final: true },
];

export function FlowDiagram() {
  useEffect(() => {
    STEPS.forEach((s, i) => {
      const delay = 600 + i * 100;
      setTimeout(() => {
        try {
          play(s.final ? "conv_pill_final" : "conv_pill_tick");
        } catch {
          /* noop */
        }
      }, delay);
    });
  }, []);

  return (
    <div className="glass rounded-xl p-4 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
                delay: 0.6 + i * 0.1,
              }}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-full border transition-colors ${
                step.final
                  ? "border-green-safe/60 bg-surface"
                  : "border-border-subtle bg-surface hover:border-border-glow"
              }`}
              style={
                step.final
                  ? { boxShadow: "0 0 15px hsl(var(--green-safe) / 0.27)" }
                  : undefined
              }
            >
              <span className="text-lg leading-none">{step.icon}</span>
              <span className="text-xs font-medium text-text-primary whitespace-nowrap">
                {step.label}
              </span>
            </motion.div>

            {i < STEPS.length - 1 && (
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 + i * 0.05 }}
                width="40"
                height="20"
                viewBox="0 0 40 20"
                className="shrink-0"
              >
                <line
                  x1="0"
                  y1="10"
                  x2="36"
                  y2="10"
                  stroke="hsl(var(--green-safe) / 0.3)"
                  strokeWidth="1"
                />
                <polygon
                  points="36,6 40,10 36,14"
                  fill="hsl(var(--green-safe))"
                />
                {[0, 0.5, 1].map((offset) => (
                  <motion.circle
                    key={offset}
                    cx={0}
                    cy={10}
                    r={2}
                    fill="hsl(var(--green-safe))"
                    initial={{ cx: 0 }}
                    animate={{ cx: 36 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: offset * 1.5,
                    }}
                  />
                ))}
              </motion.svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
