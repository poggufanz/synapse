"use client";

import { useEffect, useState } from "react";
import { Brain, Zap, Sparkles, Coffee, Battery, Target, Smile } from "lucide-react";

const loadingMessages = [
    "Calibrating your energy levels...",
    "Syncing with your circadian rhythm...",
    "Preparing your focus zone...",
    "Gathering positive vibes...",
    "Almost there..."
];

export default function LoadingScreen({ onFinish }: { onFinish?: () => void }) {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white z-50 flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px] animate-pulse" />
                
                {/* Subtle Floating Icons */}
                <div className="absolute top-[15%] left-[15%] opacity-10 animate-float">
                    <Brain className="text-blue-400 w-16 h-16 rotate-12" />
                </div>
                <div className="absolute bottom-[20%] right-[20%] opacity-10 animate-float animation-delay-2000">
                    <Zap className="text-blue-400 w-12 h-12 -rotate-12" />
                </div>
                <div className="absolute top-[25%] right-[10%] opacity-10 animate-float animation-delay-1000">
                    <Sparkles className="text-blue-400 w-8 h-8" />
                </div>
                <div className="absolute bottom-[15%] left-[10%] opacity-10 animate-float animation-delay-3000">
                    <Coffee className="text-blue-400 w-10 h-10 rotate-6" />
                </div>
                <div className="absolute top-[10%] right-[25%] opacity-10 animate-float animation-delay-1500">
                    <Battery className="text-blue-400 w-10 h-10 -rotate-45" />
                </div>
                <div className="absolute bottom-[30%] left-[25%] opacity-10 animate-float animation-delay-2500">
                    <Target className="text-blue-400 w-12 h-12" />
                </div>
                <div className="absolute top-[40%] left-[5%] opacity-10 animate-float animation-delay-500">
                    <Smile className="text-blue-400 w-9 h-9 rotate-12" />
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Unique Synapse Logo Animation */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-12">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
                    <img 
                        src="/images/logo.png" 
                        alt="Synapse Logo" 
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] animate-float"
                    />
                </div>

                {/* Text Content */}
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold tracking-[0.2em] text-slate-700 uppercase">
                        Synapse
                    </h2>
                    <p className="text-blue-500 text-sm font-medium tracking-wide min-h-[20px]">
                        {loadingMessages[messageIndex]}
                    </p>
                </div>

                {/* Bottom Loader */}
                <div className="absolute bottom-[-150px] flex gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-0" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200" />
                </div>
            </div>
        </div>
    );
}
