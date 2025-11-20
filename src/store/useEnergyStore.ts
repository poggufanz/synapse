"use client";

import { create } from "zustand";

type EnergyMode = "productive" | "burnout" | null;

export interface Persona {
    name: string;
    type: string;
    traits: string[];
}

interface EnergyStore {
    mode: EnergyMode;
    persona: Persona | null;
    setMode: (mode: EnergyMode) => void;
    setPersona: (persona: Persona) => void;
}

export const useEnergyStore = create<EnergyStore>((set) => ({
    mode: null,
    persona: null,
    setMode: (mode) => set({ mode }),
    setPersona: (persona) => set({ persona }),
}));
