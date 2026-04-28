import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DEMO_STEPS, useDemoStore } from "@/store/demoStore";
import { play } from "@/lib/sounds";

export function DemoGuide() {
  const { active, stepIndex, next, exit } = useDemoStore();
  const navigate = useNavigate();
  const step = DEMO_STEPS[stepIndex];

  // Navigate to the step's route whenever it changes
  useEffect(() => {
    if (!active || !step) return;
    navigate(step.route);
  }, [active, step, navigate]);

  // Auto-advance every 12s
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      play("demo_step");
      next();
    }, 12000);
    return () => clearTimeout(t);
  }, [active, stepIndex, next]);

  const handleNext = () => {
    play("demo_step");
    next();
  };

  return (
    <AnimatePresence>
      {active && step && (
        <motion.div
          key="demo-guide"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="fixed bottom-5 right-5 z-40 w-[320px] glass-elevated scanlines rounded-xl p-4 shadow-glow-purple"
          style={{ borderColor: "hsl(var(--purple-ai))" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-mono text-[10px] uppercase tracking-widest text-purple-ai"
              style={{ textShadow: "0 0 8px hsl(var(--purple-ai) / 0.6)" }}
            >
              ◆ DEMO MODE
            </span>
            <button
              onClick={exit}
              className="text-text-muted hover:text-red-critical transition-colors"
              aria-label="Exit demo mode"
            >
              <X size={14} />
            </button>
          </div>

          <h3 className="font-display font-bold text-lg text-text-primary mb-1">
            {step.title}
          </h3>
          <p className="font-mono text-xs text-text-secondary leading-relaxed mb-4">
            {step.body}
          </p>

          {/* Progress bar */}
          <div className="h-[2px] bg-border-subtle rounded-full mb-3 overflow-hidden">
            <motion.div
              key={stepIndex}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 12, ease: "linear" }}
              className="h-full bg-purple-ai"
              style={{ boxShadow: "0 0 8px hsl(var(--purple-ai))" }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {stepIndex + 1} of {DEMO_STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={exit}
                className="font-mono text-[10px] uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
              >
                ✕ EXIT
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border border-purple-ai text-purple-ai hover:bg-purple-ai/10 transition-colors"
              >
                NEXT <ChevronRight size={10} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
