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
                className="fixed bottom-28 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-blue-200 transition-all hover:scale-110 z-40 group border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
            >
                <Bot size={28} />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    Sparring Partner
                </span>
            </button>
        );
    }

    return (
        <div
            className={`fixed right-8 bg-white border border-slate-200 rounded-[32px] shadow-2xl transition-all duration-300 z-40 flex flex-col overflow-hidden ${isMinimized ? "bottom-28 w-72 h-20" : "bottom-28 w-80 md:w-96 h-[600px]"
                }`}
        >
            {/* Header */}
            <div className="bg-white p-4 flex items-center justify-between border-b border-slate-100 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <Bot className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 text-sm block">Sparring Partner</span>
                        <span className="text-xs text-slate-400 font-medium">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-lg"
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 text-sm mt-8">
                                <p className="font-bold text-slate-600">Ready to spar, {persona?.name}.</p>
                                <p className="text-xs mt-1">Let's tackle that complex problem.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-white text-slate-700 border border-slate-100 rounded-bl-sm"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-100 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-slate-50 border-transparent focus:bg-white border focus:border-blue-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shadow-soft-blue"
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
