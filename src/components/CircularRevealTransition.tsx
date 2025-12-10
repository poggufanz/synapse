"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot, Sparkles, MessageSquare, Zap } from "lucide-react";

interface CircularRevealTransitionProps {
    isActive: boolean;
    originX: number;
    originY: number;
    targetRoute: string;
    onAnimationStart?: () => void;
}

export default function CircularRevealTransition({
    isActive,
    originX,
    originY,
    targetRoute,
    onAnimationStart,
}: CircularRevealTransitionProps) {
    const router = useRouter();
    const [phase, setPhase] = useState<"idle" | "expanding" | "navigating">("idle");
    const [maxRadius, setMaxRadius] = useState(3000);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const radius = Math.sqrt(
                Math.max(originX, window.innerWidth - originX) ** 2 +
                Math.max(originY, window.innerHeight - originY) ** 2
            ) * 2.5;
            setMaxRadius(radius);
        }
    }, [originX, originY]);

    useEffect(() => {
        if (isActive && phase === "idle") {
            setPhase("expanding");
            onAnimationStart?.();
        }
    }, [isActive, phase, onAnimationStart]);

    const handleAnimationComplete = () => {
        if (phase === "expanding") {
            setPhase("navigating");
            router.push(targetRoute);
        }
    };

    return (
        <AnimatePresence>
            {isActive && (
                <div className="fixed inset-0 z-[100]">
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black"
                    />

                    {/* Expanding circle with page preview */}
                    <motion.div
                        initial={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                        }}
                        animate={{
                            width: maxRadius,
                            height: maxRadius,
                            borderRadius: "50%",
                        }}
                        transition={{
                            duration: 1.0,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        onAnimationComplete={handleAnimationComplete}
                        style={{
                            position: "absolute",
                            left: originX,
                            top: originY,
                            transform: "translate(-50%, -50%)",
                            overflow: "hidden",
                        }}
                        className="shadow-2xl"
                    >
                        {/* Preview Content - Exactly matches Sparring Partner page */}
                        <div
                            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col"
                            style={{
                                width: "100vw",
                                height: "100vh",
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            {/* Header */}
                            <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 shrink-0">
                                <div className="max-w-4xl mx-auto flex items-center gap-4">
                                    <div className="p-2 text-slate-400 rounded-xl w-9 h-9" />
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
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex items-center justify-center p-6">
                                <div className="text-center">
                                    <div className="inline-flex p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-600/20 mb-6">
                                        <Bot className="text-white" size={48} />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-3">
                                        Meet your Sparring Partner
                                    </h2>
                                    <p className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-6">
                                        I'm here to help you think through complex problems...
                                    </p>

                                    {/* Suggestion Cards */}
                                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                                        {[
                                            { icon: <Zap size={20} />, title: "Break down a task" },
                                            { icon: <MessageSquare size={20} />, title: "Think through a problem" },
                                            { icon: <Sparkles size={20} />, title: "Generate ideas" },
                                        ].map((s, i) => (
                                            <div
                                                key={i}
                                                className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-left"
                                            >
                                                <div className="text-blue-400 mb-2">{s.icon}</div>
                                                <p className="font-semibold text-white text-sm">{s.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="bg-slate-800/80 border-t border-slate-700/50 p-4 shrink-0">
                                <div className="max-w-4xl mx-auto">
                                    <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-3">
                                        <div className="text-slate-500 text-sm py-2">
                                            What's on your mind? Let's think through it together...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
