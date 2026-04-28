import { FlaggedSite } from "@/store/piracyStore";

export type ThreatType = "CRITICAL" | "HIGH" | "ELEVATED" | "RESOLVED";

export interface ThreatPoint {
  city: string;
  lat: number;
  lng: number;
  size: number;
  viewers: number;
}

export const THREAT_POINTS: ThreatPoint[] = [
  { city: "Mumbai", lat: 19.07, lng: 72.87, size: 14, viewers: 1204 },
  { city: "Delhi", lat: 28.61, lng: 77.20, size: 12, viewers: 847 },
  { city: "Kolkata", lat: 22.57, lng: 88.36, size: 11, viewers: 612 },
  { city: "Karachi", lat: 24.86, lng: 67.01, size: 10, viewers: 391 },
  { city: "Dhaka", lat: 23.81, lng: 90.41, size: 9, viewers: 284 },
  { city: "Bangalore", lat: 12.97, lng: 77.59, size: 8, viewers: 198 },
  { city: "Jakarta", lat: 6.21, lng: 106.84, size: 13, viewers: 612 },
  { city: "Lahore", lat: 31.55, lng: 74.35, size: 10, viewers: 341 },
];

export interface FeedEntry {
  id: string;
  type: ThreatType;
  city: string;
  msg: string;
  time: string;
  lat: number;
  lng: number;
  realUrl?: string;
}

export const FEED_POOL: Omit<FeedEntry, "id" | "time">[] = [
  { type: "CRITICAL", city: "Mumbai", msg: "IPL free stream detected — 1,204 viewers", lat: 19.07, lng: 72.87 },
  { type: "HIGH", city: "Delhi", msg: "Telegram IPL channel active — 847 viewers", lat: 28.61, lng: 77.20 },
  { type: "HIGH", city: "Kolkata", msg: "IPL mirror site — KKR vs MI stream", lat: 22.57, lng: 88.36 },
  { type: "ELEVATED", city: "Karachi", msg: "VPN-masked IPL stream — 391 viewers", lat: 24.86, lng: 67.01 },
  { type: "ELEVATED", city: "Dhaka", msg: "IPL piracy link shared on Reddit", lat: 23.81, lng: 90.41 },
  { type: "RESOLVED", city: "Bangalore", msg: "IPL stream taken down — DMCA sent to JioHotstar", lat: 12.97, lng: 77.59 },
  { type: "CRITICAL", city: "Jakarta", msg: "Discord server streaming IPL — 612 viewers", lat: 6.21, lng: 106.84 },
  { type: "ELEVATED", city: "Lahore", msg: "YouTube unlisted IPL stream detected", lat: 31.55, lng: 74.35 },
];

export const SEVERITY_STYLES: Record<ThreatType, { color: string; pulse: string; bg: string }> = {
  CRITICAL: { color: "bg-red-critical", pulse: "animate-pulse-fast", bg: "hsl(var(--red-critical))" },
  HIGH: { color: "bg-orange-high", pulse: "animate-pulse-fast", bg: "hsl(var(--orange-high))" },
  ELEVATED: { color: "bg-yellow-medium", pulse: "animate-pulse-slow", bg: "hsl(var(--yellow-medium))" },
  RESOLVED: { color: "bg-green-safe", pulse: "", bg: "hsl(var(--green-safe))" },
};

const PIRACY_REGIONS = [
  { lat: 20.59, lng: 78.96 },
  { lat: 30.37, lng: 69.34 },
  { lat: 4.21, lng: 101.97 },
  { lat: 23.81, lng: 90.41 },
  { lat: 31.55, lng: 74.35 },
  { lat: 6.21, lng: 106.84 },
];

export function buildFeedEntryFromFlaggedSite(site: FlaggedSite, id: string): FeedEntry {
  const type: ThreatType =
    site.score >= 90 ? "CRITICAL" : site.score >= 70 ? "HIGH" : "ELEVATED";

  let city: string;
  try {
    city = new URL(site.url).hostname;
    if (city.length > 28) city = city.slice(0, 28) + "…";
  } catch {
    city = "Unknown";
  }

  const region = PIRACY_REGIONS[Math.floor(Math.random() * PIRACY_REGIONS.length)];

  return {
    id,
    type,
    city,
    msg: `PIRACY DETECTED — score ${site.score}/100`,
    time: "just now",
    lat: region.lat,
    lng: region.lng,
    realUrl: site.url,
  };
}
