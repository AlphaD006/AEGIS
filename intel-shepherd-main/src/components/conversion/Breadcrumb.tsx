import { useEffect, useState } from "react";

export function Breadcrumb({ text, delay = 0 }: { text: string; delay?: number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      const t = setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(t);
      }, 25);
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay]);
  return (
    <div className="font-mono text-xs text-text-secondary tracking-wider">
      {out}
      <span className="inline-block w-2 h-3 ml-0.5 bg-purple-ai animate-pulse" />
    </div>
  );
}
