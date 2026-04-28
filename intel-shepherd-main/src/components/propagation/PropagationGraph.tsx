import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EDGES,
  NODES,
  NODE_BY_ID,
  COLLAPSE_ORDER,
  formatViewers,
  hexagonPoints,
  truncate,
  type PropagationNode,
} from "./nodes";
import { play } from "@/lib/sounds";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsedIds: Set<string>;
}

/**
 * Pure SVG + Framer Motion propagation graph.
 * No external graph library — single <svg> with motion children.
 */
export function PropagationGraph({ selectedId, onSelect, collapsedIds }: Props) {
  const [mountedAt] = useState(() => Date.now());
  const [particlesReady, setParticlesReady] = useState(false);

  // Particles begin at T+2.2s
  useEffect(() => {
    const t = window.setTimeout(() => setParticlesReady(true), 2200);
    return () => window.clearTimeout(t);
  }, [mountedAt]);

  return (
    <svg
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block"
      role="img"
      aria-label="Pirate stream propagation graph"
    >
      {/* Background */}
      <rect x="0" y="0" width="1200" height="700" fill="#03030a" />

      {/* Subtle radial glow under origin */}
      <defs>
        <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff2d2d" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#ff2d2d" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ff2d2d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bgVignette" cx="50%" cy="50%" r="65%">
          <stop offset="60%" stopColor="#03030a" stopOpacity="0" />
          <stop offset="100%" stopColor="#03030a" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <circle cx="600" cy="350" r="300" fill="url(#originGlow)" />
      <rect x="0" y="0" width="1200" height="700" fill="url(#bgVignette)" />

      {/* Edges (drawn first so nodes sit above) */}
      <g className="edges">
        {EDGES.map((edge, i) => {
          const a = NODE_BY_ID[edge.from];
          const b = NODE_BY_ID[edge.to];
          const isOrigin = edge.tier === "origin-first";
          const stroke = isOrigin ? "#ff2d2d" : "#ff6a00";
          const strokeOpacity = isOrigin ? 0.4 : 0.3;
          const dashGap = isOrigin ? "6 3" : "4 4";
          const sw = isOrigin ? 2 : 1.5;

          const dimmed =
            collapsedIds.has(edge.from) || collapsedIds.has(edge.to);

          return (
            <motion.line
              key={edge.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dashGap}
              strokeOpacity={strokeOpacity}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: dimmed ? 0.08 : 1,
              }}
              transition={{
                pathLength: { duration: 0.8, delay: 0.2, ease: "easeOut" },
                opacity: { duration: 0.4, delay: dimmed ? 0 : 0.2 + i * 0.01 },
              }}
              className="edge-marching"
            />
          );
        })}
      </g>

      {/* Traveling particles */}
      <g className="particles" pointerEvents="none">
        {particlesReady &&
          EDGES.map((edge, i) => {
            if (collapsedIds.has(edge.from) || collapsedIds.has(edge.to))
              return null;
            const a = NODE_BY_ID[edge.from];
            const b = NODE_BY_ID[edge.to];
            const color =
              edge.tier === "origin-first" ? "#ff5454" : "#ffa040";
            return (
              <motion.circle
                key={`p-${edge.id}`}
                r={3}
                fill={color}
                opacity={0.85}
                initial={{ cx: a.x, cy: a.y }}
                animate={{ cx: [a.x, b.x], cy: [a.y, b.y] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.12,
                }}
                style={{
                  filter: `drop-shadow(0 0 4px ${color})`,
                }}
              />
            );
          })}
      </g>

      {/* Nodes */}
      <g className="nodes">
        {NODES.map((n) => (
          <NodeShape
            key={n.id}
            node={n}
            selected={selectedId === n.id}
            collapsed={collapsedIds.has(n.id)}
            onSelect={onSelect}
          />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */

function NodeShape({
  node,
  selected,
  collapsed,
  onSelect,
}: {
  node: PropagationNode;
  selected: boolean;
  collapsed: boolean;
  onSelect: (id: string) => void;
}) {
  const { id, tier, x, y, r, color, domain, viewers } = node;

  // Stagger entry: origin 0.6s, first 1.0s+150ms, second 1.6s+80ms
  const entryDelay = useMemo(() => {
    if (tier === "origin") return 0.6;
    if (tier === "first") {
      const idx = ["f1", "f2", "f3", "f4"].indexOf(id);
      return 1.0 + Math.max(0, idx) * 0.15;
    }
    const idx = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].indexOf(id);
    return 1.6 + Math.max(0, idx) * 0.08;
  }, [id, tier]);

  const baseStrokeWidth = tier === "second" ? 1.5 : 2;
  const strokeWidth = selected ? baseStrokeWidth * 2 : baseStrokeWidth;
  const glowSize = tier === "origin" ? 12 : tier === "first" ? 8 : 6;
  const filter = `drop-shadow(0 0 ${selected ? glowSize * 2 : glowSize}px ${color})`;

  const fontSize = Math.max(9, Math.round(r * 0.42));
  const labelY = y + r + 16;

  // Particle burst when collapsed
  const burstSeeds = useRef(
    Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 6;
      return { dx: Math.cos(angle) * 50, dy: Math.sin(angle) * 50 };
    }),
  );

  const handleClick = () => {
    if (collapsed) return;
    play("select");
    onSelect(id);
  };

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={
        collapsed
          ? { opacity: 0, scale: 0 }
          : { opacity: 1, scale: selected ? 1.1 : 1 }
      }
      transition={
        collapsed
          ? { duration: 0.25, ease: "easeIn" }
          : {
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: entryDelay,
            }
      }
      style={{ originX: `${x}px`, originY: `${y}px`, cursor: collapsed ? "default" : "pointer" }}
      onClick={handleClick}
    >
      {/* Pulsing ring for origin */}
      {tier === "origin" && !collapsed && (
        <motion.polygon
          points={hexagonPoints(x, y, r)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: entryDelay + 0.2,
          }}
          style={{ originX: `${x}px`, originY: `${y}px` }}
        />
      )}

      {/* Body shape: hexagon for origin, circle for others */}
      {tier === "origin" ? (
        <polygon
          points={hexagonPoints(x, y, r)}
          fill="#080818"
          stroke={color}
          strokeWidth={strokeWidth}
          style={{ filter }}
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={r}
          fill="#080818"
          stroke={color}
          strokeWidth={strokeWidth}
          style={{ filter }}
        />
      )}

      {/* Viewer count inside */}
      <text
        x={x}
        y={y}
        fill={color}
        fontSize={fontSize}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="middle"
        pointerEvents="none"
      >
        {formatViewers(viewers)}
      </text>

      {/* Domain label below */}
      <text
        x={x}
        y={labelY}
        fill="#a0a0c0"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
        pointerEvents="none"
      >
        {truncate(domain, 22)}
      </text>

      {/* Ghost shell shown after collapse */}
      {collapsed && (
        <>
          {tier === "origin" ? (
            <polygon
              points={hexagonPoints(x, y, r)}
              fill="none"
              stroke="#505070"
              strokeWidth={1}
              opacity={0.3}
            />
          ) : (
            <circle
              cx={x}
              cy={y}
              r={r}
              fill="none"
              stroke="#505070"
              strokeWidth={1}
              opacity={0.3}
            />
          )}
          {/* Particle burst */}
          {burstSeeds.current.map((s, i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={2}
              fill={color}
              initial={{ opacity: 1, scale: 1, cx: x, cy: y }}
              animate={{
                opacity: 0,
                scale: 2,
                cx: x + s.dx,
                cy: y + s.dy,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          ))}
        </>
      )}
    </motion.g>
  );
}

export { COLLAPSE_ORDER };
