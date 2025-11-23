"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface BreathingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
    const [step, setStep] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [text, setText] = useState("Breathe In");

    useEffect(() => {
        if (!isOpen) return;

        const cycle = () => {
            setStep("inhale");
            setText("Breathe In");

            setTimeout(() => {
                setStep("hold");
                setText("Hold");

                setTimeout(() => {
                    setStep("exhale");
                    setText("Breathe Out");
                }, 4000); // Hold for 4s
            }, 4000); // Inhale for 4s
        };

        cycle();
        const interval = setInterval(cycle, 12000); // Total 12s cycle (4+4+4 for simplicity, or 4-7-8)

        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#F5F0E6]/90 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn">
            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-600 transition-colors"
            >
                <X size={32} />
            </button>

            <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center w-96 h-96">
                    {/* Outer Circle */}
                    <div
                        className={`absolute rounded-full border-4 border-stone-300/30 transition-all duration-[4000ms] ease-in-out
              ${step === "inhale" ? "w-80 h-80 opacity-100" : step === "hold" ? "w-80 h-80 opacity-100" : "w-32 h-32 opacity-50"}
            `}
                    />

                    {/* Inner Circle (The Breather) */}
                    <div className={`
            rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-[4000ms] ease-in-out shadow-clay
            ${step === "inhale" ? "w-64 h-64 bg-orange-200/40 shadow-[0_0_60px_rgba(251,146,60,0.4)]" : step === "hold" ? "w-64 h-64 bg-orange-200/40 shadow-[0_0_60px_rgba(251,146,60,0.4)]" : "w-24 h-24 bg-stone-300/20 shadow-none"}
          `}>
                        <span className="text-2xl font-medium text-stone-600 animate-pulse">
                            {text}
                        </span>
                    </div>
                </div>

                <p className="mt-8 text-stone-500 font-medium text-lg">
                    Focus on the circle. Let your thoughts drift away.
                </p>
            </div>
        </div>
    );
}
