"use client";

import { useState, useEffect } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowLeft, Wind, Heart, Smile, Frown, Meh, BookOpen } from "lucide-react";

export default function BurnoutView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [mood, setMood] = useState<string | null>(null);
    const [journalEntry, setJournalEntry] = useState("");

    // Breathing Animation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setBreathingPhase((prev) => {
                if (prev === "inhale") return "hold";
                if (prev === "hold") return "exhale";
                return "inhale";
            });
        }, 4000); // 4s cycle for simplicity (4-4-4 or similar)
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#2A4B46] text-[#E0F2F1] font-serif relative overflow-hidden transition-colors duration-1000">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#4DB6AC]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#80CBC4]/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Exit Button */}
            <button
                onClick={() => setMode(null)}
                className="absolute top-8 right-8 text-[#E0F2F1]/60 hover:text-white transition-colors z-50 flex items-center gap-2 group"
            >
                <span className="text-sm font-sans tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">EXIT REST MODE</span>
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="container mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 p-8 relative z-10">
                
                {/* CENTER LEFT: Breathing Sphere */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-80 h-80 flex items-center justify-center">
                        {/* Outer Glow Rings */}
                        <div className={`absolute inset-0 rounded-full border-2 border-[#80CBC4]/20 transition-all duration-[4000ms] ease-in-out ${
                            breathingPhase === "inhale" ? "scale-150 opacity-0" : "scale-100 opacity-50"
                        }`} />
                        <div className={`absolute inset-0 rounded-full border border-[#80CBC4]/10 transition-all duration-[4000ms] ease-in-out delay-75 ${
                            breathingPhase === "inhale" ? "scale-125 opacity-0" : "scale-90 opacity-60"
                        }`} />

                        {/* The Sphere */}
                        <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-[#B2DFDB] to-[#4DB6AC] shadow-[0_0_60px_rgba(77,182,172,0.4)] flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                            breathingPhase === "inhale" ? "scale-110 shadow-[0_0_100px_rgba(77,182,172,0.6)]" : 
                            breathingPhase === "exhale" ? "scale-90 shadow-[0_0_40px_rgba(77,182,172,0.2)]" : "scale-100"
                        }`}>
                            <span className="text-[#004D40] font-medium tracking-widest text-lg animate-pulse">
                                {breathingPhase.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <p className="mt-8 text-[#B2DFDB]/80 text-center max-w-md text-lg leading-relaxed">
                        "Quiet the mind, and the soul will speak."
                    </p>
                </div>

                {/* CENTER RIGHT: Mood & Journal */}
                <div className="flex-1 w-full max-w-md space-y-8">
                    
                    {/* Mood Tracker (Glassmorphism Card) */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl">
                        <h3 className="text-2xl text-[#E0F2F1] font-medium text-center mb-6 font-serif italic">How is your heart?</h3>
                        <div className="flex justify-between gap-2 sm:gap-4">
                            {[
                                { icon: "😫", label: "Stressed", color: "bg-[#FFAB91]" },
                                { icon: "😰", label: "Anxious", color: "bg-[#FFCC80]" },
                                { icon: "😐", label: "Neutral", color: "bg-[#FFF59D]" },
                                { icon: "😌", label: "Calm", color: "bg-[#A5D6A7]" },
                                { icon: "🧘", label: "Zen", color: "bg-[#80CBC4]" },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setMood(item.label)}
                                    className={`group relative flex flex-col items-center transition-all duration-300 ${
                                        mood === item.label ? "scale-110 -translate-y-2" : "hover:-translate-y-1 hover:scale-105"
                                    }`}
                                >
                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-[8px_8px_16px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.4)] transition-all ${
                                        mood === item.label ? "ring-4 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)]" : ""
                                    } ${item.color} bg-opacity-90 backdrop-blur-sm`}>
                                        <span className="filter drop-shadow-md transform group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </span>
                                    </div>
                                    <span className={`mt-3 text-xs sm:text-sm font-sans tracking-wider transition-all duration-300 ${
                                        mood === item.label ? "text-white font-bold opacity-100" : "text-[#B2DFDB] opacity-70 group-hover:opacity-100"
                                    }`}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gratitude Journal (Glassmorphism) */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4 text-[#B2DFDB]">
                            <BookOpen size={20} />
                            <span className="font-sans text-sm font-bold tracking-wider uppercase">Gratitude Journal</span>
                        </div>
                        <textarea
                            value={journalEntry}
                            onChange={(e) => setJournalEntry(e.target.value)}
                            placeholder="I am grateful for..."
                            className="w-full h-32 bg-black/10 rounded-xl p-4 text-[#E0F2F1] placeholder:text-[#E0F2F1]/30 focus:outline-none focus:bg-black/20 transition-colors resize-none font-sans leading-relaxed"
                        />
                        <div className="flex justify-end mt-2">
                            <button className="text-xs font-bold text-[#80CBC4] hover:text-[#B2DFDB] transition-colors uppercase tracking-widest">
                                Save Entry
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
