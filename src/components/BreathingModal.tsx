"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { addWellnessPoints } from "./GrowthGarden";

interface BreathingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [text, setText] = useState("inhale");

    // Use refs to properly manage timers
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const exhaleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasCompletedPhaseRef = useRef(false); // Track if user did at least one phase

    const handleClose = () => {
        // Award points if user completed at least one phase transition
        if (hasCompletedPhaseRef.current) {
            addWellnessPoints("breathing", 5);
            hasCompletedPhaseRef.current = false;
        }
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            // Clear all timers when modal closes
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
            if (exhaleTimeoutRef.current) clearTimeout(exhaleTimeoutRef.current);
            return;
        }

        // Reset to initial state when opening
        setPhase("inhale");
        setText("inhale");

        const runCycle = () => {
            // Clear any existing timeouts before starting new cycle
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
            if (exhaleTimeoutRef.current) clearTimeout(exhaleTimeoutRef.current);

            // Phase 1: Inhale (0s - 4s)
            setPhase("inhale");
            setText("inhale");

            // Phase 2: Hold (4s - 8s)
            holdTimeoutRef.current = setTimeout(() => {
                setPhase("hold");
                setText("hold");
                hasCompletedPhaseRef.current = true; // User completed at least one phase
            }, 4000);

            // Phase 3: Exhale (8s - 12s)
            exhaleTimeoutRef.current = setTimeout(() => {
                setPhase("exhale");
                setText("exhale");
            }, 8000);
        };

        runCycle(); // Run immediately
        intervalRef.current = setInterval(runCycle, 12000); // Repeat every 12s

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
            if (exhaleTimeoutRef.current) clearTimeout(exhaleTimeoutRef.current);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0f1a2e] via-[#1a2642] to-[#2a1f4e] z-[100] flex items-center justify-center">
            {/* Close button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors p-2"
            >
                <X size={32} />
            </button>

            <div className="flex flex-col items-center justify-center w-full h-full">
                {/* Breathing Circle Container */}
                <div className="relative flex items-center justify-center w-96 h-96">
                    {/* Outer glow rings */}
                    <div
                        className={`absolute rounded-full border border-[#4fd1c5]/30 transition-all duration-[4000ms] ease-in-out ${phase === "inhale" ? "w-80 h-80 opacity-100" :
                            phase === "hold" ? "w-80 h-80 opacity-80" :
                                "w-48 h-48 opacity-50"
                            }`}
                    />
                    <div
                        className={`absolute rounded-full border border-[#4fd1c5]/20 transition-all duration-[4000ms] ease-in-out ${phase === "inhale" ? "w-96 h-96 opacity-100" :
                            phase === "hold" ? "w-96 h-96 opacity-60" :
                                "w-56 h-56 opacity-30"
                            }`}
                    />

                    {/* The Breathing Circle - Gradient teal like BurnoutView */}
                    <div
                        className={`
                            rounded-full flex items-center justify-center text-center
                            bg-gradient-to-br from-[#4fd1c5] to-[#2dd4bf]
                            transition-all duration-[4000ms] ease-in-out
                            ${phase === "inhale" ? "w-64 h-64" :
                                phase === "hold" ? "w-64 h-64" :
                                    "w-32 h-32"}
                        `}
                        style={{
                            boxShadow: `0 0 ${phase === "inhale" ? 80 : phase === "exhale" ? 30 : 60}px rgba(79,209,197,${phase === "inhale" ? 0.6 : phase === "exhale" ? 0.2 : 0.4})`
                        }}
                    >
                        <span className={`
                            font-medium text-xl md:text-2xl text-[#0f1a2e] tracking-wide
                            transition-opacity duration-500
                            ${phase === "hold" ? "opacity-100" : "opacity-90"}
                        `}>
                            {text}
                        </span>
                    </div>
                </div>

                {/* Instruction text */}
                <p className="mt-12 text-white/40 text-sm italic">
                    focus on your breath
                </p>

                {/* Stop button */}
                <button
                    onClick={handleClose}
                    className="mt-6 text-white/60 hover:text-white text-sm transition-colors"
                >
                    stop breathing
                </button>
            </div>
        </div>
    );
}
