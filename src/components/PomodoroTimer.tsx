import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PomodoroTimerProps {
  suggestedTask?: string;
}

export default function PomodoroTimer({ suggestedTask }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') {
        toast.success("Focus session complete! Take a break.");
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        toast.success("Break over! Ready to focus?");
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => {
    if (!isActive && mode === 'focus' && !showConfirm && suggestedTask) {
      setShowConfirm(true);
      return;
    }
    setIsActive(!isActive);
  };

  const confirmStart = () => {
    setShowConfirm(false);
    setIsActive(true);
    toast.success(`Starting focus on: ${suggestedTask}`);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    setShowConfirm(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock size={20} />
          <span className="uppercase tracking-wider font-medium text-sm">Neural Timer</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
          mode === 'focus' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-green-900/30 text-green-400 border border-green-900/50'
        }`}>
          {mode} Mode
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-7xl font-bold font-mono text-white tracking-tighter mb-2">
          {formatTime(timeLeft)}
        </div>
        {suggestedTask && (
          <p className="text-zinc-500 text-sm">
            Target: <span className="text-blue-400">{suggestedTask}</span>
          </p>
        )}
      </div>

      {showConfirm ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2">
          <p className="text-center text-zinc-300 mb-4">
            Ready to commit to <strong>{suggestedTask}</strong>?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-900 transition-colors"
            >
              Not yet
            </button>
            <button
              onClick={confirmStart}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
            >
              I'm Ready
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              isActive 
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
            }`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center justify-center transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
