"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import { useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import IdeaVault from "@/components/IdeaVault";
import { toast } from "sonner";
import { ArrowLeft, Zap, BatteryWarning } from "lucide-react";
import ProductiveChat from "./ProductiveChat";
import PomodoroTimer from "./PomodoroTimer";
import MissionInput from "./MissionInput";
import MissionLoader from "./MissionLoader";
import MissionCard from "./MissionCard";

interface MicroMission {
    action: string;
    summary: string;
    energy: "Deep Work" | "Shallow Work" | "Recovery";
    source: string;
    isCompleted: boolean;
}

export default function ProductiveView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);
    const [isLoading, setIsLoading] = useState(false);
    const [tasks, setTasks] = useState<MicroMission[]>([]);
    const [showTiredModal, setShowTiredModal] = useState(false);

    const handleTiredClick = () => {
        setShowTiredModal(true);
    };

    const getEncouragement = () => {
        if (!persona) return "You're doing great. Take a breath.";

        switch (persona.type) {
            case "Sensitive Soul":
                return `It's okay to rest, ${persona.name}. You've been working hard. A small break now means better energy later. Be gentle with yourself.`;
            case "Action Taker":
                return `Refuel time, ${persona.name}. Even Formula 1 cars need pit stops. Take 5 minutes to recharge, then get back in the race.`;
            case "Deep Thinker":
                return `Pause and process, ${persona.name}. Your brain needs a moment to consolidate all that thinking. Step away to see the big picture.`;
            default:
                return `Listen to your body, ${persona.name}. If you're tired, it's a signal. Rest is productive too.`;
        }
    };

    const handleBreakDown = async (text: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/breakdown", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ task: text }),
            });

            if (response.ok) {
                const newTasks = await response.json();
                // Add isCompleted property
                const formattedTasks = newTasks.map((t: any) => ({ ...t, isCompleted: false }));
                setTasks((prev) => [...prev, ...formattedTasks]);
                toast.success("Mission Deconstructed! 🚀");
            }
        } catch (error) {
            console.error("Failed to break down task", error);
            toast.error("Failed to break down task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTask = (index: number) => {
        const newTasks = [...tasks];
        newTasks[index].isCompleted = !newTasks[index].isCompleted;
        setTasks(newTasks);

        if (newTasks[index].isCompleted) {
            toast.success("Micro-mission Complete! 🎉");
            new Audio("/notification.mp3").play().catch(() => { });
        }
    };

    const completedCount = tasks.filter(t => t.isCompleted).length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6 relative font-sans">
            {/* Discreet Reset Button */}
            <button
                onClick={() => setMode(null)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-2 z-20 font-bold"
            >
                <ArrowLeft size={16} /> Exit Focus
            </button>

            {/* Idea Vault FAB */}
            <IdeaVault />

            {/* Productive Chat */}
            <ProductiveChat />

            {/* Tired Modal */}
            {showTiredModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] p-8 max-w-md w-full text-center shadow-2xl border border-white/50">
                        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft-orange animate-bounce">
                            {/* Friendlier "Low Battery" Icon */}
                            <span className="text-5xl">🥱</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-4">Running on Fumes?</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed text-lg font-medium">
                            {getEncouragement()}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowTiredModal(false);
                                    setMode("burnout");
                                }}
                                className="flex-1 btn-clay btn-clay-white py-4 text-slate-600"
                            >
                                Switch to Decompress
                            </button>
                            <button
                                onClick={() => setShowTiredModal(false)}
                                className="flex-1 btn-clay btn-clay-blue py-4"
                            >
                                I'm Good Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto py-8">
                {/* Header */}
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-100 rounded-2xl rotate-3 hover:rotate-6 transition-transform">
                                <span className="text-4xl">🦉</span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-800 tracking-tight">
                                FOCUS MODE
                            </h1>
                        </div>
                        <p className="text-slate-500 text-xl font-medium ml-1">Let's crush it, {persona?.name || "Friend"}.</p>
                    </div>

                    <button
                        onClick={handleTiredClick}
                        className="text-slate-400 hover:text-amber-500 transition-colors text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-amber-50"
                    >
                        <BatteryWarning size={18} />
                        I'm feeling tired
                    </button>
                </div>

                {/* Three Card Row: Pomodoro, Mood, Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 h-64">
                    {/* Pomodoro Timer */}
                    <PomodoroTimer />

                    {/* Mood Tracker (Placeholder for now, reusing structure) */}
                    <div className="bg-white rounded-[32px] p-6 shadow-soft-blue border border-slate-100 h-full flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-50 rounded-xl">
                                <Zap className="text-purple-600" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Daily Streak</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-5xl font-black text-slate-800 mb-2">12</div>
                                <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">Days in a row</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <DashboardStats />
                </div>

                {/* Task Area (Full Width) */}
                <div className="space-y-6">
                    {/* Task Input Area - Hidden when loading */}
                    {!isLoading && <MissionInput onBreakdown={handleBreakDown} isLoading={isLoading} />}

                    {/* Loading State */}
                    {isLoading && <MissionLoader />}

                    {/* Task List (Mission Log) */}
                    {tasks.length > 0 && !isLoading && (
                        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-xl shadow-slate-200/50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-800">Mission Progress</h2>
                                <div className="text-slate-400 font-bold text-sm">
                                    {completedCount}/{tasks.length} Completed
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-4 bg-slate-100 rounded-full mb-8 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="space-y-3">
                                {tasks.map((task, index) => (
                                    <MissionCard
                                        key={index}
                                        action={task.action}
                                        summary={task.summary}
                                        energy={task.energy}
                                        source={task.source}
                                        isCompleted={task.isCompleted}
                                        onToggle={() => toggleTask(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
