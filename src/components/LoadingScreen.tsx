"use client";

import { useEffect, useState } from "react";
import { Brain, Zap, Sparkles, Coffee, Heart, Target, Moon, Sun, Leaf } from "lucide-react";

const loadingTips = [
    { emoji: "🧠", text: "Deep work happens in 90-minute cycles" },
    { emoji: "🌊", text: "Your brain needs rest to consolidate learning" },
    { emoji: "⚡", text: "Small wins build momentum for big goals" },
    { emoji: "🌱", text: "Progress over perfection" },
    { emoji: "☕", text: "Strategic breaks boost creativity" },
    { emoji: "🎯", text: "Focus on your Top 3 today" },
];

const orbitIcons = [
    { Icon: Brain, color: "text-purple-400", size: "w-8 h-8" },
    { Icon: Zap, color: "text-amber-400", size: "w-6 h-6" },
    { Icon: Heart, color: "text-rose-400", size: "w-7 h-7" },
    { Icon: Target, color: "text-blue-400", size: "w-6 h-6" },
    { Icon: Sparkles, color: "text-cyan-400", size: "w-5 h-5" },
    { Icon: Leaf, color: "text-emerald-400", size: "w-6 h-6" },
];

export default function LoadingScreen({ onFinish }: { onFinish?: () => void }) {
    const [tipIndex, setTipIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Rotate tips
        const tipInterval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % loadingTips.length);
        }, 1200);

        // Animate progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 2;
            });
        }, 50);

        return () => {
            clearInterval(tipInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* Animated Mesh Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6E3] via-[#E8F4EA] to-[#E0EFFF]">
                {/* Animated Gradient Blobs */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-purple-200/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-amber-200/40 to-rose-200/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000" />
                <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full mix-blend-multiply filter blur-[60px] animate-blob animation-delay-4000" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">

                {/* ==================== ORBITAL LOGO ANIMATION ==================== */}
                <div className="relative w-64 h-64 flex items-center justify-center mb-8">

                    {/* Outer Glow Ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-2xl animate-pulse" />

                    {/* Orbital Track */}
                    <div className="absolute inset-4 rounded-full border-2 border-dashed border-slate-200/50 animate-spin" style={{ animationDuration: '20s' }} />

                    {/* Orbiting Icons */}
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s' }}>
                        {orbitIcons.map((item, i) => {
                            const angle = (i / orbitIcons.length) * 360;
                            return (
                                <div
                                    key={i}
                                    className="absolute"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        transform: `rotate(${angle}deg) translateX(110px) rotate(-${angle}deg)`,
                                    }}
                                >
                                    <div
                                        className={`${item.size} ${item.color} bg-white rounded-xl shadow-lg p-1.5 animate-float`}
                                        style={{ animationDelay: `${i * 200}ms` }}
                                    >
                                        <item.Icon className="w-full h-full" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Center Clay-style Logo Container */}
                    <div className="relative z-10 w-28 h-28 bg-gradient-to-br from-white to-slate-50 rounded-[28px] shadow-[0_20px_50px_-15px_rgba(59,130,246,0.4),inset_0_-8px_20px_rgba(0,0,0,0.05),inset_0_8px_20px_rgba(255,255,255,0.8)] flex items-center justify-center border-b-4 border-blue-100 transform hover:scale-105 transition-transform">
                        <img
                            src="/images/logo.png"
                            alt="Synapse Logo"
                            className="w-20 h-20 object-contain drop-shadow-lg animate-float"
                        />
                    </div>
                </div>

                {/* ==================== BRAND & TAGLINE ==================== */}
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                        SYNAPSE
                    </h1>
                    <p className="text-slate-500 font-medium text-sm tracking-wide">
                        Your Hybrid Productivity Companion
                    </p>
                </div>

                {/* ==================== PROGRESS BAR ==================== */}
                <div className="w-64 mb-6">
                    <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-100 ease-out animate-gradient"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                        {progress < 100 ? `${Math.round(progress)}%` : "Ready!"}
                    </p>
                </div>

                {/* ==================== ROTATING TIPS ==================== */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg border border-white/80 max-w-sm">
                    <div className="flex items-center gap-3" key={tipIndex}>
                        <span className="text-2xl animate-bounce">{loadingTips[tipIndex].emoji}</span>
                        <p className="text-sm text-slate-600 font-medium animate-fadeIn">
                            {loadingTips[tipIndex].text}
                        </p>
                    </div>
                </div>

                {/* ==================== FLOATING DECORATIVE ICONS ==================== */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                    <div className="absolute -top-20 -left-20 opacity-20 animate-float">
                        <Sun className="text-amber-400 w-16 h-16" />
                    </div>
                    <div className="absolute -bottom-16 -right-16 opacity-20 animate-float animation-delay-2000">
                        <Moon className="text-indigo-400 w-14 h-14" />
                    </div>
                    <div className="absolute top-0 right-[-60px] opacity-15 animate-float animation-delay-1000">
                        <Coffee className="text-amber-500 w-10 h-10" />
                    </div>
                </div>
            </div>

            {/* ==================== BOTTOM BRANDING ==================== */}
            <div className="absolute bottom-8 text-center">
                <p className="text-xs text-slate-400 font-medium tracking-wider">
                    Built for focus. Designed for wellbeing.
                </p>
            </div>
        </div>
    );
}
