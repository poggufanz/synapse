"use client";

import { useState, useRef, useEffect } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowLeft, Wind } from "lucide-react";
import BreathingModal from "./BreathingModal";

interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

export default function BurnoutView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isBreathingOpen, setIsBreathingOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualMessage, setManualMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: "ai",
                    content: `hey ${persona?.name.toLowerCase() || "friend"}. it's quiet here. no tasks, no pressure. just us. how are you feeling right now?`
                }
            ]);
        }
    }, [persona, messages.length]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleOptionClick = async (option: string) => {
        const userMsg: ChatMessage = { role: "user", content: option };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat-burnout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: messages,
                    message: option,
                    persona,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, { role: "ai", content: data.message }]);
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
        "Type your own..." // Manual input fallback
    ];

    return (
        <div className="min-h-screen bg-[#F5F0E6] text-stone-800 p-6 relative flex flex-col items-center justify-center font-sans transition-colors duration-1000">
            {/* Breathing Modal */}
            <BreathingModal isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />

            {/* Mascot */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-50">
                <span className="text-6xl">🐨</span>
            </div>

            {/* Exit Button */}
            <button
                onClick={() => setMode(null)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-600 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="w-full max-w-2xl flex flex-col h-[80vh]">
                {/* Header */}
                <div className="text-center mb-8 relative z-10 mt-12">
                    <h1 className="text-4xl font-black text-stone-800 mb-2 tracking-tight">It's okay to pause.</h1>
                    <p className="text-stone-600 font-medium text-lg">I'm here. No pressure.</p>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto space-y-6 p-4 no-scrollbar">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-6 py-4 rounded-3xl text-lg font-medium shadow-sm ${msg.role === "user"
                                    ? "bg-stone-800 text-[#F5F0E6] rounded-tr-none"
                                    : "bg-white text-stone-800 rounded-tl-none border border-stone-200"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white px-6 py-4 rounded-3xl rounded-tl-none border border-stone-200 flex gap-2 items-center shadow-sm">
                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Controls */}
                <div className="mt-8 space-y-6">
                    {/* Options */}
                    {!isLoading && (
                        <div className="space-y-4">
                            {/* Predefined Options */}
                            {!showManualInput && (
                                <div className="flex flex-wrap justify-center gap-3">
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
                                            className="bg-white hover:bg-stone-50 border border-stone-200 text-stone-500 px-6 py-3 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-sm"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Manual Input */}
                            {showManualInput && (
                                <div className="space-y-3">
                                    <textarea
                                        value={manualMessage}
                                        onChange={(e) => setManualMessage(e.target.value)}
                                        placeholder="Tell me how you're feeling..."
                                        className="w-full p-4 bg-white rounded-2xl border-2 border-stone-200 focus:border-stone-400 focus:outline-none text-stone-700 font-medium resize-none h-24 transition-all"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (manualMessage.trim()) {
                                                    handleOptionClick(manualMessage);
                                                    setManualMessage("");
                                                    setShowManualInput(false);
                                                }
                                            }}
                                            disabled={!manualMessage.trim()}
                                            className="flex-1 bg-stone-800 text-white px-6 py-3 rounded-full font-bold hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Send
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowManualInput(false);
                                                setManualMessage("");
                                            }}
                                            className="px-6 py-3 text-stone-400 hover:text-stone-600 font-medium transition-colors"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Breathe Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsBreathingOpen(true)}
                            className="group relative flex items-center gap-3 bg-stone-800 text-[#F5F0E6] px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-stone-900 transition-all hover:scale-105"
                        >
                            <Wind className="animate-pulse" />
                            <span>Breathe with me</span>
                            <div className="absolute inset-0 rounded-full border-2 border-stone-800 opacity-20 animate-ping" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
