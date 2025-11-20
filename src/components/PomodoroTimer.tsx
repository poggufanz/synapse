"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { toast } from "sonner";

export default function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "short" | "long">("focus");

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            toast.success("Timer finished! Take a break.");
            new Audio("/notification.mp3").play().catch(() => { }); // Placeholder for sound
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (mode === "focus") setTimeLeft(25 * 60);
        if (mode === "short") setTimeLeft(5 * 60);
        if (mode === "long") setTimeLeft(15 * 60);
    };

    const changeMode = (newMode: "focus" | "short" | "long") => {
        setMode(newMode);
        setIsActive(false);
        if (newMode === "focus") setTimeLeft(25 * 60);
        if (newMode === "short") setTimeLeft(5 * 60);
        if (newMode === "long") setTimeLeft(15 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
                <Timer className="text-cyan-400" size={20} />
                <h3 className="text-lg font-bold text-white">Adaptive Timer</h3>
            </div>

            <div className="flex justify-center gap-2 mb-6">
                {(["focus", "short", "long"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => changeMode(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${mode === m
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        {m === "focus" ? "Focus" : m === "short" ? "Short Break" : "Long Break"}
                    </button>
                ))}
            </div>

            <div className="text-center mb-6">
                <div className="text-6xl font-mono font-bold text-white tracking-wider">
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={toggleTimer}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isActive
                            ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            : "bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                        }`}
                >
                    {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
}
