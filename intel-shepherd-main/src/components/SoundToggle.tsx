import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { play, useSoundStore } from "@/lib/sounds";

/**
 * Compact sound toggle with animated 5-bar waveform.
 * Hidden silently when AudioContext is unavailable.
 */
export function SoundToggle() {
  const { isMuted, available, lastPlayedAt, toggleMuted } = useSoundStore();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!lastPlayedAt) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), 1200);
    return () => clearTimeout(t);
  }, [lastPlayedAt]);

  if (!available) return null;

  const handleClick = () => {
    toggleMuted();
    // Confirmation tick when un-muting
    if (isMuted) setTimeout(() => play("select"), 30);
  };

  // Bar height animation pattern
  const baseHeights = [4, 8, 12, 8, 4];

  return (
    <button
      onClick={handleClick}
      className="group flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border-subtle hover:border-border-glow bg-elevated/50 transition-colors"
      aria-label={isMuted ? "Unmute sound" : "Mute sound"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isMuted ? (
          <motion.span
            key="muted"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-text-muted"
          >
            <VolumeX size={14} />
          </motion.span>
        ) : (
          <motion.span
            key="unmuted"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-green-safe"
          >
            <Volume2 size={14} />
          </motion.span>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-[2px] h-3 w-[19px]">
        {isMuted ? (
          <div className="h-[2px] w-full self-center bg-text-muted rounded-full" />
        ) : (
          baseHeights.map((h, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-green-safe"
              initial={{ height: 4 }}
              animate={
                active
                  ? { height: [4, h, 4] }
                  : { height: 4 }
              }
              transition={{
                duration: 0.8,
                repeat: active ? Infinity : 0,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
              style={{ boxShadow: active ? "0 0 6px hsl(var(--green-safe) / 0.7)" : "none" }}
            />
          ))
        )}
      </div>
    </button>
  );
}
