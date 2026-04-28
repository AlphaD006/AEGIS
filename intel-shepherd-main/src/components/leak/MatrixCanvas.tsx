import { useEffect, useRef } from "react";
import { play } from "@/lib/sounds";

const POOL = ["a3f9", "d721", "4471", "2d2d", "ff6a", "00ff", "88cc", "1a40", "7c3a", "ed33", "4fc3", "f722"];

interface Props {
  active: boolean;
  width: number;
  height: number;
}

/**
 * Falling-character "matrix" canvas overlay. Plays during watermark embedding.
 */
export function MatrixCanvas({ active, width, height }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const colW = 14;
    const cols = Math.floor(width / colW);
    const columns = Array.from({ length: cols }).map(() => ({
      y: Math.random() * height,
      speed: 2 + Math.random() * 3,
      chars: [] as { glyph: string; age: number }[],
    }));

    let alive = true;

    const loop = () => {
      if (!alive) return;
      ctx.fillStyle = "rgba(3,3,10,0.18)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = "11px 'JetBrains Mono', monospace";

      columns.forEach((col, i) => {
        col.y += col.speed;
        if (col.y > height + 14) col.y = -14;
        const glyph = POOL[Math.floor(Math.random() * POOL.length)];
        col.chars.unshift({ glyph, age: 0 });
        if (col.chars.length > 18) col.chars.pop();
        col.chars.forEach((c, idx) => {
          c.age += 1;
          const opacity = Math.max(0.1, 0.9 - idx * 0.06);
          ctx.fillStyle = `rgba(0,255,136,${opacity})`;
          ctx.fillText(c.glyph, i * colW, col.y - idx * 14);
        });
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // Matrix tick sound — 20/sec
    tickRef.current = window.setInterval(() => play("leak_matrix_tick"), 50);

    return () => {
      alive = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [active, width, height]);

  if (!active) return null;
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none rounded-lg" />;
}
