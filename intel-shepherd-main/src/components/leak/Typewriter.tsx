import { useEffect, useState } from "react";

interface Props {
  text: string;
  speed?: number;
  className?: string;
  startDelay?: number;
}

export function Typewriter({ text, speed = 30, className, startDelay = 0 }: Props) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    setOut("");
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = window.setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length && interval) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);
  return (
    <span className={className}>
      {out}
      <span className="opacity-60 animate-pulse">▌</span>
    </span>
  );
}
