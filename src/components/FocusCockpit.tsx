"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, GripVertical, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Task {
    id: string;
    title: string;
    duration: number; // minutes
    isCompleted: boolean;
    isAIGenerated?: boolean;
    tags?: string[];
}

export default function FocusCockpit() {
    // Task management
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: "1",
            title: "Read Chapter 1: Introduction to React",
            duration: 25,
            isCompleted: false,
            isAIGenerated: true,
            tags: ["Deep Work"],
        },
        {
            id: "2",
            title: "Take notes on key concepts",
            duration: 15,
            isCompleted: false,
            isAIGenerated: true,
            tags: ["Shallow Work"],
        },
        {
            id: "3",
            title: "Review email inbox",
            duration: 10,
            isCompleted: false,
            isAIGenerated: false,
            tags: ["Personal"],
        },
    ]);
    
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
    const [isRunning, setIsRunning] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(25); // minutes
    
    // UI state
    const [inputValue, setInputValue] = useState("");
    const [brainDumpOpen, setBrainDumpOpen] = useState(false);
    const [brainDumpText, setBrainDumpText] = useState("");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    
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

    const handlePlayTask = (task: Task) => {
        setActiveTask(task);
        setSessionDuration(task.duration);
        setTimeLeft(task.duration * 60);
        setIsRunning(true);
        toast.success(`Now focusing on: ${task.title} 🎯`);
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

    const handleAddTask = () => {
        if (inputValue.trim() === "") return;

        const newTask: Task = {
            id: Date.now().toString(),
            title: inputValue.trim(),
            duration: 25,
            isCompleted: false,
            isAIGenerated: false,
            tags: [],
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
            Personal: "bg-orange-100 text-orange-600 border-orange-200",
            Health: "bg-green-100 text-green-600 border-green-200",
            default: "bg-slate-100 text-slate-600 border-slate-200",
        };
        return colors[tag] || colors.default;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* ==================== LEFT COLUMN: FOCUS STATION ==================== */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
                        
                        {/* Header: Greeting & Energy Stats */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">
                                        Hey, Focus Warrior! 👋
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
                                    {activeTask.title}
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
                            <div className="bg-slate-100 rounded-[32px] p-8 text-center border-2 border-dashed border-slate-300">
                                <div className="text-5xl mb-3 opacity-50">🎯</div>
                                <p className="text-slate-500 font-medium">
                                    Click <Play size={14} className="inline" /> on a task to start focusing
                                </p>
                            </div>
                        )}

                        {/* Brain Dump (Collapsible) */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <button
                                onClick={() => setBrainDumpOpen(!brainDumpOpen)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🧠</span>
                                    <span className="font-bold text-slate-800">Brain Dump</span>
                                </div>
                                {brainDumpOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            
                            {brainDumpOpen && (
                                <div className="p-4 pt-0 animate-slideDown">
                                    <textarea
                                        value={brainDumpText}
                                        onChange={(e) => setBrainDumpText(e.target.value)}
                                        placeholder="Type anything that's on your mind..."
                                        className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-blue-300 focus:outline-none text-slate-700 font-medium resize-none transition-all"
                                    />
                                    <p className="text-xs text-slate-400 mt-2 font-medium">
                                        Clear your mind. Just type, no pressure.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ==================== RIGHT COLUMN: MASTER LIST ==================== */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Header */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 mb-2">
                                <span className="text-4xl">📋</span>
                                Master Task List
                            </h2>
                            <p className="text-slate-500 font-medium">
                                AI missions + your own tasks, all in one place
                            </p>
                        </div>

                        {/* Quick Add Input */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                                placeholder="Add a quick task..."
                                className="w-full text-lg font-medium text-slate-800 placeholder:text-gray-400 focus:outline-none bg-transparent border-b-2 border-gray-100 focus:border-blue-300 pb-3 transition-colors duration-200"
                            />
                            <p className="text-xs text-gray-400 mt-3 font-medium">
                                Press <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-bold">Enter</kbd> to add
                            </p>
                        </div>

                        {/* Unified Task List */}
                        <div className="space-y-3">
                            {tasks.map((task, index) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    index={index}
                                    isActive={activeTask?.id === task.id}
                                    onPlay={() => handlePlayTask(task)}
                                    onToggle={() => handleToggleTaskComplete(task.id)}
                                    onDelete={() => handleDeleteTask(task.id)}
                                    onDragStart={handleDragStart}
                                    onDragEnter={handleDragEnter}
                                    onDragEnd={handleDragEnd}
                                    isDragging={draggedIndex === index}
                                    getTagColor={getTagColor}
                                />
                            ))}
                        </div>

                        {/* Empty State */}
                        {tasks.length === 0 && (
                            <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
                                <div className="mb-6 animate-bounce">
                                    <span className="text-8xl">☕</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">
                                    All clear!
                                </h3>
                                <p className="text-slate-500 font-medium text-lg">
                                    Add a task or generate missions with AI
                                </p>
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
                                                    {task.title}
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
    task: Task;
    index: number;
    isActive: boolean;
    onPlay: () => void;
    onToggle: () => void;
    onDelete: () => void;
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
    onPlay,
    onToggle,
    onDelete,
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
            className={`group flex items-center gap-3 bg-white rounded-2xl p-4 transition-all duration-200 border shadow-sm ${
                isActive
                    ? "border-blue-300 shadow-blue-200"
                    : "border-slate-100 hover:border-slate-200 hover:shadow-md"
            } ${isDragging ? "opacity-50 scale-95" : "opacity-100"}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
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
                className="shrink-0 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all hover:scale-110 active:scale-95"
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
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800">{task.title}</p>
                    {task.isAIGenerated && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 rounded-full border border-purple-200">
                            <Sparkles className="text-purple-500" size={12} />
                            <span className="text-[10px] font-bold text-purple-600 uppercase">AI</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">⏱️ {task.duration} min</span>
                    {task.tags && task.tags.map((tag) => (
                        <span
                            key={tag}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTagColor(tag)}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

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
    );
}
