import { create } from "zustand";
import { persist } from "zustand/middleware";

type EnergyMode = "productive" | "burnout" | null;

interface Persona {
    name: string;
    type: string;
    traits: string[];
}

interface AiPersona {
    name: string;
    type: string;
    interactionStyle: string;
    language: string;
    avatar?: string;
}

interface EnergyStore {
    mode: EnergyMode;
    setMode: (mode: EnergyMode) => void;
    persona: Persona | null;
    setPersona: (persona: Persona) => void;
    // AI Persona for chat customization
    aiPersona: AiPersona | null;
    setAiPersona: (aiPersona: AiPersona | null) => void;
    // Track previous mode for transition detection
    previousMode: EnergyMode;
    // Clear session (for logout)
    clearSession: () => void;
}

export const useEnergyStore = create<EnergyStore>()(
    persist(
        (set, get) => ({
            mode: null,
            setMode: (mode) => set({ previousMode: get().mode, mode }),
            persona: null,
            setPersona: (persona) => set({ persona }),
            aiPersona: null,
            setAiPersona: (aiPersona) => set({ aiPersona }),
            previousMode: null,
            clearSession: () => set({ mode: null, persona: null, aiPersona: null, previousMode: null }),
        }),
        {
            name: "synapse-energy-storage",
        }
    )
);

