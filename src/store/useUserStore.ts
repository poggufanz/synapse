import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  personalityType: string; // e.g., "The Stoic Architect"
  traits: string[]; // e.g., ["Rational", "Anxious", "Visual Learner"]
}

interface UserState {
  user: UserProfile | null;
  onboardingStep: 'login' | 'test' | 'completed';
  setUser: (user: UserProfile) => void;
  setOnboardingStep: (step: 'login' | 'test' | 'completed') => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      onboardingStep: 'login',
      setUser: (user) => set({ user }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      resetUser: () => set({ user: null, onboardingStep: 'login' }),
    }),
    {
      name: 'synapse-user-storage',
    }
  )
);
