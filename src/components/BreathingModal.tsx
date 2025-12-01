"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface BreathingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [text, setText] = useState("Breathe In...");

    useEffect(() => {
        if (!isOpen) return;

        // Reset to initial state when opening
        setPhase("inhale");
        setText("Breathe In...");

        const runCycle = () => {
            // Phase 1: Inhale (0s - 4s)
            setPhase("inhale");
            setText("Breathe In...");

            // Phase 2: Hold (4s - 8s)
            setTimeout(() => {
                setPhase("hold");
                setText("Hold");
            }, 4000);

            // Phase 3: Exhale (8s - 12s)
            setTimeout(() => {
                setPhase("exhale");
                setText("Breathe Out...");
            }, 8000);
        };

        runCycle(); // Run immediately
        const interval = setInterval(runCycle, 12000); // Repeat every 12s

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#F5F0E6]/90 backdrop-blur-md z-[100] flex items-center justify-center animate-fadeIn">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-8 right-8 text-[#3E2723]/40 hover:text-[#3E2723] transition-colors p-2"
            >
                <X size={32} />
            </button>

            <div className="flex flex-col items-center justify-center w-full h-full">
                {/* Breathing Circle Container */}
                <div className="relative flex items-center justify-center w-96 h-96">
                    {/* The Breathing Circle */}
                    <div
                        className={`
                            rounded-full flex items-center justify-center text-center
                            transition-all duration-[4000ms] ease-in-out
                            shadow-2xl
                            ${phase === "inhale" ? "w-80 h-80 bg-[#D7CCC8]" :
                                phase === "hold" ? "w-80 h-80 bg-[#D7CCC8]" :
                                    "w-40 h-40 bg-[#D7CCC8]"}
                        `}
                    >
                        <span className={`
                            font-serif text-2xl md:text-3xl text-[#3E2723] font-medium tracking-wide
                            transition-opacity duration-500
                            ${phase === "hold" ? "opacity-100" : "opacity-90"}
                        `}>
                            {text}
                        </span>
                    </div>

                    {/* Outer Ripple/Guide Circle (Optional, for visual depth) */}
                    <div
                        className={`
                            absolute rounded-full border-2 border-[#3E2723]/10
                            transition-all duration-[4000ms] ease-in-out
                            ${phase === "inhale" || phase === "hold" ? "w-96 h-96 opacity-100" : "w-48 h-48 opacity-50"}
                        `}
                    />
                </div>

                <p className="mt-12 text-[#3E2723]/60 font-serif text-lg animate-pulse">
                    Focus on your breath.
                </p>
            </div>
        </div>
    );
}
