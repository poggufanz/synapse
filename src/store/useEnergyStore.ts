import { create } from "zustand";

type EnergyMode = "productive" | "burnout" | null;

interface Persona {
    name: string;
    type: string;
    traits: string[];
}

interface EnergyStore {
    mode: EnergyMode;
    setMode: (mode: EnergyMode) => void;
    persona: Persona | null;
    setPersona: (persona: Persona) => void;
}

export const useEnergyStore = create<EnergyStore>((set) => ({
    mode: null,
    setMode: (mode) => set({ mode }),
    persona: null,
    setPersona: (persona) => set({ persona }),
}));
