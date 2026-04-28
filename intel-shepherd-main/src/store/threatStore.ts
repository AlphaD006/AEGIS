import { create } from "zustand";
import { play } from "@/lib/sounds";

export type ThreatLevel = "LOW" | "ELEVATED" | "CRITICAL";

interface ThreatState {
  level: ThreatLevel;
  autoEscalating: boolean;
  setLevel: (l: ThreatLevel) => void;
  startAutoEscalation: () => void;
  stopAutoEscalation: () => void;
}

let timer: ReturnType<typeof setInterval> | null = null;
let elapsed = 0; // seconds within current 180s cycle

const transitionSound = (from: ThreatLevel, to: ThreatLevel) => {
  if (from === to) return;
  if (to === "ELEVATED") play("threat_low_elevated");
  else if (to === "CRITICAL") {
    play("threat_elevated_critical");
    setTimeout(() => play("critical"), 500);
  } else if (to === "LOW") play("threat_critical_low");
};

export const useThreatStore = create<ThreatState>((set, get) => ({
  level: "LOW",
  autoEscalating: false,

  setLevel: (l) => {
    const prev = get().level;
    if (prev === l) return;
    transitionSound(prev, l);
    set({ level: l });
  },

  startAutoEscalation: () => {
    if (get().autoEscalating) return;
    set({ autoEscalating: true });
    elapsed = 0;
    timer = setInterval(() => {
      elapsed = (elapsed + 1) % 180;
      const next: ThreatLevel =
        elapsed < 60 ? "LOW" : elapsed < 120 ? "ELEVATED" : "CRITICAL";
      const cur = get().level;
      if (cur !== next) {
        transitionSound(cur, next);
        set({ level: next });
      }
    }, 1000);
  },

  stopAutoEscalation: () => {
    if (timer) clearInterval(timer);
    timer = null;
    set({ autoEscalating: false });
  },
}));
