"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import { useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import IdeaVault from "@/components/IdeaVault";
import { toast } from "sonner";
import { ArrowLeft, Zap, Loader2, BatteryWarning } from "lucide-react";
import ProductiveChat from "./ProductiveChat";
import PomodoroTimer from "./PomodoroTimer";

interface MicroStep {
    step: string;
    energy_tag: "Deep Work" | "Shallow Work" | "Recovery";
}

export default function ProductiveView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);
    const [taskInput, setTaskInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tasks, setTasks] = useState<MicroStep[]>([]);
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

    const handleBreakDown = async () => {
        if (!taskInput.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/breakdown", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ task: taskInput }),
            });

            if (response.ok) {
                const newTasks = await response.json();
                setTasks((prev) => [...prev, ...newTasks]);
                setTaskInput("");
                toast.success("Task broken down successfully! 🚀");
            }
        } catch (error) {
            console.error("Failed to break down task", error);
            toast.error("Failed to break down task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getEnergyColor = (tag: string) => {
        switch (tag) {
            case "Deep Work":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "Shallow Work":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "Recovery":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            default:
                return "bg-slate-500/20 text-slate-300 border-slate-500/30";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 relative">
            {/* Discreet Reset Button */}
            <button
                onClick={() => setMode(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-300 text-sm transition-colors flex items-center gap-2 z-20"
            >
                <ArrowLeft size={16} /> Change Mode
            </button>

            {/* Idea Vault FAB */}
            <IdeaVault />

            {/* Productive Chat */}
            <ProductiveChat />

            {/* Tired Modal */}
            {showTiredModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BatteryWarning className="text-amber-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Running Low?</h3>
                        <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                            {getEncouragement()}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowTiredModal(false);
                                    setMode("burnout"); // Optional: Switch to burnout mode
                                }}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl transition-colors"
                            >
                                Switch to Decompress
                            </button>
                            <button
                                onClick={() => setShowTiredModal(false)}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl transition-colors font-medium"
                            >
                                I'm Good Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto py-8">
                {/* Header */}
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                            <Zap className="text-cyan-400" size={48} />
                            FOCUS MODE
                        </h1>
                        <p className="text-slate-400 text-lg">Let's get things done, {persona?.name}.</p>
                    </div>

                    <button
                        onClick={handleTiredClick}
                        className="text-slate-500 hover:text-amber-400 transition-colors text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-amber-500/10"
                    >
                        <BatteryWarning size={16} />
                        I'm feeling tired
                    </button>
                </div>

                {/* Psychological Dashboard */}
                <div className="mb-8 p-1 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 shadow-xl backdrop-blur-sm">
                    <DashboardStats />
                </div>

                {/* Three Card Row: Pomodoro, Mood, Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Pomodoro Timer */}
                    <PomodoroTimer />

                    {/* Mood Tracker */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-white">Mood Tracker</h3>
                        <div className="space-y-3">
                            {/* Mock Graph */}
                            <div className="flex items-end justify-between h-32 gap-2">
                                <div className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg h-[60%]"></div>
                                <div className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg h-[75%]"></div>
                                <div className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg h-[85%]"></div>
                                <div className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg h-[70%]"></div>
                                <div className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg h-[90%]"></div>
                                <div className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg h-[95%]"></div>
                                <div className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg h-[100%]"></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                            <p className="text-center text-sm text-slate-400 mt-4">
                                Energy trending up! 📈
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-white">Today</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Completed</span>
                                <span className="text-cyan-400 font-bold text-xl">0/{tasks.length || 3}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Focus Time</span>
                                <span className="text-blue-400 font-bold text-xl">2h 15m</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task Area (Full Width) */}
                <div className="space-y-6">
                    {/* Task Input Area */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                        <h2 className="text-xl font-bold text-white">New Task</h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={taskInput}
                                onChange={(e) => setTaskInput(e.target.value)}
                                placeholder="What do you need to accomplish?"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                                onKeyDown={(e) => e.key === "Enter" && handleBreakDown()}
                            />
                        </div>
                        <button
                            onClick={handleBreakDown}
                            disabled={isLoading || !taskInput.trim()}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-2xl shadow-cyan-500/30 text-lg flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Analyzing Task...
                                </>
                            ) : (
                                <>🔨 Break It Down</>
                            )}
                        </button>
                    </div>

                    {/* Task List */}
                    {tasks.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-4 text-white">Action Plan</h2>
                            <div className="space-y-3">
                                {tasks.map((task, index) => (
                                    <label
                                        key={index}
                                        className="flex items-start gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group animate-fadeIn"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-5 h-5 rounded border-2 border-cyan-500 bg-slate-900 checked:bg-cyan-500 cursor-pointer shrink-0 accent-cyan-500"
                                        />
                                        <div className="flex-1 space-y-2">
                                            <span className="text-white group-hover:text-cyan-400 transition-colors block font-medium">
                                                {task.step}
                                            </span>
                                            <span
                                                className={`inline-block text-xs px-2 py-1 rounded border ${getEnergyColor(
                                                    task.energy_tag
                                                )}`}
                                            >
                                                {task.energy_tag}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
