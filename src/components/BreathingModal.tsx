"use client";

import { useState, useEffect } from "react";

interface BreathingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

        const phaseTimings = {
            inhale: 4000,   // 4 seconds
            hold: 2000,     // 2 seconds  
            exhale: 4000,   // 4 seconds
        };

        let timeoutId: NodeJS.Timeout;

        const runCycle = () => {
            // Inhale phase
            setPhase("inhale");

            timeoutId = setTimeout(() => {
                // Hold phase
                setPhase("hold");

                timeoutId = setTimeout(() => {
                    // Exhale phase
                    setPhase("exhale");

                    timeoutId = setTimeout(() => {
                        setCycle((prev) => prev + 1);
                    }, phaseTimings.exhale);
                }, phaseTimings.hold);
            }, phaseTimings.inhale);
        };

        runCycle();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isOpen, cycle]);

    if (!isOpen) return null;

    const getPhaseText = () => {
        switch (phase) {
            case "inhale":
                return "breathe in...";
            case "hold":
                return "hold...";
            case "exhale":
                return "breathe out...";
        }
    };

    const getCircleScale = () => {
        switch (phase) {
            case "inhale":
                return "scale-100";
            case "hold":
                return "scale-100";
            case "exhale":
                return "scale-50";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-fadeIn">
            <div className="flex flex-col items-center justify-center space-y-12 p-8">
                {/* Breathing Circle */}
                <div className="relative flex items-center justify-center">
                    <div
                        className={`w-64 h-64 rounded-full bg-gradient-to-br from-teal-500/40 to-blue-500/40 border-2 border-teal-400/50 shadow-2xl shadow-teal-500/30 transition-all duration-[4000ms] ease-in-out ${getCircleScale()}`}
                        style={{
                            transform: phase === "inhale" ? "scale(1.5)" : phase === "exhale" ? "scale(0.8)" : "scale(1.2)",
                        }}
                    >
                        {/* Inner glow */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/20 to-blue-400/20 blur-xl"></div>
                    </div>

                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-2xl md:text-3xl font-light text-teal-100 animate-pulse">
                            {getPhaseText()}
                        </p>
                    </div>
                </div>

                {/* Instruction Text */}
                <div className="text-center space-y-2">
                    <p className="text-slate-400 text-sm">follow the circle</p>
                    <p className="text-slate-500 text-xs">let your breath match the rhythm</p>
                </div>

                {/* Exit Button */}
                <button
                    onClick={onClose}
                    className="mt-8 bg-slate-800/50 hover:bg-slate-800/70 backdrop-blur-sm border border-slate-600/40 hover:border-slate-500/60 text-slate-300 hover:text-white font-medium py-4 px-8 rounded-full transition-all duration-300 hover:scale-105"
                >
                    i feel better now
                </button>
            </div>
        </div>
    );
}
