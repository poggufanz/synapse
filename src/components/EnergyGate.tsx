"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import { Zap, BatteryLow, Rocket, Moon } from "lucide-react";

export default function EnergyGate() {
    const setMode = useEnergyStore((state) => state.setMode);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 md:p-8">
            <div className="max-w-5xl w-full space-y-12">
                <h2 className="text-3xl md:text-5xl font-bold text-white text-center tracking-tight">
                    How is your synapse firing today?
                </h2>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
                    {/* Option A: Productive Mode */}
                    <button
                        onClick={() => setMode("productive")}
                        className="group flex-1 relative overflow-hidden bg-zinc-900 border-2 border-blue-600 hover:border-blue-400 p-8 md:p-12 rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:-translate-y-1 text-left"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Rocket size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
                                <Zap size={32} className="text-blue-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                🚀 Productive Mode
                            </h3>
                            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
                                I have energy. I want to get things done.
                            </p>
                            <div className="pt-4">
                                <span className="inline-block px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-semibold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    Activate Focus →
                                </span>
                            </div>
                        </div>
                    </button>

                    {/* Option B: Decompression Mode */}
                    <button
                        onClick={() => setMode("burnout")}
                        className="group flex-1 relative overflow-hidden bg-indigo-950/30 border border-indigo-300/20 hover:border-indigo-300/40 p-8 md:p-12 rounded-3xl transition-all duration-500 hover:bg-indigo-950/50 hover:shadow-2xl hover:-translate-y-1 text-left backdrop-blur-sm"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Moon size={120} />
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
                        <div className="relative z-10 space-y-4">
                            <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors">
                                <BatteryLow size={32} className="text-purple-400" />
                            </div>
                            <h3 className="text-3xl font-medium text-indigo-100 group-hover:text-white transition-colors">
                                🧠 Decompression Mode
                            </h3>
                            <p className="text-indigo-200/70 text-lg md:text-xl leading-relaxed font-light">
                                I'm feeling overwhelmed, tired, or burnt out.
                            </p>
                            <div className="pt-4">
                                <span className="inline-block px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-full text-sm font-medium group-hover:bg-indigo-500/20 group-hover:text-indigo-200 transition-all">
                                    Start Healing 🌿
                                </span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
