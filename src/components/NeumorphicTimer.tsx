"use client";

import { Play, Pause, Volume2, Music } from "lucide-react";

interface NeumorphicTimerProps {
    timeLeft: number;
    isRunning: boolean;
    onToggle: () => void;
    duration: number;
    setDuration: (duration: number) => void;
    progress: number;
}

export default function NeumorphicTimer({
    timeLeft,
    isRunning,
    onToggle,
    duration,
    setDuration,
    progress,
}: NeumorphicTimerProps) {
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-[#F0F0F3] rounded-[40px] p-8 shadow-[-10px_-10px_30px_#FFFFFF,10px_10px_30px_#AEAEC040] flex flex-col items-center justify-center relative">
            {/* Ambient Light Highlight */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[40px]" />

            {/* Timer Dial */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                {/* Outer Extruded Ring */}
                <div className="absolute inset-0 rounded-full bg-[#F0F0F3] shadow-[-10px_-10px_20px_#FFFFFF,10px_10px_20px_#AEAEC040] flex items-center justify-center">
                    {/* Inner Pressed Ring (Track) */}
                    <div className="w-52 h-52 rounded-full bg-[#F0F0F3] shadow-[inset_-5px_-5px_15px_#FFFFFF,inset_5px_5px_15px_#AEAEC040] flex items-center justify-center relative">
                        
                        {/* Progress SVG */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90 p-4" viewBox="0 0 220 220">
                            <circle
                                cx="110"
                                cy="110"
                                r="98"
                                fill="none"
                                stroke="transparent"
                                strokeWidth="8"
                            />
                            <circle
                                cx="110"
                                cy="110"
                                r="98"
                                fill="none"
                                stroke="#1E73FF"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 98}`}
                                strokeDashoffset={`${2 * Math.PI * 98 * (1 - progress / 100)}`}
                                className="transition-all duration-1000 ease-linear drop-shadow-[0_0_10px_rgba(30,115,255,0.5)]"
                            />
                        </svg>

                        {/* Time Display */}
                        <div className="flex flex-col items-center z-10">
                            <span className="text-5xl font-bold text-[#1E73FF] tracking-wider drop-shadow-sm font-mono">
                                {formatTime(timeLeft)}
                            </span>
                            <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                {isRunning ? "Focusing" : "Ready"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Container */}
            <div className="w-full space-y-6 relative z-10">
                {/* Duration Toggles */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setDuration(25)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                            duration === 25
                                ? "bg-[#F0F0F3] text-[#1E73FF] shadow-[-5px_-5px_10px_#FFFFFF,5px_5px_10px_#AEAEC040,inset_-2px_-2px_5px_#FFFFFF,inset_2px_2px_5px_#AEAEC020]"
                                : "bg-[#F0F0F3] text-slate-400 shadow-[-5px_-5px_10px_#FFFFFF,5px_5px_10px_#AEAEC040] hover:text-slate-600"
                        }`}
                    >
                        Sprint 25m
                    </button>
                    <button
                        onClick={() => setDuration(90)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                            duration === 90
                                ? "bg-[#F0F0F3] text-[#1E73FF] shadow-[-5px_-5px_10px_#FFFFFF,5px_5px_10px_#AEAEC040,inset_-2px_-2px_5px_#FFFFFF,inset_2px_2px_5px_#AEAEC020]"
                                : "bg-[#F0F0F3] text-slate-400 shadow-[-5px_-5px_10px_#FFFFFF,5px_5px_10px_#AEAEC040] hover:text-slate-600"
                        }`}
                    >
                        Deep Dive 90m
                    </button>
                </div>

                {/* Main Action Button */}
                <button
                    onClick={onToggle}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                        isRunning
                            ? "bg-[#F0F0F3] text-[#1E73FF] shadow-[inset_-5px_-5px_10px_#FFFFFF,inset_5px_5px_10px_#AEAEC040]"
                            : "bg-[#1E73FF] text-white shadow-[-5px_-5px_15px_#FFFFFF,5px_5px_15px_#AEAEC060] hover:bg-[#1664E0] active:scale-[0.98]"
                    }`}
                >
                    {isRunning ? (
                        <>
                            <Pause size={20} fill="currentColor" />
                            Pause Session
                        </>
                    ) : (
                        <>
                            <Play size={20} fill="currentColor" />
                            Start Focus
                        </>
                    )}
                </button>

                {/* Soundscapes Toggle */}
                <div className="flex justify-center">
                    <button className="w-12 h-12 rounded-full bg-[#F0F0F3] flex items-center justify-center text-slate-400 shadow-[-5px_-5px_10px_#FFFFFF,5px_5px_10px_#AEAEC040] hover:text-[#1E73FF] hover:shadow-[inset_-3px_-3px_8px_#FFFFFF,inset_3px_3px_8px_#AEAEC040] transition-all overflow-hidden p-2">
                        <img src="/images/logo.png" alt="Soundscapes" className="w-full h-full object-contain opacity-60 hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>
        </div>
    );
}
