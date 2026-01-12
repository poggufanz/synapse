"use client";

import { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { addWellnessPoints } from "./GrowthGarden";

interface BreathingModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode?: boolean;
}

const DURATIONS = [
    { label: "1 min", seconds: 60 },
    { label: "3 min", seconds: 180 },
    { label: "5 min", seconds: 300 },
];

export default function BreathingModal({ isOpen, onClose, isDarkMode = false }: BreathingModalProps) {
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [text, setText] = useState("Inhale...");
    const [isPaused, setIsPaused] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(0); // index
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const exhaleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasCompletedPhaseRef = useRef(false);

    const handleClose = () => {
        if (hasCompletedPhaseRef.current) {
            addWellnessPoints("breathing", 5);
            hasCompletedPhaseRef.current = false;
        }
        setElapsedTime(0);
        setIsPaused(false);
        onClose();
    };

    // Timer
    useEffect(() => {
        if (!isOpen || isPaused) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setElapsedTime(prev => {
                if (prev >= DURATIONS[selectedDuration].seconds) {
                    handleClose();
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen, isPaused, selectedDuration]);

    // Breathing cycle
    useEffect(() => {
        if (!isOpen || isPaused) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
            if (exhaleTimeoutRef.current) clearTimeout(exhaleTimeoutRef.current);
            return;
        }

        setPhase("inhale");
        setText("Inhale...");

        const runCycle = () => {
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
            if (exhaleTimeoutRef.current) clearTimeout(exhaleTimeoutRef.current);

            setPhase("inhale");
            setText("Inhale...");

            holdTimeoutRef.current = setTimeout(() => {
                setPhase("hold");
                setText("Hold...");
                hasCompletedPhaseRef.current = true;
            }, 4000);

            exhaleTimeoutRef.current = setTimeout(() => {
                setPhase("exhale");
                setText("Exhale...");
            }, 8000);
        };

        runCycle();
        intervalRef.current = setInterval(runCycle, 12000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
            if (exhaleTimeoutRef.current) clearTimeout(exhaleTimeoutRef.current);
        };
    }, [isOpen, isPaused]);

    if (!isOpen) return null;

    const progress = (elapsedTime / DURATIONS[selectedDuration].seconds) * 100;
    const formatTime = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
            style={{
                fontFamily: "'Nunito', sans-serif",
                backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                backgroundImage: isDarkMode
                    ? 'none'
                    : 'linear-gradient(to bottom right, #fffbf5, #fcf6f0, #fcefe6)'
            }}
        >
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 z-10">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{
                            backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                            boxShadow: isDarkMode
                                ? '4px 4px 8px #1a120b, -4px -4px 8px #2c1e13'
                                : '4px 4px 8px #e0d8cc, -4px -4px 8px #ffffff',
                            color: '#e56e06'
                        }}
                    >
                        <span className="text-xl">🧘</span>
                    </div>
                    <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1c140d]'}`}>
                        Synapse <span className="font-normal opacity-60">| Burnout Shield</span>
                    </h2>
                </div>
                <button
                    onClick={handleClose}
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    style={{
                        backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                        boxShadow: isDarkMode
                            ? '8px 8px 16px #1a120b, -8px -8px 16px #2c1e13'
                            : '8px 8px 16px #e0d8cc, -8px -8px 16px #ffffff',
                        color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#1c140d'
                    }}
                >
                    <X size={24} />
                </button>
            </header>

            {/* Main Content - fixed layout that fits in viewport */}
            <main className="flex-1 flex flex-col items-center justify-between px-4 min-h-0">
                {/* Contextual Heading */}
                <div className="text-center pt-2 z-10">
                    <p className="font-medium tracking-widest text-xs uppercase mb-1" style={{ color: '#e56e06' }}>
                        Re-center your energy
                    </p>
                    <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1c140d]'}`}>
                        {text}
                    </h1>
                </div>

                {/* Breathing Visualizer - fixed size container */}
                <div className="relative flex items-center justify-center flex-shrink-0" style={{ height: '200px' }}>
                    {/* Subtle outer glow ring - small and doesn't expand */}
                    <div
                        className={`absolute rounded-full transition-all duration-[4000ms] ease-in-out ${phase === "inhale" ? "w-48 h-48 opacity-40" :
                            phase === "hold" ? "w-48 h-48 opacity-50" :
                                "w-40 h-40 opacity-30"
                            }`}
                        style={{
                            border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(229,110,6,0.2)'}`,
                        }}
                    />

                    {/* Main Orb Container - fixed 180px */}
                    <div
                        className="relative w-44 h-44 rounded-full flex items-center justify-center"
                        style={{
                            backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                            boxShadow: isDarkMode
                                ? '15px 15px 40px #1a120b, -15px -15px 40px #2c1e13'
                                : '15px 15px 40px #e0d8cc, -15px -15px 40px #ffffff'
                        }}
                    >
                        {/* Inner Track */}
                        <div
                            className="w-32 h-32 rounded-full flex items-center justify-center relative overflow-hidden"
                            style={{
                                backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                boxShadow: isDarkMode
                                    ? 'inset 4px 4px 8px #1a120b, inset -4px -4px 8px #2c1e13'
                                    : 'inset 4px 4px 8px #e0d8cc, inset -4px -4px 8px #ffffff'
                            }}
                        >
                            {/* Progress Fill */}
                            <div
                                className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-[4000ms]"
                                style={{
                                    height: phase === "inhale" ? '60%' : phase === "hold" ? '60%' : '20%',
                                    backgroundColor: 'rgba(229, 110, 6, 0.15)'
                                }}
                            />

                            {/* Core (Breathing Element) */}
                            <div
                                className={`rounded-full flex items-center justify-center z-10 transition-all duration-[4000ms] ease-in-out ${phase === "inhale" ? "w-16 h-16" :
                                    phase === "hold" ? "w-16 h-16" :
                                        "w-12 h-12"
                                    }`}
                                style={{
                                    background: 'linear-gradient(to top right, #e56e06, #ff9e4d)',
                                    boxShadow: `0 0 ${phase === "inhale" ? 25 : phase === "exhale" ? 10 : 20}px rgba(229,110,6,${phase === "inhale" ? 0.5 : phase === "exhale" ? 0.3 : 0.4})`
                                }}
                            >
                                <span className={`text-white transition-all duration-500 ${phase === "exhale" ? "text-lg" : "text-2xl"}`}>
                                    🌬️
                                </span>
                            </div>
                        </div>

                        {/* Floating Indicator Dot */}
                        <div
                            className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: '#e56e06',
                                boxShadow: '0 0 8px #e56e06'
                            }}
                        />
                    </div>
                </div>

                {/* Instruction Text */}
                <p className={`text-xs font-normal tracking-wide text-center max-w-sm px-4 ${isDarkMode ? 'text-white/50' : 'text-[#9e7047]'}`}>
                    Follow the rhythm of the light. Let your thoughts pass like clouds.
                </p>

                {/* Controls Container - compact */}
                <div className="flex flex-col items-center gap-3 w-full max-w-lg px-6 z-10 pb-2">
                    {/* Duration Selector - smaller */}
                    <div
                        className="flex p-1.5 rounded-full gap-1 w-full max-w-[240px]"
                        style={{
                            backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                            boxShadow: isDarkMode
                                ? 'inset 4px 4px 8px #1a120b, inset -4px -4px 8px #2c1e13'
                                : 'inset 4px 4px 8px #e0d8cc, inset -4px -4px 8px #ffffff'
                        }}
                    >
                        {DURATIONS.map((dur, idx) => (
                            <button
                                key={dur.label}
                                onClick={() => { setSelectedDuration(idx); setElapsedTime(0); }}
                                className={`flex-1 py-1.5 rounded-full font-medium text-xs transition-all ${selectedDuration === idx
                                    ? 'font-bold'
                                    : isDarkMode ? 'text-white/40' : 'text-gray-400'
                                    }`}
                                style={selectedDuration === idx ? {
                                    backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                    boxShadow: isDarkMode
                                        ? '3px 3px 6px #1a120b, -3px -3px 6px #2c1e13'
                                        : '3px 3px 6px #e0d8cc, -3px -3px 6px #ffffff',
                                    color: '#e56e06'
                                } : undefined}
                            >
                                {dur.label}
                            </button>
                        ))}
                    </div>

                    {/* Playback Controls - smaller */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                                backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                boxShadow: isDarkMode
                                    ? '6px 6px 12px #1a120b, -6px -6px 12px #2c1e13'
                                    : '6px 6px 12px #e0d8cc, -6px -6px 12px #ffffff',
                                color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                            }}
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>

                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-105"
                            style={{
                                backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                boxShadow: isDarkMode
                                    ? '6px 6px 12px #1a120b, -6px -6px 12px #2c1e13'
                                    : '6px 6px 12px #e0d8cc, -6px -6px 12px #ffffff',
                                color: '#e56e06'
                            }}
                        >
                            {isPaused ? <Play size={24} /> : <Pause size={24} />}
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer / Progress - compact */}
            <div className="w-full px-8 pb-4 pt-2">
                <div className={`flex justify-between text-[10px] font-medium uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                    <span>{isPaused ? 'Paused' : 'Relaxing'}</span>
                    <span>{formatTime(elapsedTime)} / {formatTime(DURATIONS[selectedDuration].seconds)}</span>
                </div>
                {/* Progress Bar */}
                <div
                    className="h-3 w-full rounded-full p-[2px]"
                    style={{
                        backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                        boxShadow: isDarkMode
                            ? 'inset 4px 4px 8px #1a120b, inset -4px -4px 8px #2c1e13'
                            : 'inset 4px 4px 8px #e0d8cc, inset -4px -4px 8px #ffffff'
                    }}
                >
                    <div
                        className="h-full rounded-full relative transition-all duration-1000"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(to right, rgba(229,110,6,0.8), #e56e06)'
                        }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-50 mr-0.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
