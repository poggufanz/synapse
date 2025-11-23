"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface MissionInputProps {
    onBreakdown: (text: string) => void;
    isLoading: boolean;
}

export default function MissionInput({ onBreakdown, isLoading }: MissionInputProps) {
    const [input, setInput] = useState("");

    const handleSubmit = () => {
        if (!input.trim()) return;
        onBreakdown(input);
        setInput("");
    };

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-xl shadow-slate-200/50 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-50 rounded-xl">
                    <Sparkles className="text-yellow-500 fill-yellow-500" size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800">Brain Dump</h2>
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tumpahin semua yang bikin pusing di sini..."
                className="w-full h-40 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl p-6 text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none font-medium text-lg leading-relaxed shadow-inner"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
            />

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-500 border-blue-700 text-white font-black py-3 px-6 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 hover:bg-blue-400 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? "Processing..." : "✨ Magic Break Down"}
                </button>
            </div>
        </div>
    );
}
