"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import EnergyGate from "@/components/EnergyGate";
import ProductiveView from "@/components/ProductiveView";
import BurnoutView from "@/components/BurnoutView";
import Onboarding from "@/components/Onboarding";
import TimeWarning from "@/components/TimeWarning";
import LoadingScreen from "@/components/LoadingScreen";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Transition variants for smooth mode switching
const pageVariants = {
    initial: {
        opacity: 0,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: "easeOut" as const,
        },
    },
    exit: {
        opacity: 0,
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: "easeIn" as const,
        },
    },
};

// Background colors for each mode (for smooth blending)
const modeBackgrounds: Record<string, string> = {
    gate: "bg-gradient-to-br from-slate-50 via-white to-slate-100",
    productive: "bg-gradient-to-br from-blue-50 via-white to-cyan-50",
    burnout: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50",
    onboarding: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
};

export default function Home() {
    const mode = useEnergyStore((state) => state.mode);
    const persona = useEnergyStore((state) => state.persona);
    const [isLoading, setIsLoading] = useState(true);

    // Determine current background based on mode
    const currentBackground = !persona
        ? modeBackgrounds.onboarding
        : !mode
            ? modeBackgrounds.gate
            : modeBackgrounds[mode] || modeBackgrounds.gate;

    useEffect(() => {
        // Simulate initial app loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    // If no persona is set, show Onboarding with transition
    if (!persona) {
        return (
            <motion.div
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="min-h-screen"
            >
                <Onboarding />
            </motion.div>
        );
    }

    return (
        <main className="min-h-screen font-sans relative overflow-hidden">
            {/* Animated Background Layer */}
            <motion.div
                key={mode || "gate"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed inset-0 ${currentBackground} -z-10`}
            />

            <TimeWarning />

            {/* AnimatePresence for smooth view transitions */}
            <AnimatePresence mode="wait">
                {!mode && (
                    <motion.div
                        key="energygate"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="min-h-screen"
                    >
                        <EnergyGate />
                    </motion.div>
                )}

                {mode === "productive" && (
                    <motion.div
                        key="productive"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="min-h-screen"
                    >
                        <ProductiveView />
                    </motion.div>
                )}

                {mode === "burnout" && (
                    <motion.div
                        key="burnout"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="min-h-screen"
                    >
                        <BurnoutView />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
