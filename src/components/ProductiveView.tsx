"use client";

import { useEnergyStore } from "@/store/useEnergyStore";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { 
    ArrowLeft, 
    BatteryWarning, 
    Play, 
    Pause, 
    GripVertical, 
    Trash2, 
    CheckCircle2, 
    Circle, 
    ChevronDown, 
    ChevronUp, 
    Sparkles 
} from "lucide-react";
import ProductiveChat from "./ProductiveChat";
import IdeaVault from "./IdeaVault";

interface MicroMission {
    id: string;
    action: string;
    summary: string;
    energy: "Deep Work" | "Shallow Work" | "Recovery";
    source: string;
    duration: number; // in minutes
    isCompleted: boolean;
    isAIGenerated?: boolean;
}

export default function ProductiveView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);
    
    // Task management
    const [tasks, setTasks] = useState<MicroMission[]>([]);
    const [activeTask, setActiveTask] = useState<MicroMission | null>(null);
    const [completedTasks, setCompletedTasks] = useState<MicroMission[]>([]);
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
    const [isRunning, setIsRunning] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(25); // minutes
    
    // UI state
    const [inputValue, setInputValue] = useState("");
    const [selectedDuration, setSelectedDuration] = useState(25); // Default 25 minutes
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showTiredModal, setShowTiredModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const durationOptions = [
        { label: "15m", value: 15 },
        { label: "25m", value: 25 },
        { label: "45m", value: 45 },
        { label: "60m", value: 60 },
    ];

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        setIsRunning(false);
        toast.success("Time's up! 🎉 Great focus session!");
        new Audio("/notification.mp3").play().catch(() => {});
    };

    const handleToggleTimer = () => {
        if (!activeTask) {
            toast.error("Select a task to start focusing!");
            return;
        }
        setIsRunning(!isRunning);
    };

    const handlePlayTask = (task: MicroMission) => {
        setActiveTask(task);
        setSessionDuration(task.duration);
        setTimeLeft(task.duration * 60);
        setIsRunning(true);
        toast.success(`Now focusing on: ${task.action} 🎯`);
    };

    const handleCompleteActiveTask = () => {
        if (!activeTask) return;

        const completedTask = { ...activeTask, isCompleted: true };
        setCompletedTasks([...completedTasks, completedTask]);
        
        // Remove from tasks
        setTasks(tasks.filter((t) => t.id !== activeTask.id));
        setActiveTask(null);
        setIsRunning(false);

        toast.success("Task crushed! 🔥");
        new Audio("/notification.mp3").play().catch(() => {});
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
                // Convert to MicroMission format with AI flag
                const formattedTasks = newTasks.map((t: any, index: number) => ({
                    id: Date.now().toString() + index,
                    action: t.action,
                    summary: t.summary || "",
                    energy: t.energy || "Shallow Work",
                    source: t.source || "AI Generated",
                    duration: 25,
                    isCompleted: false,
                    isAIGenerated: true,
                }));
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

    const handleAddTask = () => {
        if (inputValue.trim() === "") return;

        const newTask: MicroMission = {
            id: Date.now().toString(),
            action: inputValue.trim(),
            summary: "Manual task - add details as you work",
            energy: "Shallow Work",
            source: "Manual",
            duration: selectedDuration,
            isCompleted: false,
            isAIGenerated: false,
        };

        setTasks([newTask, ...tasks]);
        setInputValue("");
        toast.success("Task added! 📝");
    };

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter((t) => t.id !== id));
        toast.success("Task removed 🗑️");
    };

    const handleToggleTaskComplete = (id: string) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;

        const completedTask = { ...task, isCompleted: true };
        setCompletedTasks([...completedTasks, completedTask]);
        setTasks(tasks.filter((t) => t.id !== id));
        
        toast.success("Nice! 🎉");
        new Audio("/notification.mp3").play().catch(() => {});
    };

    // Drag handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragEnter = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const newTasks = [...tasks];
        const draggedTask = newTasks[draggedIndex];
        
        newTasks.splice(draggedIndex, 1);
        newTasks.splice(index, 0, draggedTask);
        
        setTasks(newTasks);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

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

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Calculate progress
    const progress = ((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100;

    const getTagColor = (tag: string) => {
        const colors: Record<string, string> = {
            "Deep Work": "bg-purple-100 text-purple-600 border-purple-200",
            "Shallow Work": "bg-blue-100 text-blue-600 border-blue-200",
            "Recovery": "bg-green-100 text-green-600 border-green-200",
            default: "bg-slate-100 text-slate-600 border-slate-200",
        };
        return colors[tag] || colors.default;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 relative">
            {/* Exit Focus Button */}
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

            <div className="max-w-7xl mx-auto py-8">
                {/* 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* ==================== LEFT COLUMN: FOCUS STATION ==================== */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
                        
                        {/* Header: Greeting & Energy Stats */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">
                                        Hey, {persona?.name || "Focus Warrior"}! 👋
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium mt-1">
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                                <span className="text-xl">⚡</span>
                                <span className="text-sm font-bold text-blue-700">Energy: High</span>
                            </div>
                            <button
                                onClick={handleTiredClick}
                                className="mt-3 w-full text-slate-400 hover:text-amber-500 transition-colors text-sm font-bold flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-amber-50"
                            >
                                <BatteryWarning size={18} />
                                I'm feeling tired
                            </button>
                        </div>

                        {/* Hero: Soft Pomodoro Timer */}
                        <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 text-center">
                            {/* Circular Progress Ring */}
                            <div className="relative inline-block mb-6">
                                <svg width="220" height="220" className="transform -rotate-90">
                                    {/* Background Circle */}
                                    <circle
                                        cx="110"
                                        cy="110"
                                        r="95"
                                        fill="none"
                                        stroke="#e2e8f0"
                                        strokeWidth="14"
                                    />
                                    {/* Progress Circle */}
                                    <circle
                                        cx="110"
                                        cy="110"
                                        r="95"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="14"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 95}`}
                                        strokeDashoffset={`${2 * Math.PI * 95 * (1 - progress / 100)}`}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Timer Display + Mascot */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="mb-1 animate-pulse">
                                        <span className="text-4xl">{isRunning ? "🦉" : "☕"}</span>
                                    </div>
                                    <div className="text-4xl font-black text-slate-800 tracking-tight">
                                        {formatTime(timeLeft)}
                                    </div>
                                </div>
                            </div>

                            {/* Timer Controls */}
                            <button
                                onClick={handleToggleTimer}
                                className="btn-clay btn-clay-blue w-full py-4 text-lg flex items-center justify-center gap-2"
                            >
                                {isRunning ? (
                                    <>
                                        <Pause size={20} fill="white" />
                                        Pause Focus
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} fill="white" />
                                        Start Focus
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Active Task Card */}
                        {activeTask ? (
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-[32px] p-6 shadow-lg border-4 border-blue-200 animate-pulse">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                                    Currently Doing
                                </p>
                                <h3 className="text-xl font-black text-slate-800 mb-3">
                                    {activeTask.action}
                                </h3>
                                {activeTask.isAIGenerated && (
                                    <div className="flex items-center gap-2 text-xs text-purple-600 mb-3">
                                        <Sparkles size={14} />
                                        <span className="font-bold">AI Mission</span>
                                    </div>
                                )}
                                <button
                                    onClick={handleCompleteActiveTask}
                                    className="btn-clay bg-green-500 border-green-700 text-white hover:bg-green-400 w-full py-3 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Mark Complete
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-[32px] p-10 text-center border-2 border-dashed border-slate-300">
                                <div className="text-6xl mb-4 opacity-40 animate-pulse">🎯</div>
                                <h4 className="text-lg font-bold text-slate-600 mb-2">Waiting for your move</h4>
                                <p className="text-sm text-slate-500 font-medium">
                                    Click <Play size={14} className="inline mx-1" /> on a task from the right to start focusing
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ==================== RIGHT COLUMN: MASTER LIST ==================== */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Smart Omnibar Input */}
                        <div className="bg-white rounded-[32px] p-8 shadow-lg border-2 border-slate-200">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                                Smart Input
                            </h3>
                            
                            {/* Multi-line Textarea */}
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="What's on your mind? (Type a simple task or dump your stress here...)"
                                className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-blue-400 focus:outline-none text-slate-800 font-medium resize-none transition-all text-base leading-relaxed mb-4"
                            />
                            
                            {/* Duration Pills */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-sm font-bold text-slate-600">Duration:</span>
                                <div className="flex gap-2">
                                    {durationOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSelectedDuration(opt.value)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                selectedDuration === opt.value
                                                    ? "bg-blue-500 text-white shadow-md scale-105"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleAddTask}
                                    disabled={!inputValue.trim()}
                                    className="btn-clay btn-clay-blue py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ➕ Add Task
                                </button>
                                <button
                                    onClick={() => handleBreakDown(inputValue)}
                                    disabled={isLoading || !inputValue.trim()}
                                    className="btn-clay bg-purple-500 border-purple-700 text-white hover:bg-purple-400 py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Sparkles size={16} />
                                    AI Breakdown
                                </button>
                            </div>
                            
                            <p className="text-xs text-slate-400 mt-4 font-medium text-center">
                                Quick task? Hit <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold">Add Task</kbd>. 
                                Feeling overwhelmed? Use <kbd className="px-2 py-1 bg-purple-100 rounded text-purple-600 font-bold">AI Breakdown</kbd>
                            </p>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <div className="mb-4 animate-bounce">
                                    <span className="text-6xl">🤖</span>
                                </div>
                                <p className="text-slate-600 font-bold text-lg">AI is breaking down your mission...</p>
                                <p className="text-slate-400 text-sm mt-2">This might take a few seconds</p>
                            </div>
                        )}

                        {/* Task List Header */}
                        {!isLoading && tasks.length > 0 && (
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-black text-slate-700 flex items-center gap-2">
                                    <span className="text-2xl">📋</span>
                                    Your Missions ({tasks.length})
                                </h3>
                                <p className="text-sm text-slate-400 font-medium">
                                    Click <Play size={12} className="inline mx-1" /> to start
                                </p>
                            </div>
                        )}

                        {/* Unified Task List */}
                        {!isLoading && tasks.length > 0 && (
                            <div className="space-y-3">
                                {tasks.map((task, index) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        index={index}
                                        isActive={activeTask?.id === task.id}
                                        isExpanded={expandedTaskId === task.id}
                                        onPlay={() => handlePlayTask(task)}
                                        onToggle={() => handleToggleTaskComplete(task.id)}
                                        onDelete={() => handleDeleteTask(task.id)}
                                        onExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                        onDragStart={handleDragStart}
                                        onDragEnter={handleDragEnter}
                                        onDragEnd={handleDragEnd}
                                        isDragging={draggedIndex === index}
                                        getTagColor={getTagColor}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {tasks.length === 0 && !isLoading && (
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-[32px] p-16 text-center border-2 border-dashed border-slate-300">
                                <div className="mb-6 animate-bounce">
                                    <span className="text-9xl opacity-60">✨</span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 mb-3">
                                    Ready to focus?
                                </h3>
                                <p className="text-slate-600 font-medium text-lg max-w-md mx-auto mb-6">
                                    Type a task above, or dump all your stress into the Smart Input. 
                                    AI will help you break it down.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                                    <span className="px-3 py-1 bg-white rounded-full border border-slate-200 font-medium">
                                        Quick task? Add it manually
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="px-3 py-1 bg-purple-50 rounded-full border border-purple-200 font-medium text-purple-600">
                                        Overwhelmed? Let AI help
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Completed Tasks (Toggle) */}
                        {completedTasks.length > 0 && (
                            <div className="bg-green-50 rounded-3xl p-6 border border-green-100">
                                <button
                                    onClick={() => setShowCompleted(!showCompleted)}
                                    className="w-full flex items-center justify-between mb-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="text-green-600" size={20} />
                                        <span className="font-black text-green-700">
                                            Completed ({completedTasks.length})
                                        </span>
                                    </div>
                                    {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                
                                {showCompleted && (
                                    <div className="space-y-2 animate-slideDown">
                                        {completedTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-3 p-3 bg-white rounded-xl"
                                            >
                                                <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                                                <p className="flex-1 text-slate-500 line-through font-medium">
                                                    {task.action}
                                                </p>
                                                {task.isAIGenerated && (
                                                    <Sparkles className="text-purple-400 shrink-0" size={14} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== TASK ROW COMPONENT ====================
interface TaskRowProps {
    task: MicroMission;
    index: number;
    isActive: boolean;
    isExpanded: boolean;
    onPlay: () => void;
    onToggle: () => void;
    onDelete: () => void;
    onExpand: () => void;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
    isDragging: boolean;
    getTagColor: (tag: string) => string;
}

function TaskRow({
    task,
    index,
    isActive,
    isExpanded,
    onPlay,
    onToggle,
    onDelete,
    onExpand,
    onDragStart,
    onDragEnter,
    onDragEnd,
    isDragging,
    getTagColor,
}: TaskRowProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            draggable
            onDragStart={() => onDragStart(index)}
            onDragEnter={() => onDragEnter(index)}
            onDragEnd={onDragEnd}
            className={`group bg-white rounded-2xl transition-all duration-200 border shadow-sm ${
                isActive
                    ? "ring-2 ring-blue-400 border-blue-300 shadow-lg shadow-blue-200"
                    : "border-slate-100 hover:border-slate-200 hover:shadow-md"
            } ${isDragging ? "opacity-50 scale-95" : "opacity-100"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Collapsed State - Always Visible */}
            <div className="flex items-center gap-3 p-4">
                {/* Drag Handle */}
                <div
                    className={`transition-opacity duration-200 cursor-grab active:cursor-grabbing ${
                        isHovered ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <GripVertical className="text-gray-300" size={18} />
                </div>

                {/* Play Button */}
                <button
                    onClick={onPlay}
                    className="shrink-0 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all hover:scale-110 active:scale-95 shadow-md"
                    title="Start focusing on this task"
                >
                    <Play size={14} fill="white" />
                </button>

                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    className="shrink-0 text-gray-200 hover:text-green-500 transition-colors"
                >
                    <Circle className="w-6 h-6" />
                </button>

                {/* Task Content */}
                <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={onExpand}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-800">{task.action}</p>
                        {task.isAIGenerated && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 rounded-full border border-purple-200">
                                <Sparkles className="text-purple-500" size={12} />
                                <span className="text-[10px] font-bold text-purple-600 uppercase">AI</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-full">
                            ⏱️ {task.duration} min
                        </span>
                        <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getTagColor(task.energy)}`}
                        >
                            {task.energy}
                        </span>
                    </div>
                </div>

                {/* Expand/Collapse Icon */}
                <button
                    onClick={onExpand}
                    className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {/* Delete Button */}
                <button
                    onClick={onDelete}
                    className={`shrink-0 text-gray-300 hover:text-red-500 transition-all duration-200 ${
                        isHovered ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Expanded State - Shows Details */}
            {isExpanded && (
                <div className="px-4 pb-4 animate-slideDown border-t border-slate-100">
                    <div className="pt-4 pl-12">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Task Details
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">
                            {task.summary || "No additional details available."}
                        </p>
                        
                        {task.source && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="font-bold">Source:</span>
                                <span className="bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                                    {task.source}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
