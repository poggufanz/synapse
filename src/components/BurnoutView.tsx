"use client";

import { useState, useEffect } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { useAppStore } from "@/store/useAppStore";
import { ArrowLeft, Wind } from "lucide-react";
import BreathingModal from "./BreathingModal";
import Image from "next/image";

interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

export default function BurnoutView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);
    const setMoodState = useAppStore((state) => state.setMoodState);

    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [currentAiMessage, setCurrentAiMessage] = useState("");
    const [lastUserResponse, setLastUserResponse] = useState<string | null>(null);

    const [isBreathingOpen, setIsBreathingOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualMessage, setManualMessage] = useState("");

    // Initial greeting
    useEffect(() => {
        if (history.length === 0 && !currentAiMessage) {
            const initialMsg = `hey ${persona?.name.toLowerCase() || "friend"}. it's quiet here. no tasks, no pressure. just us. how are you feeling right now?`;
            setCurrentAiMessage(initialMsg);
            setHistory([{ role: "ai", content: initialMsg }]);
        }
    }, [persona, history.length, currentAiMessage]);

    const handleOptionClick = async (option: string) => {
        setLastUserResponse(option);
        setIsLoading(true);

        // Adaptive Logic: Set Mood State
        if (option.toLowerCase().includes("anxious") || option.toLowerCase().includes("foggy")) {
            setMoodState("anxious");
        } else if (option.toLowerCase().includes("exhausted")) {
            setMoodState("exhausted");
        } else if (option.toLowerCase().includes("moment")) {
            setMoodState("neutral");
        }

        const newHistory = [...history, { role: "user", content: option } as ChatMessage];
        setHistory(newHistory);

        try {
            const response = await fetch("/api/chat-burnout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: newHistory,
                    message: option,
                    persona,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentAiMessage(data.message);
                setHistory((prev) => [...prev, { role: "ai", content: data.message }]);
            }
        } catch (error) {
            console.error("Burnout chat error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const options = [
        "i'm exhausted",
        "my brain is foggy",
        "i feel anxious",
        "just need a moment",
        "Type your own..."
    ];

    return (
        <div className="min-h-screen bg-[#F7F4EB] text-[#4A3728] py-12 px-4 relative flex flex-col items-center justify-center font-serif transition-opacity duration-1000 animate-[fadeIn_1s_ease-out] overflow-hidden">
            {/* Breathing Modal (Glassmorphism handled in component) */}
            <BreathingModal isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />

            {/* Exit Button */}
            <button
                onClick={() => setMode(null)}
                className="absolute top-8 right-8 text-[#4A3728]/40 hover:text-[#4A3728] transition-colors z-50"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="w-full max-w-4xl flex flex-col items-center relative z-10 space-y-12">

                {/* TOP: The Mascot (Claymorphism Anchor) */}
                {/* Soft Clay Disc: rounded-full, shadow-xl, inner shadow for 3D puffiness */}
                <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center rounded-full bg-[#F7F4EB] shadow-[20px_20px_60px_#d2cfc8,-20px_-20px_60px_#ffffff,inset_10px_10px_30px_#d2cfc8,inset_-10px_-10px_30px_#ffffff] animate-[float_6s_ease-in-out_infinite]">
                    <div className="relative w-56 h-56 md:w-64 md:h-64">
                        <Image
                            src="/images/koala_mascot.png"
                            alt="Koala Mascot"
                            fill
                            className="object-contain mix-blend-multiply drop-shadow-xl"
                            priority
                        />
                    </div>
                </div>

                {/* MIDDLE: The Conversation */}
                <div className="w-full flex flex-col items-center justify-center text-center space-y-6">

                    {/* Previous User Answer Bubble */}
                    {lastUserResponse && !isLoading && (
                        <div className="animate-[fadeIn_1s_ease-out] bg-[#F7F4EB] px-6 py-2 rounded-full text-sm font-medium text-[#4A3728]/60 mb-4 shadow-[inset_4px_4px_8px_#d2cfc8,inset_-4px_-4px_8px_#ffffff]">
                            "{lastUserResponse}"
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-2 items-center">
                                <div className="w-3 h-3 bg-[#4A3728] rounded-full animate-bounce" />
                                <div className="w-3 h-3 bg-[#4A3728] rounded-full animate-bounce delay-100" />
                                <div className="w-3 h-3 bg-[#4A3728] rounded-full animate-bounce delay-200" />
                            </div>
                            <p className="text-[#4A3728]/50 italic text-lg font-merriweather">listening...</p>
                        </div>
                    ) : (
                        /* AI Hero Text */
                        <div className="max-w-2xl animate-[fadeIn_1.5s_ease-out]">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-merriweather font-medium text-[#4A3728] leading-relaxed tracking-tight">
                                {currentAiMessage}
                            </h1>
                        </div>
                    )}
                </div>

                {/* BOTTOM: The Options (Tactile Clay Buttons) */}
                <div className="w-full flex flex-col items-center justify-end space-y-8">
                    {/* Options */}
                    {!isLoading && (
                        <div className="w-full animate-[slideUp_0.5s_ease-out]">
                            {/* Predefined Options */}
                            {!showManualInput && (
                                <div className="flex flex-wrap justify-center gap-4">
                                    {options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                if (opt === "Type your own...") {
                                                    setShowManualInput(true);
                                                } else {
                                                    handleOptionClick(opt);
                                                }
                                            }}
                                            // Clay Button Style: Soft Pastel Blue/Green tint (#E0F2F1 is soft teal)
                                            // Normal: Deep drop shadow + Inner light shadow
                                            // Hover: Lift up (translate-y-1)
                                            // Active: Press down (inset shadow increases)
                                            className="
                                                bg-[#E0F2F1] text-[#2F4F4F] 
                                                px-8 py-4 rounded-full font-medium text-lg 
                                                shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff,inset_2px_2px_4px_rgba(255,255,255,0.5)]
                                                hover:-translate-y-1 hover:shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff]
                                                active:translate-y-0 active:shadow-[inset_6px_6px_12px_#b8cbb8,inset_-6px_-6px_12px_#ffffff]
                                                transition-all duration-200 ease-in-out
                                            "
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Manual Input */}
                            {showManualInput && (
                                <div className="space-y-4 max-w-lg mx-auto w-full">
                                    <textarea
                                        value={manualMessage}
                                        onChange={(e) => setManualMessage(e.target.value)}
                                        placeholder="Tell me..."
                                        className="w-full p-6 bg-[#F7F4EB] rounded-3xl border-0 shadow-[inset_6px_6px_12px_#d2cfc8,inset_-6px_-6px_12px_#ffffff] focus:outline-none text-[#4A3728] font-merriweather text-xl resize-none h-32 transition-all placeholder:text-[#4A3728]/30 text-center leading-relaxed"
                                        autoFocus
                                    />
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => {
                                                if (manualMessage.trim()) {
                                                    handleOptionClick(manualMessage);
                                                    setManualMessage("");
                                                    setShowManualInput(false);
                                                }
                                            }}
                                            disabled={!manualMessage.trim()}
                                            className="bg-[#4A3728] text-[#F7F4EB] px-10 py-3 rounded-full font-bold text-lg shadow-[8px_8px_16px_#d2cfc8,-8px_-8px_16px_#ffffff] hover:-translate-y-1 active:shadow-[inset_4px_4px_8px_#2d2118,inset_-4px_-4px_8px_#675d58] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Send
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowManualInput(false);
                                                setManualMessage("");
                                            }}
                                            className="px-8 py-3 text-[#4A3728]/60 hover:text-[#4A3728] font-medium transition-colors"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Breathe Button */}
                    {!showManualInput && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={() => setIsBreathingOpen(true)}
                                className="group relative flex items-center gap-3 text-[#4A3728]/60 px-8 py-3 rounded-full font-merriweather text-base hover:bg-white/40 transition-all hover:text-[#4A3728] hover:shadow-sm"
                            >
                                <Wind className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                                <span className="italic tracking-wide">breathe with me</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
