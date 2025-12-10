"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEnergyStore } from "@/store/useEnergyStore";
import { Send, Bot, ArrowLeft, Sparkles, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

export default function SparringPartnerPage() {
    const router = useRouter();
    const persona = useEnergyStore((state) => state.persona);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
            {/* Header */}
            <header
                className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 shrink-0"
            >
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            prefetch={true}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                                <Bot className="text-white" size={22} />
                            </div>
                            <div>
                                <h1 className="font-bold text-white text-lg">Sparring Partner</h1>
                                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    Online • Ready to spar
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all flex items-center gap-2">
                            <Sparkles size={16} />
                            Suggestions
                        </button>
                    </div>
                </div>
            </header>

            {/* Chat Area - Fixed height with internal scroll */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <div
                            className="text-center py-12"
                        >
                            <div className="inline-flex p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-600/20 mb-6">
                                <Bot className="text-white" size={48} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3">
                                Meet your Sparring Partner
                            </h2>
                            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-6">
                                I'm here to help you think through complex problems, brainstorm ideas,
                                and push your thinking further. What's on your mind, {persona?.name || "friend"}?
                            </p>

                            {/* Suggestion Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                {[
                                    { icon: <Zap size={20} />, title: "Break down a task", desc: "Help me tackle something complex" },
                                    { icon: <MessageSquare size={20} />, title: "Think through a problem", desc: "Let's analyze this together" },
                                    { icon: <Sparkles size={20} />, title: "Generate ideas", desc: "Brainstorm creative solutions" },
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(suggestion.title)}
                                        className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/50 rounded-2xl text-left transition-all group"
                                    >
                                        <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                                            {suggestion.icon}
                                        </div>
                                        <p className="font-semibold text-white text-sm">{suggestion.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{suggestion.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-5 py-4 rounded-2xl ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-md"
                                    : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-md"
                                    }`}
                            >
                                {msg.role === "ai" && (
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                                        <Bot size={14} className="text-blue-400" />
                                        <span className="text-xs font-medium text-blue-400">Sparring Partner</span>
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Loading */}
                    {isLoading && (
                        <div
                            className="flex justify-start"
                        >
                            <div className="bg-slate-800 px-5 py-4 rounded-2xl rounded-bl-md border border-slate-700/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bot size={14} className="text-blue-400" />
                                    <span className="text-xs font-medium text-blue-400">Sparring Partner</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div
                className="bg-slate-800/80 backdrop-blur-xl border-t border-slate-700/50 p-4 shrink-0"
            >
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-3 focus-within:border-blue-500/50 transition-colors">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="What's on your mind? Let's think through it together..."
                            rows={1}
                            className="w-full bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed max-h-[200px]"
                        />
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
                            <p className="text-xs text-slate-500">
                                Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 font-mono text-[10px]">Shift+Enter</kbd> for new line
                            </p>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center gap-2 font-medium text-sm shadow-lg shadow-blue-600/20"
                            >
                                <Send size={16} />
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
