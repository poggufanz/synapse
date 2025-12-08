"use client";

import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CircularRevealTransition from "./CircularRevealTransition";

export default function ProductiveChat() {
    const [phase, setPhase] = useState<"idle" | "moving" | "waiting" | "fading" | "transition">("idle");
    const [positions, setPositions] = useState({
        centerX: 0,
        centerY: 0,
        windowWidth: 0,
        windowHeight: 0
    });
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Get window dimensions on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPositions(prev => ({
                ...prev,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight
            }));
        }
    }, []);

    const handleClick = () => {
        if (!buttonRef.current || typeof window === 'undefined') return;

        const rect = buttonRef.current.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        setPositions({
            centerX: window.innerWidth / 2 - startX,
            centerY: window.innerHeight / 2 - startY,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        });

        setPhase("moving");
    };

    // Handle animation sequence
    useEffect(() => {
        if (phase === "waiting") {
            // Wait 0.3 seconds at center, then start fading
            const timer = setTimeout(() => {
                setPhase("fading");
            }, 300);
            return () => clearTimeout(timer);
        }
        if (phase === "fading") {
            // Start transition while fading (button fades for 0.5s)
            const timer = setTimeout(() => {
                setPhase("transition");
            }, 300); // Start transition slightly before fade completes for overlap
            return () => clearTimeout(timer);
        }
    }, [phase]);

    const handleMoveComplete = () => {
        if (phase === "moving") {
            setPhase("waiting");
        }
    };

    // Get animation based on phase
    const getAnimation = () => {
        switch (phase) {
            case "idle":
                return { x: 0, y: 0, scale: 1, opacity: 1 };
            case "moving":
            case "waiting":
                return { x: positions.centerX, y: positions.centerY, scale: 1.2, opacity: 1 };
            case "fading":
            case "transition":
                return { x: positions.centerX, y: positions.centerY, scale: 1.5, opacity: 0 };
            default:
                return { x: 0, y: 0, scale: 1, opacity: 1 };
        }
    };

    const getTransition = () => {
        switch (phase) {
            case "moving":
                return { duration: 0.5, ease: "easeInOut" as const };
            case "fading":
                return { duration: 0.6, ease: "easeOut" as const };
            default:
                return { duration: 0.3 };
        }
    };

    return (
        <>
            {/* Animated FAB Button */}
            <AnimatePresence>
                {phase !== "transition" && (
                    <motion.button
                        ref={buttonRef}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={getAnimation()}
                        transition={getTransition()}
                        onAnimationComplete={phase === "moving" ? handleMoveComplete : undefined}
                        onClick={phase === "idle" ? handleClick : undefined}
                        className={`fixed bottom-28 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl z-50 ${phase === "idle"
                            ? "hover:bg-blue-700 hover:shadow-blue-300/50 hover:scale-110 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 cursor-pointer group"
                            : "cursor-default shadow-2xl shadow-blue-500/40 border-b-4 border-blue-800"
                            }`}
                        style={{ pointerEvents: phase === "idle" ? "auto" : "none" }}
                    >
                        <Bot size={28} />
                        {phase === "idle" && (
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                                Sparring Partner
                            </span>
                        )}

                        {/* Pulse ring when waiting */}
                        {phase === "waiting" && (
                            <motion.div
                                initial={{ scale: 1, opacity: 0.8 }}
                                animate={{ scale: 2.5, opacity: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="absolute inset-0 bg-blue-500 rounded-full -z-10"
                            />
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Circular Reveal Transition */}
            <CircularRevealTransition
                isActive={phase === "transition" || phase === "fading"}
                originX={positions.windowWidth / 2}
                originY={positions.windowHeight / 2}
                targetRoute="/sparring-partner"
            />
        </>
    );
}
