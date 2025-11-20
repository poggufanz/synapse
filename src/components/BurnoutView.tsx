"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import { useState, useEffect, useRef } from "react";
import BreathingModal from "@/components/BreathingModal";
import { MessageSquare, Wind, ArrowLeft, Music, BookOpen } from "lucide-react";

interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

export default function BurnoutView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentOptions, setCurrentOptions] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Initial greeting on mount
    useEffect(() => {
        const initChat = async () => {
            setIsTyping(true);
            try {
                const response = await fetch("/api/chat-burnout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        history: [],
                        user_selection: "start conversation",
                        persona,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages([{ role: "ai", content: data.message }]);
                    setCurrentOptions(data.options || []);
                }
            } catch (error) {
                console.error("Failed to init chat", error);
                setMessages([{ role: "ai", content: "hey. rough day?" }]);
                setCurrentOptions(["yeah, really rough", "i'm exhausted", "just tired"]);
            } finally {
                setIsTyping(false);
            }
        };

        initChat();
    }, []);

    const handleOptionClick = async (option: string) => {
        // Add user message
        const userMessage: ChatMessage = { role: "user", content: option };
        setMessages((prev) => [...prev, userMessage]);
        setCurrentOptions([]);
        setIsTyping(true);

        try {
            // Build history for API
            const history = [...messages, userMessage].map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await fetch("/api/chat-burnout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    history,
                    user_selection: option,
                    persona,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, { role: "ai", content: data.message }]);
                setCurrentOptions(data.options || []);
            }
        } catch (error) {
            console.error("Failed to send message", error);
            setMessages((prev) => [
                ...prev,
                { role: "ai", content: "sorry, i'm having trouble right now. let's just breathe." },
            ]);
            setCurrentOptions(["okay", "tell me more", "i need help"]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white p-4 md:p-8 relative flex flex-col">
            {/* Discreet Reset Button */}
            <button
                onClick={() => setMode(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-400 text-sm transition-colors z-10 flex items-center gap-2"
            >
                <ArrowLeft size={16} /> Change Mode
            </button>

            {/* Panic/Breathe Button in Corner */}
            <button
                onClick={() => setIsBreathingModalOpen(true)}
                className="fixed bottom-6 right-6 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-sm border border-rose-400/30 text-rose-200 font-semibold py-4 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-rose-500/30 hover:scale-105 z-10 flex items-center gap-2"
            >
                <Wind size={20} /> Breathe
            </button>

            {/* Breathing Modal */}
            <BreathingModal
                isOpen={isBreathingModalOpen}
                onClose={() => setIsBreathingModalOpen(false)}
            />

            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4 opacity-70 flex justify-center">
                        <div className="bg-indigo-500/10 p-4 rounded-full">
                            <MessageSquare size={48} className="text-indigo-300" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light text-indigo-100 leading-relaxed mb-2">
                        It's okay to pause.
                    </h1>
                    <p className="text-indigo-300/60 text-sm">no typing needed. just tap what feels right.</p>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6 overflow-y-auto max-h-[500px] space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-5 py-3 rounded-2xl ${message.role === "user"
                                    ? "bg-indigo-600/40 text-indigo-100 rounded-br-md"
                                    : "bg-slate-700/50 text-slate-200 rounded-bl-md"
                                    }`}
                            >
                                <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-700/50 text-slate-200 px-5 py-3 rounded-2xl rounded-bl-md">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-100"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Option Buttons (Instead of Input) */}
                {currentOptions.length > 0 && !isTyping && (
                    <div className="space-y-3">
                        {currentOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                className="w-full bg-slate-700/40 hover:bg-slate-700/60 backdrop-blur-sm border border-slate-600/40 hover:border-slate-500/60 text-slate-200 font-medium py-4 px-6 rounded-full transition-all duration-300 hover:scale-[1.02] text-left"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {/* Secondary Options */}
                <div className="mt-6 pt-6 border-t border-slate-700/30">
                    <p className="text-slate-500 text-xs text-center mb-4">other things you can try</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-slate-800/30 hover:bg-slate-800/40 backdrop-blur-sm border border-slate-600/30 text-slate-400 hover:text-slate-300 font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 text-sm flex items-center justify-center gap-2">
                            <Music size={16} /> Calming Sounds
                        </button>
                        <button className="bg-slate-800/30 hover:bg-slate-800/40 backdrop-blur-sm border border-slate-600/30 text-slate-400 hover:text-slate-300 font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 text-sm flex items-center justify-center gap-2">
                            <BookOpen size={16} /> Read Something Light
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
