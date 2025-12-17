"use client";

import { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX, Play, Pause, Settings } from "lucide-react";
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center relative px-4">
                {/* Contextual Heading */}
                <div className="text-center mb-8 z-10 space-y-2">
                    <p className="font-medium tracking-widest text-sm uppercase" style={{ color: '#e56e06' }}>
                        Re-center your energy
                    </p>
                    <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1c140d]'}`}>
                        {text}
                    </h1>
                </div>

                {/* Breathing Visualizer (Neomorphic Orb) */}
                <div className="relative flex items-center justify-center py-10">
                    {/* Outer Rings */}
                    <div
                        className={`absolute rounded-full border opacity-50 transition-all duration-[4000ms] ease-in-out ${phase === "inhale" ? "w-[500px] h-[500px]" :
                                phase === "hold" ? "w-[500px] h-[500px]" :
                                    "w-[320px] h-[320px]"
                            }`}
                        style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)' }}
                    />
                    <div
                        className={`absolute rounded-full border opacity-60 transition-all duration-[4000ms] ease-in-out ${phase === "inhale" ? "w-[400px] h-[400px]" :
                                phase === "hold" ? "w-[400px] h-[400px]" :
                                    "w-[260px] h-[260px]"
                            }`}
                        style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)' }}
                    />

                    {/* Main Orb Container */}
                    <div
                        className="relative w-72 h-72 md:w-80 md:h-80 rounded-full flex items-center justify-center"
                        style={{
                            backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                            boxShadow: isDarkMode
                                ? '20px 20px 60px #1a120b, -20px -20px 60px #2c1e13'
                                : '20px 20px 60px #e0d8cc, -20px -20px 60px #ffffff'
                        }}
                    >
                        {/* Inner Track (Pressed) */}
                        <div
                            className="w-56 h-56 rounded-full flex items-center justify-center relative overflow-hidden"
                            style={{
                                backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                boxShadow: isDarkMode
                                    ? 'inset 6px 6px 12px #1a120b, inset -6px -6px 12px #2c1e13'
                                    : 'inset 6px 6px 12px #e0d8cc, inset -6px -6px 12px #ffffff'
                            }}
                        >
                            {/* Progress Fill */}
                            <div
                                className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-[4000ms]"
                                style={{
                                    height: phase === "inhale" ? '60%' : phase === "hold" ? '60%' : '20%',
                                    backgroundColor: 'rgba(229, 110, 6, 0.1)'
                                }}
                            />

                            {/* Core (Breathing Element) */}
                            <div
                                className={`rounded-full flex items-center justify-center z-10 transition-all duration-[4000ms] ease-in-out ${phase === "inhale" ? "w-32 h-32" :
                                        phase === "hold" ? "w-32 h-32" :
                                            "w-20 h-20"
                                    }`}
                                style={{
                                    background: 'linear-gradient(to top right, #e56e06, #ff9e4d)',
                                    boxShadow: `0 0 ${phase === "inhale" ? 40 : phase === "exhale" ? 15 : 30}px rgba(229,110,6,${phase === "inhale" ? 0.4 : phase === "exhale" ? 0.2 : 0.3})`
                                }}
                            >
                                <span className={`text-white transition-all duration-500 ${phase === "exhale" ? "text-xl" : "text-3xl"}`}>
                                    🌬️
                                </span>
                            </div>
                        </div>

                        {/* Floating Indicator Dot */}
                        <div
                            className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: '#e56e06',
                                boxShadow: '0 0 10px #e56e06'
                            }}
                        />
                    </div>
                </div>

                {/* Instruction Text */}
                <p className={`text-base font-normal mt-8 mb-10 tracking-wide text-center max-w-md px-4 ${isDarkMode ? 'text-white/50' : 'text-[#9e7047]'}`}>
                    Follow the rhythm of the light. Let your thoughts pass like clouds.
                </p>

                {/* Controls Container */}
                <div className="flex flex-col items-center gap-8 w-full max-w-lg px-6 z-10">
                    {/* Duration Selector */}
                    <div
                        className="flex p-2 rounded-full gap-2 w-full max-w-xs"
                        style={{
                            backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                            boxShadow: isDarkMode
                                ? 'inset 6px 6px 12px #1a120b, inset -6px -6px 12px #2c1e13'
                                : 'inset 6px 6px 12px #e0d8cc, inset -6px -6px 12px #ffffff'
                        }}
                    >
                        {DURATIONS.map((dur, idx) => (
                            <button
                                key={dur.label}
                                onClick={() => { setSelectedDuration(idx); setElapsedTime(0); }}
                                className={`flex-1 py-2 rounded-full font-medium text-sm transition-all ${selectedDuration === idx
                                        ? 'font-bold'
                                        : isDarkMode ? 'text-white/40' : 'text-gray-400'
                                    }`}
                                style={selectedDuration === idx ? {
                                    backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                    boxShadow: isDarkMode
                                        ? '4px 4px 8px #1a120b, -4px -4px 8px #2c1e13'
                                        : '4px 4px 8px #e0d8cc, -4px -4px 8px #ffffff',
                                    color: '#e56e06'
                                } : undefined}
                            >
                                {dur.label}
                            </button>
                        ))}
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                                backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                boxShadow: isDarkMode
                                    ? '8px 8px 16px #1a120b, -8px -8px 16px #2c1e13'
                                    : '8px 8px 16px #e0d8cc, -8px -8px 16px #ffffff',
                                color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                            }}
                        >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 hover:scale-105"
                            style={{
                                backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                boxShadow: isDarkMode
                                    ? '8px 8px 16px #1a120b, -8px -8px 16px #2c1e13'
                                    : '8px 8px 16px #e0d8cc, -8px -8px 16px #ffffff',
                                color: '#e56e06'
                            }}
                        >
                            {isPaused ? <Play size={32} /> : <Pause size={32} />}
                        </button>

                        <button
                            className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                                backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                                boxShadow: isDarkMode
                                    ? '8px 8px 16px #1a120b, -8px -8px 16px #2c1e13'
                                    : '8px 8px 16px #e0d8cc, -8px -8px 16px #ffffff',
                                color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                            }}
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer / Progress */}
            <div className="w-full px-12 pb-8 pt-4">
                <div className={`flex justify-between text-xs font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                    <span>{isPaused ? 'Paused' : 'Relaxing'}</span>
                    <span>{formatTime(elapsedTime)} / {formatTime(DURATIONS[selectedDuration].seconds)}</span>
                </div>
                {/* Neomorphic Progress Bar */}
                <div
                    className="h-4 w-full rounded-full p-[2px]"
                    style={{
                        backgroundColor: isDarkMode ? '#23180f' : '#fcf6f0',
                        boxShadow: isDarkMode
                            ? 'inset 6px 6px 12px #1a120b, inset -6px -6px 12px #2c1e13'
                            : 'inset 6px 6px 12px #e0d8cc, inset -6px -6px 12px #ffffff'
                    }}
                >
                    <div
                        className="h-full rounded-full relative transition-all duration-1000"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(to right, rgba(229,110,6,0.8), #e56e06)'
                        }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-50 mr-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
