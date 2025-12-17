"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sun, Droplets, Moon, Sparkles, Heart, ChevronDown } from "lucide-react";

interface GrowthData {
    totalWellnessPoints: number;
    currentStage: number;
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
    { name: "Seed", description: "Just starting", minPoints: 0, emoji: "🌱" },
    { name: "Sprout", description: "Growing strong", minPoints: 20, emoji: "🌿" },
    { name: "Sapling", description: "Getting stronger", minPoints: 40, emoji: "🪴" },
    { name: "Tree", description: "Flourishing", minPoints: 60, emoji: "🌳" },
    { name: "Bloom", description: "Beautifully blooming", minPoints: 80, emoji: "🌸" },
    { name: "Garden", description: "You're amazing!", minPoints: 100, emoji: "🌺" },
];

const REST_DAYS_PER_WEEK = 2;

interface GrowthGardenProps {
    isDarkMode?: boolean;
    compact?: boolean;
    previewOnly?: boolean;
}

export default function GrowthGarden({ isDarkMode = false, compact = false, previewOnly = false }: GrowthGardenProps) {
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

    // Neomorphic styles
    const bgColor = isDarkMode ? '#1a2e1a' : '#f8f7f5';
    const textColor = isDarkMode ? '#e0dcd9' : '#4a453e';
    const primaryColor = '#f49d25';
    const greenColor = '#22c55e';

    const neoSurface = {
        backgroundColor: bgColor,
        boxShadow: isDarkMode
            ? '10px 10px 20px #0f1a0f, -10px -10px 20px #253025'
            : '10px 10px 20px #d6d3cd, -10px -10px 20px #ffffff',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.4)'
    };

    const neoBtn = {
        backgroundColor: bgColor,
        boxShadow: isDarkMode
            ? '6px 6px 12px #0f1a0f, -6px -6px 12px #253025'
            : '6px 6px 12px #d6d3cd, -6px -6px 12px #ffffff',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.4)'
    };

    const neoInset = {
        backgroundColor: bgColor,
        boxShadow: isDarkMode
            ? 'inset 6px 6px 12px #0f1a0f, inset -6px -6px 12px #253025'
            : 'inset 6px 6px 12px #d6d3cd, inset -6px -6px 12px #ffffff'
    };

    return (
        <div className={`relative ${compact ? 'space-y-2' : 'space-y-4'}`} style={{ fontFamily: "'Nunito', sans-serif" }}>
            {/* Main Garden Card */}
            <motion.div
                whileHover={previewOnly ? {} : { scale: 1.01 }}
                onClick={previewOnly ? undefined : () => setShowDetails(!showDetails)}
                className={previewOnly ? '' : 'cursor-pointer'}
            >
                <div
                    className={`relative overflow-hidden ${compact ? 'rounded-2xl p-3' : 'rounded-[2rem] p-6'}`}
                    style={neoSurface}
                >
                    {/* Decorative Blob */}
                    <div
                        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                        style={{ backgroundColor: `${greenColor}20` }}
                    />
                    <div
                        className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                        style={{ backgroundColor: `${primaryColor}15` }}
                    />

                    <div className={`relative flex items-center ${compact ? 'gap-3' : 'gap-5'}`}>
                        {/* Plant Visual */}
                        <motion.div
                            className="relative"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div
                                className={`${compact ? 'w-14 h-14 rounded-xl' : 'w-20 h-20 rounded-2xl'} flex items-center justify-center`}
                                style={{
                                    ...neoInset,
                                    background: isDarkMode
                                        ? 'linear-gradient(145deg, #1f3820, #152815)'
                                        : 'linear-gradient(145deg, #ffffff, #e6e6e6)'
                                }}
                            >
                                <span className={compact ? 'text-2xl' : 'text-4xl'}>{currentStage.emoji}</span>
                            </div>
                            {/* Sparkle */}
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1"
                            >
                                <Sparkles size={16} style={{ color: primaryColor }} />
                            </motion.div>
                        </motion.div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className={`flex items-center gap-2 ${compact ? 'mb-1 flex-wrap' : 'mb-2'}`}>
                                <h3 className={`font-bold ${compact ? 'text-base' : 'text-xl'}`} style={{ color: isDarkMode ? 'white' : textColor }}>
                                    {currentStage.name}
                                </h3>
                                {!compact && (
                                    <span
                                        className="text-xs font-medium px-3 py-1 rounded-full"
                                        style={{
                                            backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                                            color: greenColor
                                        }}
                                    >
                                        {currentStage.description}
                                    </span>
                                )}
                            </div>

                            {/* Neomorphic Progress Bar */}
                            <div className={`relative ${compact ? 'h-2' : 'h-4'} rounded-full overflow-hidden mb-1`} style={neoInset}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressToNext}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute inset-y-0 left-0 rounded-full"
                                    style={{
                                        background: `linear-gradient(to right, ${greenColor}, #4ade80)`,
                                        boxShadow: `0 0 10px ${greenColor}50`
                                    }}
                                />
                            </div>

                            <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium`} style={{ color: `${textColor}80` }}>
                                {stageIndex < GROWTH_STAGES.length - 1
                                    ? `${Math.round(progressToNext)}% to ${nextStage.name}`
                                    : "Fully grown! 🎉"
                                }
                            </p>
                        </div>

                        {/* Expand Icon - Hidden in preview mode */}
                        {!previewOnly && (
                            <ChevronDown
                                size={20}
                                className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                                style={{ color: `${textColor}60` }}
                            />
                        )}
                    </div>

                    {/* Rest Days Indicator */}
                    <div
                        className={`${compact ? 'mt-3 pt-2' : 'mt-5 pt-4'} flex items-center justify-between`}
                        style={{ borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }}
                    >
                        <div className="flex items-center gap-2">
                            <Moon size={compact ? 14 : 16} style={{ color: '#a78bfa' }} />
                            <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`} style={{ color: `${textColor}80` }}>
                                {compact ? 'Rest Days' : 'Rest Days This Week'}
                            </span>
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
                                        size={compact ? 16 : 20}
                                        className={i < data.restDaysAllowed - data.restDaysUsed ? "fill-current" : ""}
                                        style={{
                                            color: i < data.restDaysAllowed - data.restDaysUsed
                                                ? '#f472b6'
                                                : `${textColor}30`
                                        }}
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-[2rem] p-6 space-y-5" style={neoSurface}>
                            {/* Rest Day Button */}
                            {data.restDaysUsed < data.restDaysAllowed && (
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); takeRestDay(); }}
                                    className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(244, 114, 182, 0.15))',
                                        border: '1px solid rgba(167, 139, 250, 0.3)',
                                        color: '#a78bfa'
                                    }}
                                >
                                    <Moon size={20} />
                                    Take a Rest Day
                                </motion.button>
                            )}

                            {/* Philosophy message */}
                            <div className="text-center py-4">
                                <p className="text-sm italic leading-relaxed" style={{ color: `${textColor}60` }}>
                                    "It's okay to rest. Your plant will keep growing,<br />
                                    because growth takes time and patience."
                                </p>
                            </div>

                            {/* How to earn points */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: `${textColor}50` }}>
                                    How to Nurture Your Plant
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    <div
                                        className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                                        style={neoInset}
                                    >
                                        <Droplets size={22} style={{ color: '#60a5fa' }} />
                                        <span className="text-xs font-medium" style={{ color: `${textColor}80` }}>Breathing</span>
                                        <span className="text-xs font-bold" style={{ color: greenColor }}>+5 pts</span>
                                    </div>
                                    <div
                                        className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                                        style={neoInset}
                                    >
                                        <Sun size={22} style={{ color: primaryColor }} />
                                        <span className="text-xs font-medium" style={{ color: `${textColor}80` }}>Chat</span>
                                        <span className="text-xs font-bold" style={{ color: greenColor }}>+3 pts</span>
                                    </div>
                                    <div
                                        className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                                        style={neoInset}
                                    >
                                        <Leaf size={22} style={{ color: greenColor }} />
                                        <span className="text-xs font-medium" style={{ color: `${textColor}80` }}>Journal</span>
                                        <span className="text-xs font-bold" style={{ color: greenColor }}>+2 pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Growth stages preview */}
                            <div className={compact ? 'space-y-2' : 'space-y-3'}>
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: `${textColor}50` }}>
                                    Growth Stages
                                </p>
                                <div className="flex justify-between items-end">
                                    {GROWTH_STAGES.map((stage, i) => (
                                        <motion.div
                                            key={stage.name}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`flex flex-col items-center gap-1 ${i <= stageIndex ? 'opacity-100' : 'opacity-30'}`}
                                        >
                                            <div
                                                className={`${compact ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} flex items-center justify-center`}
                                                style={i <= stageIndex ? neoBtn : neoInset}
                                            >
                                                <span className={compact ? 'text-sm' : 'text-lg'}>{stage.emoji}</span>
                                            </div>
                                            <span className="text-[10px] font-medium" style={{ color: `${textColor}60` }}>
                                                {stage.minPoints}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Points */}
                            <div
                                className={`flex items-center justify-between ${compact ? 'p-3 rounded-xl' : 'p-4 rounded-2xl'}`}
                                style={neoInset}
                            >
                                <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`} style={{ color: `${textColor}80` }}>
                                    Total Wellness Points
                                </span>
                                <span className={`${compact ? 'text-lg' : 'text-xl'} font-bold`} style={{ color: greenColor }}>
                                    {data.totalWellnessPoints}
                                </span>
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
