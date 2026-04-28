import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { play, type SoundName } from "@/lib/sounds";

interface Step {
  label: string;
  pct: number;
  sound: SoundName;
}

const STEPS: Step[] = [
  { label: "Extracting video frames", pct: 25, sound: "leak_decode_step1" },
  { label: "Scanning steganographic layer", pct: 50, sound: "leak_decode_step2" },
  { label: "Decoding watermark payload", pct: 75, sound: "leak_decode_step3" },
  { label: "Cross-referencing distributor DB", pct: 100, sound: "leak_decode_step4" },
];

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface Props {
  onComplete: () => void;
}

export function DecodingSteps({ onComplete }: Props) {
  const [active, setActive] = useState<number>(-1);
  const [pct, setPct] = useState<number>(0);
  const [matchVisible, setMatchVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (cancelled) return;
        setActive(i);
        play(STEPS[i].sound);
        // animate progress to step pct over ~0.6s
        const start = i === 0 ? 0 : STEPS[i - 1].pct;
        const end = STEPS[i].pct;
        const dur = 600;
        const t0 = performance.now();
        await new Promise<void>((res) => {
          const tick = () => {
            if (cancelled) return res();
            const t = Math.min(1, (performance.now() - t0) / dur);
            setPct(start + (end - start) * t);
            if (t < 1) requestAnimationFrame(tick);
            else res();
          };
          requestAnimationFrame(tick);
        });
        await delay(100);
      }
      if (cancelled) return;
      await delay(200);
      play("leak_match_found");
      setMatchVisible(true);
      await delay(1300);
      onComplete();
    })();
    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  return (
    <div className="mt-4 space-y-3">
      {STEPS.map((s, i) => {
        const stepPct =
          i < active ? 100 : i === active ? Math.min(100, ((pct - (i === 0 ? 0 : STEPS[i - 1].pct)) / (STEPS[i].pct - (i === 0 ? 0 : STEPS[i - 1].pct))) * 100) : 0;
        if (i > active) return null;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider mb-1">
              <span className="text-orange-high">{s.label}</span>
              <span className="text-text-muted">{Math.round(stepPct)}%</span>
            </div>
            <div className="h-1.5 bg-border-glow rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  width: `${stepPct}%`,
                  background: "linear-gradient(90deg,#ff6a00,#f5c518)",
                  boxShadow: "0 0 8px rgba(255,106,0,0.6)",
                }}
              />
            </div>
          </motion.div>
        );
      })}

      {matchVisible && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-6"
        >
          <div
            className="font-display font-bold text-2xl"
            style={{ color: "#f5c518", textShadow: "0 0 16px rgba(245,197,24,0.7)" }}
          >
            ⚠️ WATERMARK MATCH FOUND
          </div>
        </motion.div>
      )}
    </div>
  );
}
