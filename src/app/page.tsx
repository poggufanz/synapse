'use client';

import React, { useEffect, useState } from 'react';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useUserStore } from '@/store/useUserStore';
import EnergyGate from '@/components/EnergyGate';
import ProductiveView from '@/components/ProductiveView';
import BurnoutView from '@/components/BurnoutView';
import LoginView from '@/components/Onboarding/LoginView';
import PsychologyTest from '@/components/Onboarding/PsychologyTest';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  const mode = useEnergyStore((state) => state.mode);
  const setMode = useEnergyStore((state) => state.setMode);
  const { onboardingStep, resetUser } = useUserStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleReset = () => {
    setMode(null);
    resetUser();
  };

  // 1. Login Phase
  if (onboardingStep === 'login') {
    return <LoginView />;
  }

  // 2. Psychology Test Phase
  if (onboardingStep === 'test') {
    return <PsychologyTest />;
  }

  // 3. Main App Phase (Energy Gate & Modes)
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-zinc-950 text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Reset Button (Demo Purpose) */}
      <button
        onClick={handleReset}
        className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-zinc-300 transition-colors z-50"
        title="Reset Demo & User"
      >
        <RotateCcw size={20} />
      </button>

      <div className="z-10 w-full">
        {mode === 'productive' && <ProductiveView />}
        {mode === 'burnout' && <BurnoutView />}
        {!mode && <EnergyGate />}
      </div>
    </main>
  );
}
