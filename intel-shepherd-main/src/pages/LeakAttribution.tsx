import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Shield, Zap } from "lucide-react";
import { play } from "@/lib/sounds";
import { Typewriter } from "@/components/leak/Typewriter";
import { WatermarkUploadZone } from "@/components/leak/WatermarkUploadZone";
import { PiratedUploadZone } from "@/components/leak/PiratedUploadZone";
import { ForensicReport } from "@/components/leak/ForensicReport";

const LeakAttribution = () => {
  const [watermarkComplete, setWatermarkComplete] = useState(false);
  const [decodeComplete, setDecodeComplete] = useState(false);
  const [markedTime, setMarkedTime] = useState<Date | null>(null);
  const [detectedTime, setDetectedTime] = useState<Date | null>(null);

  useEffect(() => {
    const prev = document.title;
    document.title = "AEGIS — Leak Attribution";
    return () => {
      document.title = prev;
    };
  }, []);

  // T+1.5s data-ready sound
  useEffect(() => {
    const t = setTimeout(() => play("leak_data_ready"), 1500);
    return () => clearTimeout(t);
  }, []);

  const onWatermarkComplete = (iso: string) => {
    setMarkedTime(new Date(iso));
    setWatermarkComplete(true);
    play("leak_unlock");
  };

  const onDecodeComplete = () => {
    // Simulate the 44-minute gap by using marked time as reference
    const detected = markedTime
      ? new Date(markedTime.getTime() + (44 * 60 + 16) * 1000)
      : new Date();
    setDetectedTime(detected);
    setDecodeComplete(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      className="min-h-full p-6 md:p-8"
      style={{ background: "#03030a" }}
      data-demo="leak"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className="font-display font-bold text-3xl md:text-4xl"
            style={{ color: "#ffffff", textShadow: "0 0 16px rgba(124,58,237,0.5)" }}
          >
            LEAK ATTRIBUTION ENGINE
          </h1>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-display font-bold text-[11px] tracking-wider"
            style={{
              background: "#7c3aed",
              border: "1px solid #9c5aff",
              color: "#fff",
              boxShadow: "0 0 12px #7c3aed",
            }}
          >
            <Zap className="w-3 h-3" /> FORENSIC WATERMARKING
          </motion.span>
        </div>
        <div className="mt-2 h-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Typewriter
              text="AEGIS // SECTOR // LEAK ATTRIBUTION"
              speed={28}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* LEFT */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.5 }}
          className="space-y-5"
        >
          <div>
            <Typewriter
              text="STEP 1 — EMBED WATERMARK"
              speed={40}
              startDelay={1200}
              className="font-display font-bold text-purple-ai tracking-wider text-sm"
            />
            <p className="font-mono text-[11px] text-text-muted mt-1">
              Encode forensic payload into the master copy.
            </p>
            <div className="mt-3">
              <WatermarkUploadZone onComplete={onWatermarkComplete} />
            </div>
          </div>

          <AnimatePresence>
            {watermarkComplete && (
              <motion.div
                key="step2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
              >
                <h3 className="font-display font-bold text-orange-high tracking-wider text-sm">
                  STEP 2 — ANALYZE PIRATED COPY
                </h3>
                <p className="font-mono text-[11px] text-text-muted mt-1">
                  Decode embedded watermark from the suspect file.
                </p>
                <div className="mt-3">
                  <PiratedUploadZone onComplete={onDecodeComplete} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.7 }}
        >
          {!decodeComplete || !markedTime || !detectedTime ? (
            <div
              className="rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]"
              style={{
                background: "rgba(124,58,237,0.03)",
                border: "1px solid rgba(124,58,237,0.3)",
                boxShadow: "0 0 24px rgba(124,58,237,0.08)",
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  boxShadow: "0 0 32px rgba(124,58,237,0.4)",
                }}
              >
                <Shield className="w-10 h-10 text-purple-ai" />
              </div>
              <h2 className="font-display font-bold text-xl text-text-primary tracking-wider">
                FORENSIC REPORT
              </h2>
              <p className="font-mono text-[11px] uppercase tracking-widest text-text-muted mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-text-muted animate-pulse" />
                AWAITING ANALYSIS
              </p>
              <p className="font-mono text-[12px] text-text-secondary mt-4 max-w-xs leading-relaxed">
                Upload original + suspected pirated copy to generate evidence-grade attribution report.
              </p>
            </div>
          ) : (
            <ForensicReport markedTime={markedTime} detectedTime={detectedTime} />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LeakAttribution;
