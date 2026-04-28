import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Download } from "lucide-react";
import { play } from "@/lib/sounds";
import { toast } from "sonner";

interface Props {
  markedTime: Date;
  detectedTime: Date;
}

const FIELDS = (markedTime: Date, detectedTime: Date) => [
  { k: "DISTRIBUTOR", v: "SkyUK_PartnerID_4471" },
  { k: "ENTITY", v: "Sky UK Broadcasting" },
  { k: "REGION", v: "United Kingdom" },
  { k: "LICENSE TIER", v: "Broadcast (Tier 1)" },
  { k: "CONTENT", v: "UCL SF: RM vs Bayern" },
  { k: "MARKED", v: markedTime.toISOString().replace("T", " ").slice(0, 19) + " UTC" },
  { k: "DETECTED", v: detectedTime.toISOString().replace("T", " ").slice(0, 19) + " UTC" },
  { k: "TIME TO LEAK", v: "44 minutes 16 seconds" },
];

// Stylized world hint — small SVG with UK/Russia/India highlighted (no react-simple-maps dep).
function MiniHeatmap() {
  return (
    <div className="mt-4">
      <div className="rounded-md border border-border-subtle p-2" style={{ background: "rgba(0,0,0,0.4)" }}>
        <svg viewBox="0 0 360 140" className="w-full h-[140px]" preserveAspectRatio="xMidYMid meet">
          {/* faint world dots grid */}
          <g fill="#1a0303">
            {Array.from({ length: 18 }).map((_, r) =>
              Array.from({ length: 36 }).map((_, c) => {
                // skip ocean cells crudely
                const x = c * 10 + 5;
                const y = r * 7 + 8;
                const land = (Math.sin(c * 0.6) + Math.cos(r * 0.7)) > -0.4;
                if (!land) return null;
                return <circle key={`${r}-${c}`} cx={x} cy={y} r={1.2} />;
              })
            )}
          </g>
          {/* UK */}
          <circle cx={170} cy={42} r={9} fill="#ff2d2d" opacity={0.35} />
          <circle cx={170} cy={42} r={5} fill="#ff2d2d" />
          {/* Russia */}
          <circle cx={235} cy={36} r={6} fill="#441111" />
          {/* India */}
          <circle cx={250} cy={70} r={5} fill="#331111" />
          <text x="170" y="62" fill="#ff2d2d" fontSize="6" textAnchor="middle" fontFamily="JetBrains Mono">UK</text>
        </svg>
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mt-2 text-center">
          PRIMARY LEAK ORIGIN: UNITED KINGDOM
        </p>
      </div>
    </div>
  );
}

function CorrelationChart({ markedTime, detectedTime }: { markedTime: Date; detectedTime: Date }) {
  // 12 buckets between marked and detected
  const total = detectedTime.getTime() - markedTime.getTime();
  const data = Array.from({ length: 12 }).map((_, i) => {
    const t = new Date(markedTime.getTime() + (total * i) / 11);
    const watermark = i === 0 ? 100 : i < 11 ? 92 - i * 2 : 5;
    const leak = i < 9 ? 0 : i === 9 ? 12 : i === 10 ? 60 : 100;
    return {
      time: t.toISOString().slice(11, 16),
      watermark,
      leak,
    };
  });
  return (
    <div className="mt-4 rounded-md border border-border-subtle p-2" style={{ background: "rgba(0,0,0,0.4)" }}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
        TIMESTAMP CORRELATION
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <XAxis dataKey="time" tick={{ fill: "#505070", fontSize: 9 }} stroke="#1a1a40" />
          <YAxis tick={{ fill: "#505070", fontSize: 9 }} stroke="#1a1a40" />
          <Tooltip
            contentStyle={{
              background: "#0d0d22",
              border: "1px solid #1a1a40",
              fontSize: 11,
              fontFamily: "JetBrains Mono",
            }}
          />
          <Line
            type="monotone"
            dataKey="watermark"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={1200}
          />
          <Line
            type="monotone"
            dataKey="leak"
            stroke="#ff2d2d"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={1200}
            animationBegin={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForensicReport({ markedTime, detectedTime }: Props) {
  const fields = FIELDS(markedTime, detectedTime);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    play("leak_report_reveal");
    // animate confidence bar
    const target = 97.4;
    const dur = 1500;
    const t0 = performance.now();
    let pingPlayed = false;
    play("leak_bar_fill");
    const tick = () => {
      const t = Math.min(1, (performance.now() - t0) / dur);
      const v = target * t;
      setConfidence(v);
      if (v >= target * 0.99 && !pingPlayed) {
        pingPlayed = true;
        play("leak_bar_ping");
      }
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const onExport = () => {
    play("leak_export");
    // Generate placeholder PDF blob (text-based)
    const uuid = crypto.randomUUID().slice(0, 8).toUpperCase();
    const content = `AEGIS EVIDENCE PACKAGE\nCase #${uuid}\nGenerated: ${new Date().toISOString()}\n\n${fields.map((f) => `${f.k}: ${f.v}`).join("\n")}\nCONFIDENCE: 97.4%\n`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aegis-evidence-${uuid}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => play("pdf"), 600);
    toast.success(`Evidence package downloaded — Case #${uuid}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="rounded-xl p-5"
      style={{
        background: "rgba(255,45,45,0.05)",
        border: "1px solid #ff2d2d",
        boxShadow: "0 0 20px rgba(255,45,45,0.1)",
      }}
    >
      <div
        className="font-display font-bold text-lg mb-4"
        style={{ color: "#f5c518", textShadow: "0 0 12px rgba(245,197,24,0.5)" }}
      >
        ⚠️ LEAK SOURCE IDENTIFIED
      </div>

      <div className="space-y-1.5">
        {fields.map((f, i) => (
          <motion.div
            key={f.k}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.2 }}
            className="grid grid-cols-[140px_1fr] gap-3 items-baseline"
          >
            <span className="font-mono uppercase text-[10px] text-text-muted">{f.k}</span>
            <span className="font-mono text-[12px] text-text-primary">{f.v}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider mb-1">
          <span className="text-text-muted">CONFIDENCE SCORE</span>
          <span className="text-red-critical">{confidence.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-border-glow rounded-full overflow-hidden">
          <div
            className="h-full transition-none"
            style={{
              width: `${confidence}%`,
              background: "#ff2d2d",
              boxShadow: "0 0 10px rgba(255,45,45,0.6)",
            }}
          />
        </div>
      </div>

      <MiniHeatmap />
      <CorrelationChart markedTime={markedTime} detectedTime={detectedTime} />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onExport}
        className="w-full mt-5 py-3 rounded-lg font-display font-bold text-white flex items-center justify-center gap-2 transition-shadow"
        style={{
          background: "linear-gradient(90deg,#ff2d2d,#a30808)",
          boxShadow: "0 0 16px rgba(255,45,45,0.4)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 28px rgba(255,45,45,0.7)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 16px rgba(255,45,45,0.4)";
        }}
      >
        <Download className="w-4 h-4" />
        EXPORT EVIDENCE PACKAGE →
      </motion.button>
    </motion.div>
  );
}
