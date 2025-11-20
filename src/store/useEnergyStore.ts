import { create } from 'zustand';

type EnergyMode = 'productive' | 'burnout' | null;

interface EnergyState {
  mode: EnergyMode;
  setMode: (mode: EnergyMode) => void;
}

export const useEnergyStore = create<EnergyState>((set) => ({
  mode: null,
  setMode: (mode) => set({ mode }),
}));
