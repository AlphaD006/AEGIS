import { create } from "zustand";

export type PersonaId = "uefa" | "netflix" | "ipl";

export interface Persona {
  id: PersonaId;
  name: string;
  clearance: "ALPHA" | "BETA" | "GAMMA";
  /** Tailwind color token (semantic) */
  color: string;
  icon: string;
}

export const PERSONAS: Persona[] = [
  { id: "uefa", name: "UEFA", clearance: "ALPHA", color: "blue-intel", icon: "⚽" },
  { id: "netflix", name: "NETFLIX", clearance: "BETA", color: "red-critical", icon: "🎬" },
  { id: "ipl", name: "IPL / BCCI", clearance: "GAMMA", color: "orange-high", icon: "🏏" },
];

interface PersonaState {
  current: Persona | null;
  setPersona: (p: Persona) => void;
  clear: () => void;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  current: null,
  setPersona: (p) => set({ current: p }),
  clear: () => set({ current: null }),
}));
