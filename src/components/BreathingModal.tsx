import React, { useState, useEffect } from 'react';

interface BreathingModalProps {
  onClose: () => void;
}

export default function BreathingModal({ onClose }: BreathingModalProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [text, setText] = useState('Inhale...');

  useEffect(() => {
    const cycle = async () => {
      // Inhale (4s)
      setPhase('inhale');
      setText('Inhale...');
      await new Promise((r) => setTimeout(r, 4000));

      // Hold (4s)
      setPhase('hold');
      setText('Hold...');
      await new Promise((r) => setTimeout(r, 4000));

      // Exhale (4s)
      setPhase('exhale');
      setText('Exhale...');
      await new Promise((r) => setTimeout(r, 4000));
    };

    cycle(); // Initial run
    const interval = setInterval(cycle, 12000); // 4+4+4 = 12s cycle

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        
        {/* Breathing Circle */}
        <div
          className={`
            w-64 h-64 rounded-full bg-gradient-to-br from-teal-500/30 to-blue-600/30 blur-xl absolute
            transition-all duration-[4000ms] ease-in-out
            ${phase === 'inhale' ? 'scale-150 opacity-80' : ''}
            ${phase === 'hold' ? 'scale-150 opacity-80' : ''}
            ${phase === 'exhale' ? 'scale-75 opacity-40' : ''}
          `}
        />
        
        <div
          className={`
            w-48 h-48 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-[0_0_50px_rgba(45,212,191,0.3)]
            transition-all duration-[4000ms] ease-in-out z-10
            ${phase === 'inhale' ? 'scale-125' : ''}
            ${phase === 'hold' ? 'scale-125' : ''}
            ${phase === 'exhale' ? 'scale-90' : ''}
          `}
        >
          <span className="text-2xl font-medium text-white tracking-widest animate-pulse">
            {text}
          </span>
        </div>

        {/* Exit Button */}
        <button
          onClick={onClose}
          className="absolute bottom-12 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all border border-white/10 backdrop-blur-sm"
        >
          I feel better now
        </button>
      </div>
    </div>
  );
}
