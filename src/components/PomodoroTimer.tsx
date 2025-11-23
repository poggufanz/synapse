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
            new Audio("/notification.mp3").play().catch(() => { });
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
        <div className="bg-white rounded-[32px] p-6 shadow-soft-blue border border-slate-100 h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">🍅</span>
            </div>

            <div className="flex items-center gap-2 mb-4 z-10">
                <div className="p-2 bg-red-50 rounded-xl">
                    <Timer className="text-red-500" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Pomodoro</h3>
            </div>

            <div className="flex justify-center gap-2 mb-6 z-10">
                {(["focus", "short", "long"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => changeMode(m)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${mode === m
                            ? "bg-blue-100 text-blue-700"
                            : "text-slate-400 hover:bg-slate-50"
                            }`}
                    >
                        {m === "focus" ? "Focus" : m === "short" ? "Short" : "Long"}
                    </button>
                ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center z-10">
                <div className="text-6xl font-black font-mono text-slate-800 tracking-wider mb-4">
                    {formatTime(timeLeft)}
                </div>

                <button
                    onClick={toggleTimer}
                    className={`w-full py-3 rounded-2xl font-black transition-all duration-100 border-b-4 active:border-b-0 active:translate-y-1 ${isActive
                            ? "bg-red-100 border-red-200 text-red-600 hover:bg-red-200"
                            : "bg-blue-500 border-blue-700 text-white hover:bg-blue-400"
                        }`}
                >
                    {isActive ? "PAUSE" : "START FOCUS"}
                </button>
            </div>
        </div>
    );
}
