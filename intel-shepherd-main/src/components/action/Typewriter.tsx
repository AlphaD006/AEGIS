import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { play } from "@/lib/sounds";

interface TypewriterProps {
  text: string;
  speed?: number; // ms per char
  startDelay?: number;
  showCursor?: boolean;
  cursorColor?: string;
  className?: string;
  onChar?: () => void;
  onDone?: () => void;
  silent?: boolean;
}

export function Typewriter({
  text,
  speed = 40,
  startDelay = 0,
  showCursor = false,
  cursorColor = "hsl(var(--red-critical))",
  className,
  onChar,
  onDone,
  silent,
}: TypewriterProps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const t0 = setTimeout(() => {
      let n = 0;
      const id = setInterval(() => {
        n++;
        setI(n);
        if (!silent) {
          if (text[n - 1] === "\n") play("ac_typewriter_break");
          else play("ac_typewriter");
        }
        onChar?.();
        if (n >= text.length) {
          clearInterval(id);
          onDone?.();
        }
      }, speed);
    }, startDelay);
    return () => clearTimeout(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <span className={className}>
      <span style={{ whiteSpace: "pre-wrap" }}>{text.slice(0, i)}</span>
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ color: cursorColor, marginLeft: 1 }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}
