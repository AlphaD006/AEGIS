/**
 * AEGIS Propagation Graph — node + edge data.
 * SVG coordinate space: 1200 x 700 viewBox.
 */

export type NodeTier = "origin" | "first" | "second";

export interface PropagationNode {
  id: string;
  tier: NodeTier;
  x: number;
  y: number;
  r: number;
  color: string;          // stroke / glow color
  domain: string;
  viewers: number;        // raw viewers count
  // Intelligence panel data
  platform: string;
  country: string;        // e.g. "Russia"
  countryCode: string;    // e.g. "RU"
  ip: string;
  hosting: string;
  firstSeen: string;      // "2025-04-22 18:42 UTC"
  bandwidth: string;      // "12.4 Gbps"
  impactScore: number;    // 0–100
  collapseWarning: string;
}

export interface PropagationEdge {
  id: string;
  from: string;
  to: string;
  tier: "origin-first" | "first-second";
}

const COLOR = {
  origin: "#ff2d2d",
  first: "#ff6a00",
  second: "#f5c518",
} as const;

export const NODES: PropagationNode[] = [
  // Origin
  {
    id: "origin", tier: "origin", x: 600, y: 350, r: 40, color: COLOR.origin,
    domain: "stream-ucl-hd.ru", viewers: 41200,
    platform: "Custom HLS / Nginx-RTMP",
    country: "Russia", countryCode: "RU",
    ip: "185.244.214.71", hosting: "DDoS-Guard LLC",
    firstSeen: "2025-04-22 18:42 UTC",
    bandwidth: "12.4 Gbps",
    impactScore: 96,
    collapseWarning: "Neutralising origin will cascade through 11 downstream mirrors. Estimated network collapse: 94%.",
  },

  // First-gen mirrors
  {
    id: "f1", tier: "first", x: 300, y: 150, r: 30, color: COLOR.first,
    domain: "t.me/UCLstreams", viewers: 18400,
    platform: "Telegram Channel",
    country: "Cyprus", countryCode: "CY",
    ip: "149.154.167.99", hosting: "Telegram Messenger LLP",
    firstSeen: "2025-04-22 18:51 UTC",
    bandwidth: "3.1 Gbps",
    impactScore: 78,
    collapseWarning: "Telegram TOS-strike pending. 7 downstream mirrors will detach.",
  },
  {
    id: "f2", tier: "first", x: 900, y: 150, r: 28, color: COLOR.first,
    domain: "iptv-sports.net", viewers: 14900,
    platform: "Restreamer / FFmpeg",
    country: "Netherlands", countryCode: "NL",
    ip: "45.155.205.18", hosting: "Stark Industries Solutions Ltd",
    firstSeen: "2025-04-22 18:47 UTC",
    bandwidth: "2.4 Gbps",
    impactScore: 71,
    collapseWarning: "Cloudflare proxy in front. Hosting takedown ETA 14 min.",
  },
  {
    id: "f3", tier: "first", x: 300, y: 550, r: 23, color: COLOR.first,
    domain: "reddit.com/r/soccer", viewers: 8200,
    platform: "Reddit thread (link aggregator)",
    country: "United States", countryCode: "US",
    ip: "151.101.193.140", hosting: "Reddit Inc / Fastly",
    firstSeen: "2025-04-22 19:02 UTC",
    bandwidth: "0.6 Gbps",
    impactScore: 52,
    collapseWarning: "Reddit DMCA queue: 4 min average response. Auto-comment removal armed.",
  },
  {
    id: "f4", tier: "first", x: 900, y: 550, r: 25, color: COLOR.first,
    domain: "discord.gg/UCLlive", viewers: 11300,
    platform: "Discord server (screen-share)",
    country: "United States", countryCode: "US",
    ip: "162.159.137.232", hosting: "Cloudflare Inc",
    firstSeen: "2025-04-22 18:55 UTC",
    bandwidth: "1.9 Gbps",
    impactScore: 64,
    collapseWarning: "Discord T&S notified. 2 mirror servers will void.",
  },

  // Second-gen mirrors (top row)
  {
    id: "s1", tier: "second", x: 100, y: 50, r: 18, color: COLOR.second,
    domain: "t.me/UCLmirror1", viewers: 4200,
    platform: "Telegram channel",
    country: "Russia", countryCode: "RU",
    ip: "149.154.167.41", hosting: "Telegram Messenger LLP",
    firstSeen: "2025-04-22 19:08 UTC",
    bandwidth: "0.7 Gbps",
    impactScore: 38,
    collapseWarning: "Cascades from f1.",
  },
  {
    id: "s2", tier: "second", x: 450, y: 50, r: 15, color: COLOR.second,
    domain: "iptv-backup.pw", viewers: 2900,
    platform: "Nginx HLS",
    country: "Russia", countryCode: "RU",
    ip: "194.156.99.4", hosting: "DDoS-Guard LLC",
    firstSeen: "2025-04-22 19:11 UTC",
    bandwidth: "0.5 Gbps",
    impactScore: 31,
    collapseWarning: "Cascades from f1.",
  },
  {
    id: "s3", tier: "second", x: 750, y: 50, r: 16, color: COLOR.second,
    domain: "iptv-backup2.pw", viewers: 3300,
    platform: "Nginx HLS",
    country: "Bulgaria", countryCode: "BG",
    ip: "5.181.156.21", hosting: "Neterra LTD",
    firstSeen: "2025-04-22 19:13 UTC",
    bandwidth: "0.6 Gbps",
    impactScore: 33,
    collapseWarning: "Cascades from f2.",
  },
  {
    id: "s4", tier: "second", x: 1100, y: 50, r: 17, color: COLOR.second,
    domain: "iptv-hd.cc", viewers: 3700,
    platform: "Nginx HLS / Cloudflare",
    country: "Germany", countryCode: "DE",
    ip: "188.114.96.3", hosting: "Cloudflare Inc",
    firstSeen: "2025-04-22 19:14 UTC",
    bandwidth: "0.7 Gbps",
    impactScore: 36,
    collapseWarning: "Cascades from f2.",
  },

  // Second-gen mirrors (bottom row)
  {
    id: "s5", tier: "second", x: 100, y: 650, r: 18, color: COLOR.second,
    domain: "streameast.live", viewers: 4500,
    platform: "Static HLS / Bunny CDN",
    country: "Turkey", countryCode: "TR",
    ip: "5.226.23.18", hosting: "BunnyCDN Ltd",
    firstSeen: "2025-04-22 19:18 UTC",
    bandwidth: "0.8 Gbps",
    impactScore: 40,
    collapseWarning: "Cascades from f3.",
  },
  {
    id: "s6", tier: "second", x: 450, y: 650, r: 17, color: COLOR.second,
    domain: "crackstreams.io", viewers: 3900,
    platform: "Embed iframe network",
    country: "United States", countryCode: "US",
    ip: "104.21.45.99", hosting: "Cloudflare Inc",
    firstSeen: "2025-04-22 19:19 UTC",
    bandwidth: "0.7 Gbps",
    impactScore: 37,
    collapseWarning: "Cascades from f3.",
  },
  {
    id: "s7", tier: "second", x: 750, y: 650, r: 15, color: COLOR.second,
    domain: "discord.gg/mirror1", viewers: 2700,
    platform: "Discord server",
    country: "Germany", countryCode: "DE",
    ip: "162.159.135.232", hosting: "Cloudflare Inc",
    firstSeen: "2025-04-22 19:21 UTC",
    bandwidth: "0.4 Gbps",
    impactScore: 29,
    collapseWarning: "Cascades from f4.",
  },
  {
    id: "s8", tier: "second", x: 1100, y: 650, r: 15, color: COLOR.second,
    domain: "discord.gg/mirror2", viewers: 2500,
    platform: "Discord server",
    country: "Brazil", countryCode: "BR",
    ip: "162.159.138.232", hosting: "Cloudflare Inc",
    firstSeen: "2025-04-22 19:22 UTC",
    bandwidth: "0.4 Gbps",
    impactScore: 27,
    collapseWarning: "Cascades from f4.",
  },
];

