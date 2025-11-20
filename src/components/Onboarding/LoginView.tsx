import React, { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { ArrowRight, BrainCircuit } from 'lucide-react';

export default function LoginView() {
  const [name, setName] = useState('');
  const setOnboardingStep = useUserStore((state) => state.setOnboardingStep);
  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Initialize basic user profile
    setUser({
      name: name.trim(),
      personalityType: 'Unknown',
      traits: [],
    });
    
    setOnboardingStep('test');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in zoom-in duration-700">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 animate-pulse">
            <BrainCircuit size={64} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Welcome to Synapse
        </h1>
        <p className="text-zinc-400 text-center mb-10">
          Your personalized neural productivity interface.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-zinc-300 ml-1">
              What should we call you?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-2xl px-6 py-4 text-lg text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full btn-primary flex items-center justify-center gap-2 group"
          >
            <span>Initialize System</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
