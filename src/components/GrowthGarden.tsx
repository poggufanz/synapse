"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sun, Droplets, Moon, Sparkles, Calendar, Heart } from "lucide-react";

interface GrowthData {
    totalWellnessPoints: number; // 0-100 for each growth stage
    currentStage: number; // 0-5 stages
    restDaysUsed: number;
    restDaysAllowed: number;
    lastActivityDate: string | null;
    activities: ActivityLog[];
}

interface ActivityLog {
    date: string;
    type: "breathing" | "chat" | "task" | "rest";
    points: number;
}

const STORAGE_KEY = "synapse-growth-garden";
const GROWTH_STAGES = [
    { name: "Biji", description: "Baru mulai", minPoints: 0, emoji: "🌱" },
    { name: "Tunas", description: "Mulai tumbuh", minPoints: 20, emoji: "🌿" },
    { name: "Batang", description: "Semakin kuat", minPoints: 40, emoji: "🪴" },
    { name: "Daun", description: "Berkembang", minPoints: 60, emoji: "🌳" },
    { name: "Bunga", description: "Mekar indah", minPoints: 80, emoji: "🌸" },
    { name: "Pohon", description: "Kamu hebat!", minPoints: 100, emoji: "🌺" },
];

const REST_DAYS_PER_WEEK = 2; // 2 rest days allowed per week without penalty

export default function GrowthGarden() {
    const [data, setData] = useState<GrowthData>({
        totalWellnessPoints: 0,
        currentStage: 0,
        restDaysUsed: 0,
        restDaysAllowed: REST_DAYS_PER_WEEK,
        lastActivityDate: null,
        activities: [],
    });
    const [showDetails, setShowDetails] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Reset rest days on new week
                const lastWeek = getWeekNumber(new Date(parsed.lastActivityDate || Date.now()));
                const currentWeek = getWeekNumber(new Date());
                if (lastWeek !== currentWeek) {
                    parsed.restDaysUsed = 0;
                }
                setData(parsed);
            }
        } catch (error) {
            console.error("Failed to load growth data:", error);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save growth data:", error);
        }
    }, [data]);

    const getWeekNumber = (date: Date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    const getCurrentStage = () => {
        for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
            if (data.totalWellnessPoints >= GROWTH_STAGES[i].minPoints) {
                return GROWTH_STAGES[i];
            }
        }
        return GROWTH_STAGES[0];
    };

    const takeRestDay = () => {
        if (data.restDaysUsed < data.restDaysAllowed) {
            const today = new Date().toISOString().split('T')[0];
            setData(prev => ({
                ...prev,
                restDaysUsed: prev.restDaysUsed + 1,
                lastActivityDate: today,
                activities: [...prev.activities, { date: today, type: "rest", points: 0 }],
            }));
        }
    };

    const currentStage = getCurrentStage();
    const stageIndex = GROWTH_STAGES.findIndex(s => s.name === currentStage.name);
    const nextStage = GROWTH_STAGES[Math.min(stageIndex + 1, GROWTH_STAGES.length - 1)];
    const progressToNext = stageIndex < GROWTH_STAGES.length - 1
        ? ((data.totalWellnessPoints - currentStage.minPoints) / (nextStage.minPoints - currentStage.minPoints)) * 100
        : 100;

    return (
        <div className="relative">
            {/* Main Garden Card */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowDetails(!showDetails)}
                className="cursor-pointer"
            >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2e1a] via-[#1f3520] to-[#152a1f] border border-green-500/30 p-5 shadow-xl shadow-green-900/20">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-400/20 to-transparent rounded-bl-full" />
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />

                    <div className="relative flex items-center gap-4">
                        {/* Plant Visual */}
                        <motion.div
                            className="relative"
                            animate={{
                                y: [0, -4, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 shadow-lg shadow-green-500/10">
                                <span className="text-4xl">{currentStage.emoji}</span>
                            </div>
                            {/* Growth sparkles */}
                            <motion.div
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1"
                            >
                                <Sparkles className="text-yellow-400" size={16} />
                            </motion.div>
                        </motion.div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-white text-lg">{currentStage.name}</h3>
                                <span className="text-xs text-green-400/80 bg-green-500/10 px-2 py-0.5 rounded-full">
                                    {currentStage.description}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNext}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                />
                            </div>

                            <p className="text-xs text-white/50">
                                {stageIndex < GROWTH_STAGES.length - 1
                                    ? `${Math.round(progressToNext)}% menuju ${nextStage.name}`
                                    : "Pohonmu sudah tumbuh sempurna! 🎉"
                                }
                            </p>
                        </div>
                    </div>

                    {/* Rest Days Indicator */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Moon className="text-purple-400" size={16} />
                            <span className="text-sm text-white/60">Jatah Istirahat Minggu Ini</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {[...Array(data.restDaysAllowed)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Heart
                                        size={18}
                                        className={i < data.restDaysAllowed - data.restDaysUsed
                                            ? "text-pink-400 fill-pink-400"
                                            : "text-white/20"
                                        }
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Details Panel */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-2xl bg-[#1a2e1a]/90 border border-green-500/20 p-4 space-y-4 shadow-lg">
                            {/* Rest Day Button */}
                            {data.restDaysUsed < data.restDaysAllowed && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); takeRestDay(); }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 font-medium transition-all hover:bg-purple-500/30"
                                >
                                    <Moon size={18} />
                                    Ambil Hari Istirahat
                                </motion.button>
                            )}

                            {/* Philosophy message */}
                            <div className="text-center py-3">
                                <p className="text-sm text-white/40 italic leading-relaxed">
                                    "Tidak apa-apa untuk beristirahat. Tanamanmu akan tetap tumbuh,
                                    <br />karena pertumbuhan butuh waktu dan kesabaran."
                                </p>
                            </div>

                            {/* How to earn points */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Cara Merawat Tanaman</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <Droplets size={20} className="text-blue-400" />
                                        <span className="text-xs text-white/60">Breathing</span>
                                        <span className="text-xs text-green-400">+5 pts</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <Sun size={20} className="text-yellow-400" />
                                        <span className="text-xs text-white/60">Chat</span>
                                        <span className="text-xs text-green-400">+3 pts</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <Leaf size={20} className="text-green-400" />
                                        <span className="text-xs text-white/60">Task</span>
                                        <span className="text-xs text-green-400">+2 pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Growth stages preview */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Tahap Pertumbuhan</p>
                                <div className="flex justify-between">
                                    {GROWTH_STAGES.map((stage, i) => (
                                        <div
                                            key={stage.name}
                                            className={`flex flex-col items-center gap-1 ${i <= stageIndex ? 'opacity-100' : 'opacity-30'}`}
                                        >
                                            <span className="text-xl">{stage.emoji}</span>
                                            <span className="text-[10px] text-white/60">{stage.minPoints}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Export function to add wellness points from other components
export function addWellnessPoints(type: "breathing" | "chat" | "task", points: number) {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data: GrowthData = JSON.parse(saved);
            const today = new Date().toISOString().split('T')[0];
            data.totalWellnessPoints = Math.min(100, data.totalWellnessPoints + points);
            data.lastActivityDate = today;
            data.activities.push({ date: today, type, points });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    } catch (error) {
        console.error("Failed to add wellness points:", error);
    }
}
