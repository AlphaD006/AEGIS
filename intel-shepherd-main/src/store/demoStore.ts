import { create } from "zustand";

export interface DemoStep {
  id: number;
  title: string;
  body: string;
  route: string;
  /** Optional CSS selector for the highlighted element (consumed by AppShell to render a glowing ring) */
  target?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  { id: 1, title: "War Room", body: "Real-time global piracy monitoring.", route: "/war-room", target: "[data-demo='war-room']" },
  { id: 2, title: "Live Threat Feed", body: "2,847 streams detected this hour.", route: "/war-room", target: "[data-demo='threat-feed']" },
  { id: 3, title: "Propagation Graph", body: "Trace any stream back to its origin.", route: "/propagation", target: "[data-demo='propagation']" },
  { id: 4, title: "One Click Collapse", body: "Watch the entire piracy network collapse.", route: "/propagation", target: "[data-demo='collapse']" },
  { id: 5, title: "Leak Attribution", body: "Identify the exact leak source — every time.", route: "/leak-attribution", target: "[data-demo='leak']" },
  { id: 6, title: "DMCA Generator", body: "Takedown notice generated in 8 seconds.", route: "/action-center", target: "[data-demo='dmca']" },
  { id: 7, title: "Piracy Prediction", body: "Know your risk before the event goes live.", route: "/prediction", target: "[data-demo='prediction']" },
  { id: 8, title: "ROI Dashboard", body: "$284,000 recovered this month.", route: "/dashboard", target: "[data-demo='roi']" },
];

interface DemoState {
  active: boolean;
  stepIndex: number; // 0-based
  start: () => void;
  next: () => void;
  exit: () => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  active: false,
  stepIndex: 0,
  start: () => set({ active: true, stepIndex: 0 }),
  next: () => {
    const i = get().stepIndex;
    if (i >= DEMO_STEPS.length - 1) set({ active: false, stepIndex: 0 });
    else set({ stepIndex: i + 1 });
  },
  exit: () => set({ active: false, stepIndex: 0 }),
}));
