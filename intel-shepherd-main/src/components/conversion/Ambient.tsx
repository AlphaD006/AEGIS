import { useMemo } from "react";

export function ScanlineOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 100,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }}
    />
  );
}

export function GreenParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        dx: (Math.random() - 0.5) * 60,
        dy: (Math.random() - 0.5) * 60,
        dur: 8 + Math.random() * 7,
      })),
    [],
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: "hsl(var(--green-safe))",
            opacity: 0.1,
            animation: `convPart${i} ${p.dur}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>
        {particles
          .map(
            (p, i) => `
          @keyframes convPart${i} {
            from { transform: translate(0,0); }
            to { transform: translate(${p.dx}px, ${p.dy}px); }
          }
        `,
          )
          .join("\n")}
      </style>
    </div>
  );
}
