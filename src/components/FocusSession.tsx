"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, GripVertical, Edit2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface Task {
    id: string;
    title: string;
    duration: number; // in minutes
    isCompleted: boolean;
}

type SessionPhase = "approval" | "focus";

interface FocusSessionProps {
    initialTasks?: Task[];
    onAdjustPlan?: () => void;
}

export default function FocusSession({ initialTasks = [], onAdjustPlan }: FocusSessionProps) {
    // Phase management
    const [phase, setPhase] = useState<SessionPhase>(initialTasks.length > 0 ? "approval" : "focus");
    
    // Task management
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTaskIndex, setActiveTaskIndex] = useState(0);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
    const [isRunning, setIsRunning] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(25); // minutes
    
    // Drag state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // Initialize timer with first task duration
    useEffect(() => {
        if (phase === "focus" && tasks.length > 0 && activeTaskIndex < tasks.length) {
            const duration = tasks[activeTaskIndex].duration;
            setSessionDuration(duration);
            setTimeLeft(duration * 60);
        }
    }, [activeTaskIndex, phase, tasks]);

    const handleTimerComplete = () => {
        setIsRunning(false);
        toast.success("Time's up! 🎉 Great work!");
        new Audio("/notification.mp3").play().catch(() => {});
    };

    const handleStartSession = () => {
        setPhase("focus");
        setIsRunning(true);
    };

    const handleToggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const handleCompleteTask = () => {
        if (activeTaskIndex >= tasks.length) return;

        const completedTask = { ...tasks[activeTaskIndex], isCompleted: true };
        setCompletedTasks([...completedTasks, completedTask]);
        
        // Remove from tasks
        const updatedTasks = tasks.filter((_, idx) => idx !== activeTaskIndex);
        setTasks(updatedTasks);

        toast.success("Task crushed! 🔥");
        new Audio("/notification.mp3").play().catch(() => {});

        // Move to next task or end session
        if (updatedTasks.length > 0) {
            setActiveTaskIndex(0);
            setIsRunning(false);
        } else {
            // All tasks completed
            setIsRunning(false);
            toast.success("All missions completed! 🎊", { duration: 5000 });
        }
    };

    const handleSkipTask = () => {
        if (activeTaskIndex < tasks.length - 1) {
            setActiveTaskIndex(activeTaskIndex + 1);
            setIsRunning(false);
        }
    };

    // Drag handlers for queue reordering
    const handleDragStart = (index: number) => {
        if (index === 0) return; // Can't drag active task
        setDraggedIndex(index);
    };

    const handleDragEnter = (index: number) => {
        if (draggedIndex === null || draggedIndex === index || index === 0) return;

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

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Calculate progress for circular timer
    const progress = ((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100;

    // ==================== PHASE 1: APPROVAL ====================
    if (phase === "approval") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    {/* Mission Brief Card */}
                    <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 bg-blue-100 rounded-3xl mb-4 animate-bounce">
                                <span className="text-6xl">🎯</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-3">
                                Mission Brief
                            </h2>
                            <p className="text-slate-500 text-lg font-medium">
                                Your AI-generated focus plan is ready. Review and lock it in!
                            </p>
                        </div>

                        {/* Task Preview */}
                        <div className="space-y-3 mb-8">
                            {tasks.map((task, idx) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{task.title}</p>
                                    </div>
                                    <div className="text-sm font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                                        {task.duration} min
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Time */}
                        <div className="bg-blue-50 rounded-2xl p-4 mb-8 text-center border border-blue-100">
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-1">
                                Total Focus Time
                            </p>
                            <p className="text-3xl font-black text-blue-700">
                                {tasks.reduce((sum, t) => sum + t.duration, 0)} minutes
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={onAdjustPlan}
                                className="flex-1 btn-clay btn-clay-white py-5 text-lg"
                            >
                                Adjust Plan
                            </button>
                            <button
                                onClick={handleStartSession}
                                className="flex-1 btn-clay btn-clay-blue py-5 text-lg flex items-center justify-center gap-2"
                            >
                                <Play size={20} fill="white" />
                                Lock It In & Start
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== PHASE 2: FOCUS MODE ====================
    const activeTask = tasks.length > 0 ? tasks[0] : null;
    const upcomingTasks = tasks.slice(1);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 p-6">
            <div className="max-w-4xl mx-auto py-8">
                {/* Hero: Circular Timer */}
                <div className="bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100 mb-8 text-center">
                    {/* Circular Progress Ring */}
                    <div className="relative inline-block mb-8">
                        <svg width="280" height="280" className="transform -rotate-90">
                            {/* Background Circle */}
                            <circle
                                cx="140"
                                cy="140"
                                r="120"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="16"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="140"
                                cy="140"
                                r="120"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="16"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 120}`}
                                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
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
                            <div className="mb-2 animate-pulse">
                                <span className="text-5xl">🦉</span>
                            </div>
                            <div className="text-5xl font-black text-slate-800 tracking-tight">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleToggleTimer}
                            className="btn-clay btn-clay-blue px-10 py-4 text-lg flex items-center gap-3"
                        >
                            {isRunning ? (
                                <>
                                    <Pause size={20} fill="white" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play size={20} fill="white" />
                                    Start Focus
                                </>
                            )}
                        </button>

                        {activeTask && (
                            <button
                                onClick={handleSkipTask}
                                disabled={upcomingTasks.length === 0}
                                className="btn-clay btn-clay-white px-6 py-4 text-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SkipForward size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Task (The Bridge) */}
                {activeTask && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-[32px] p-8 mb-6 border-4 border-blue-100 shadow-soft-blue animate-pulse">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
                                    Currently Focusing On
                                </p>
                                <h3 className="text-3xl font-black text-slate-800 mb-2">
                                    {activeTask.title}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <span className="text-sm font-bold">⏱️ {activeTask.duration} min sprint</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCompleteTask}
                                className="btn-clay bg-green-500 border-green-700 text-white hover:bg-green-400 px-6 py-4 flex items-center gap-2"
                            >
                                <CheckCircle2 size={20} />
                                Complete
                            </button>
                        </div>
                    </div>
                )}

                {/* Upcoming Queue */}
                {upcomingTasks.length > 0 && (
                    <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100">
                        <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">📋</span>
                            Up Next
                        </h4>

                        <div className="space-y-3">
                            {upcomingTasks.map((task, idx) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={() => handleDragStart(idx + 1)}
                                    onDragEnter={() => handleDragEnter(idx + 1)}
                                    onDragEnd={handleDragEnd}
                                    className={`group flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-50 hover:opacity-75 transition-all ${
                                        draggedIndex === idx + 1 ? "scale-95" : ""
                                    }`}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                        <GripVertical className="text-slate-300" size={18} />
                                    </div>

                                    <div className="flex items-center justify-center w-7 h-7 bg-slate-200 text-slate-600 rounded-full font-bold text-sm">
                                        {idx + 2}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-bold text-slate-600">{task.title}</p>
                                    </div>

                                    <div className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                                        {task.duration} min
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Tasks (Bottom) */}
                {completedTasks.length > 0 && (
                    <div className="mt-8 bg-green-50 rounded-[32px] p-6 border border-green-100">
                        <h4 className="text-lg font-black text-green-700 mb-4 flex items-center gap-2">
                            <CheckCircle2 size={20} />
                            Completed ({completedTasks.length})
                        </h4>
                        <div className="space-y-2">
                            {completedTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 bg-white rounded-xl"
                                >
                                    <CheckCircle2 className="text-green-500" size={18} />
                                    <p className="flex-1 text-slate-500 line-through font-medium">
                                        {task.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Done State */}
                {tasks.length === 0 && completedTasks.length > 0 && (
                    <div className="text-center py-12">
                        <div className="inline-block p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-[32px] mb-6 animate-bounce">
                            <span className="text-8xl">🎊</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 mb-3">
                            All Missions Complete!
                        </h3>
                        <p className="text-slate-500 text-lg font-medium">
                            You crushed it today. Time to celebrate! 🎉
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
