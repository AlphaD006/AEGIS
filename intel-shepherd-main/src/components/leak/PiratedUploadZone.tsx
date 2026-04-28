import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Upload, FileVideo } from "lucide-react";
import { play } from "@/lib/sounds";
import { DecodingSteps } from "./DecodingSteps";

interface Props {
  onComplete: () => void;
}

export function PiratedUploadZone({ onComplete }: Props) {
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept = (files: FileList | null) => {
    if (!files || !files.length || uploaded) return;
    play("leak_file_accept");
    setUploaded(true);
  };

  return (
    <div>
      <motion.div
        onClick={() => !uploaded && fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          accept(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        whileHover={!uploaded ? { scale: 1.02 } : {}}
        className="relative rounded-lg flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden p-6"
        style={{
          minHeight: 180,
          border: "2px dashed #ff6a00",
          background: "rgba(255, 106, 0, 0.05)",
        }}
        onMouseEnter={(e) => {
          if (uploaded) return;
          e.currentTarget.style.borderColor = "#ff8a3c";
        }}
        onMouseLeave={(e) => {
          if (uploaded) return;
          e.currentTarget.style.borderColor = "#ff6a00";
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/*,image/*"
          onChange={(e) => accept(e.target.files)}
        />
        {!uploaded ? (
          <>
            <Upload className="w-7 h-7 mb-2 text-orange-high" />
            <p className="font-display font-semibold text-text-primary">
              Upload suspected pirated copy
            </p>
            <p className="font-mono text-[11px] text-text-muted mt-2">
              Drop the pirated version here for analysis
            </p>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center"
          >
            <div
              className="w-16 h-16 rounded-md flex items-center justify-center"
              style={{
                background: "rgba(255,106,0,0.15)",
                border: "1px solid #ff6a00",
              }}
            >
              <FileVideo className="w-8 h-8 text-orange-high" />
            </div>
            <p className="font-mono text-[11px] text-text-secondary mt-3">
              suspected_leak_clip.mp4
            </p>
          </motion.div>
        )}
      </motion.div>

      {uploaded && <DecodingSteps onComplete={onComplete} />}
    </div>
  );
}
