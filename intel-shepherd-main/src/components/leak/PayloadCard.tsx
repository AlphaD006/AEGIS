import { motion } from "framer-motion";
import { useEffect } from "react";
import { play } from "@/lib/sounds";

interface Props {
  isoTime: string;
}

const FIELDS = [
  { k: "DISTRIBUTOR", v: "SkyUK_4471" },
  { k: "REGION", v: "GB-ENG" },
  { k: "TIMESTAMP", v: "" }, // injected
  { k: "LICENSE", v: "BROADCAST_TIER_1" },
  { k: "HASH", v: "a3f9d721...4471b2" },
];

export function PayloadCard({ isoTime }: Props) {
  const fields = FIELDS.map((f, i) => (i === 2 ? { ...f, v: isoTime } : f));

  useEffect(() => {
    play("leak_data_ready");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-lg p-4 mt-4"
      style={{
        background: "rgba(0,255,136,0.05)",
        border: "1px solid #00ff88",
        boxShadow: "0 0 20px rgba(0,255,136,0.1)",
      }}
    >
      <div className="font-display font-bold text-green-safe mb-3 text-sm tracking-wider">
        ✅ WATERMARK PAYLOAD ENCODED
      </div>
      <div className="space-y-1.5">
        {fields.map((f, i) => (
          <motion.div
            key={f.k}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.2 }}
            onAnimationStart={() => play("leak_field_tick")}
            className="grid grid-cols-[110px_1fr] gap-3 items-baseline"
          >
            <span className="font-mono uppercase text-[10px] text-text-muted">{f.k}</span>
            <span className="font-mono text-[12px] text-text-primary break-all">{f.v}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