export const EDGES: PropagationEdge[] = [
  { id: "e-of1", from: "origin", to: "f1", tier: "origin-first" },
  { id: "e-of2", from: "origin", to: "f2", tier: "origin-first" },
  { id: "e-of3", from: "origin", to: "f3", tier: "origin-first" },
  { id: "e-of4", from: "origin", to: "f4", tier: "origin-first" },

  { id: "e-f1s1", from: "f1", to: "s1", tier: "first-second" },
  { id: "e-f1s2", from: "f1", to: "s2", tier: "first-second" },
  { id: "e-f2s3", from: "f2", to: "s3", tier: "first-second" },
  { id: "e-f2s4", from: "f2", to: "s4", tier: "first-second" },
  { id: "e-f3s5", from: "f3", to: "s5", tier: "first-second" },
  { id: "e-f3s6", from: "f3", to: "s6", tier: "first-second" },
  { id: "e-f4s7", from: "f4", to: "s7", tier: "first-second" },
  { id: "e-f4s8", from: "f4", to: "s8", tier: "first-second" },
];

export const NODE_BY_ID: Record<string, PropagationNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
);

/** Order in which nodes collapse during INTERVENE (leaves first, then mirrors). */
export const COLLAPSE_ORDER = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8",
  "f1", "f2", "f3", "f4",
];

export function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export function truncate(s: string, max = 18): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

export function hexagonPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}
