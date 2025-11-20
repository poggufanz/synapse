"use client";

import { useState, useRef, useEffect } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { Send, Bot, X, Minimize2, Maximize2 } from "lucide-react";

interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

export default function ProductiveChat() {
    const persona = useEnergyStore((state) => state.persona);
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat-productive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: messages,
                    message: userMsg.content,
                    persona,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, { role: "ai", content: data.message }]);
            }
        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-40 group"
            >
                <Bot size={24} />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Sparring Partner
                </span>
            </button>
        );
    }

    return (
        <div
            className={`fixed right-6 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl transition-all duration-300 z-40 flex flex-col overflow-hidden ${isMinimized ? "bottom-6 w-72 h-16" : "bottom-6 w-80 md:w-96 h-[500px]"
                }`}
        >
            {/* Header */}
            <div className="bg-slate-800/50 p-4 flex items-center justify-between border-b border-slate-700 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <Bot className="text-cyan-400" size={20} />
                    <span className="font-bold text-white text-sm">Sparring Partner</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-500 text-sm mt-8">
                                <p>Ready to spar, {persona?.name}.</p>
                                <p className="text-xs mt-1 opacity-70">Let's tackle that complex problem.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === "user"
                                            ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-br-sm"
                                            : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 px-4 py-2 rounded-2xl rounded-bl-sm border border-slate-700">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100" />
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-slate-800/50 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
