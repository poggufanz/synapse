import React from 'react';
import { useEnergyStore } from '@/store/useEnergyStore';
import { Zap, BatteryLow } from 'lucide-react';

export default function EnergyGate() {
  const setMode = useEnergyStore((state) => state.setMode);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-700">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-zinc-200 to-zinc-500 bg-clip-text text-transparent">
        How is your synapse firing today?
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Productive Mode Card */}
        <button
          onClick={() => setMode('productive')}
          className="group relative flex flex-col items-center justify-center p-8 h-64 rounded-3xl border-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-900/20"
        >
          <div className="mb-6 p-4 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
            <Zap size={48} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Productive Mode</h2>
          <p className="text-zinc-400 text-center max-w-xs">
            I have energy. I want to get things done.
          </p>
        </button>

        {/* Decompression Mode Card */}
        <button
          onClick={() => setMode('burnout')}
          className="group relative flex flex-col items-center justify-center p-8 h-64 rounded-3xl border-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-teal-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-900/20"
        >
          <div className="mb-6 p-4 rounded-full bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
            <BatteryLow size={48} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Decompression Mode</h2>
          <p className="text-zinc-400 text-center max-w-xs">
            I'm feeling overwhelmed, tired, or burnt out.
          </p>
        </button>
      </div>
    </div>
  );
}
