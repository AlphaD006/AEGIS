import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Upload, FileVideo } from "lucide-react";
import { play } from "@/lib/sounds";
import { MatrixCanvas } from "./MatrixCanvas";
import { PayloadCard } from "./PayloadCard";

interface Props {
  onComplete: (isoTime: string) => void;
}

/**
 * Step 1: original upload + watermark embedding sequence.
 */
export function WatermarkUploadZone({ onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "accepted" | "embedding" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [isoTime, setIsoTime] = useState("");
  const [pulseGlow, setPulseGlow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [zoneSize, setZoneSize] = useState({ w: 0, h: 0 });

  // Initial entrance pulse at T+0.9s
  useEffect(() => {
    const t = setTimeout(() => {
      setPulseGlow(true);
      setTimeout(() => setPulseGlow(false), 600);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  // measure
  useEffect(() => {
    if (!zoneRef.current) return;
    const el = zoneRef.current;
    const update = () => setZoneSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const startSequence = () => {
    if (phase !== "idle") return;
    setPhase("accepted");
    play("leak_file_accept");
    // After 0.5s, start embedding
    setTimeout(() => {
      setPhase("embedding");
      play("leak_progress_hum");
      // 2s progress fill
      const t0 = performance.now();
      const tick = () => {
        const t = Math.min(1, (performance.now() - t0) / 2000);
        setProgress(t * 100);
        if (t < 1) requestAnimationFrame(tick);
        else {
          play("leak_vault_lock");
          setTimeout(() => {
            const iso = new Date().toISOString();
            setIsoTime(iso);
            setPhase("done");
            // Allow card to render then notify (0.5s after card visible)
            setTimeout(() => onComplete(iso), 800);
          }, 300);
        }
      };
      requestAnimationFrame(tick);
    }, 500);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    startSequence();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <motion.div
        ref={zoneRef}
        onClick={() => phase === "idle" && fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        whileHover={phase === "idle" ? { scale: 1.02 } : {}}
        animate={
          pulseGlow
            ? { boxShadow: ["0 0 0px #7c3aed", "0 0 20px #7c3aed", "0 0 0px #7c3aed"] }
            : {}
        }
        transition={{ duration: 0.6 }}
        className="relative rounded-lg flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
        style={{
          minHeight: 220,
          border: "2px dashed #7c3aed",
          background: "rgba(124, 58, 237, 0.05)",
        }}
        onMouseEnter={(e) => {
          if (phase !== "idle") return;
          e.currentTarget.style.borderColor = "#9c5aff";
        }}
        onMouseLeave={(e) => {
          if (phase !== "idle") return;
          e.currentTarget.style.borderColor = "#7c3aed";
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/*,image/*"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {phase === "idle" && (
          <div className="p-6 z-10">
            <Upload className="w-8 h-8 mx-auto mb-3 text-purple-ai" />
            <p className="font-display font-semibold text-text-primary">
              Drop original file here
            </p>
            <p className="font-mono text-[11px] text-text-muted mt-2">
              or click to browse — video, image, master copy
            </p>
          </div>
        )}

        {phase !== "idle" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative z-10 p-6 flex flex-col items-center"
          >
            <div
              className="w-20 h-20 rounded-md flex items-center justify-center"
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid #7c3aed",
              }}
            >
              <FileVideo className="w-10 h-10 text-purple-ai" />
            </div>
            <p className="font-mono text-[11px] text-text-secondary mt-3">
              ucl_sf_master_4471.mp4
            </p>
          </motion.div>
        )}

        {/* Matrix overlay during embedding */}
        {phase === "embedding" && (
          <MatrixCanvas active width={zoneSize.w} height={zoneSize.h} />
        )}
      </motion.div>

      {/* Progress bar */}
      {phase === "embedding" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider mb-1">
            <span className="text-purple-ai">EMBEDDING WATERMARK...</span>
            <span className="text-text-muted">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1a1a40" }}>
            <div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg,#7c3aed,#9c5aff)",
                boxShadow: "0 0 10px rgba(124,58,237,0.6)",
              }}
            />
          </div>
        </motion.div>
      )}

      {phase === "done" && <PayloadCard isoTime={isoTime} />}
    </div>
  );
}
