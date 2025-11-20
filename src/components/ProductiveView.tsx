import React, { useState, useEffect } from 'react';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useUserStore } from '@/store/useUserStore';
import DashboardStats from './DashboardStats';
import IdeaVault from './IdeaVault';
import ProductiveChat from './ProductiveChat';
import PomodoroTimer from './PomodoroTimer';
import { toast } from 'sonner';
import { Rocket, LogOut, Hammer, Loader2, BatteryLow } from 'lucide-react';

interface MicroStep {
  step: string;
  energy_tag: 'Deep Work' | 'Shallow Work' | 'Recovery';
}

export default function ProductiveView() {
  const setMode = useEnergyStore((state) => state.setMode);
  const user = useUserStore((state) => state.user);
  const [input, setInput] = useState('');
  const [tasks, setTasks] = useState<MicroStep[]>([]);
  const [loading, setLoading] = useState(false);

  // Smart Time Check
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) {
        toast("It's late. Your brain needs sleep to encode memory.", {
          description: "Consider calling it a night.",
          duration: 8000,
        });
      }
    };
    checkTime();
  }, []);

  const handleTired = () => {
    toast("Permission to rest granted.", {
      description: `Listen to your body, ${user?.name || 'Friend'}. Recovery is part of productivity.`,
      action: {
        label: "Switch to Decompression",
        onClick: () => setMode('burnout'),
      },
    });
  };

  const handleBreakdown = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: input,
          userProfile: user 
        }),
      });
      
      if (res.ok) {
        const newSteps = await res.json();
        setTasks((prev) => [...prev, ...newSteps]);
        setInput('');
        toast.success('Task broken down successfully! 🔨');
      }
    } catch (error) {
      console.error('Failed to break down task', error);
      toast.error('Failed to break down task. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (tag: string) => {
    switch (tag) {
      case 'Deep Work': return 'bg-red-900/50 text-red-200 border-red-800';
      case 'Shallow Work': return 'bg-blue-900/50 text-blue-200 border-blue-800';
      case 'Recovery': return 'bg-green-900/50 text-green-200 border-green-800';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 animate-in fade-in zoom-in duration-500">
      <IdeaVault />
      <ProductiveChat />
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Rocket size={24} />
          </div>
          <h1 className="text-3xl font-bold text-blue-400">
            Productive Mode
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTired}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors px-4 py-2 rounded-lg hover:bg-amber-900/20 border border-amber-900/30"
          >
            <BatteryLow size={18} />
            <span className="hidden sm:inline">I'm Tired</span>
          </button>
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-zinc-800"
          >
            <LogOut size={18} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      <PomodoroTimer suggestedTask={tasks[0]?.step} />

      <div className="mb-8 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <DashboardStats />
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl mb-8">
        <div className="flex gap-4 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBreakdown()}
            placeholder="What's the big vague task?"
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleBreakdown}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Hammer size={20} />}
            {loading ? 'Analyzing...' : 'Break It Down'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-colors animate-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-lg text-zinc-200">{task.step}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(task.energy_tag)}`}>
              {task.energy_tag}
            </span>
          </div>
        ))}
        
        {tasks.length === 0 && !loading && (
          <div className="text-center text-zinc-600 py-12 border-2 border-dashed border-zinc-800 rounded-xl">
            No tasks yet. Feed the AI something big!
          </div>
        )}
      </div>
    </div>
  );
}
