"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, GripVertical, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, BatteryWarning } from "lucide-react";

import { useEnergyStore } from "@/store/useEnergyStore";
import { toast } from "sonner";
import NeumorphicTimer from "./NeumorphicTimer";

interface Task {
    id: string;
    title: string;
    duration: number; // minutes
    isCompleted: boolean;
    isAIGenerated?: boolean;
    tags?: string[];
}

export default function FocusCockpit() {
    const setMode = useEnergyStore((state) => state.setMode);
    // Task management - AI Generated Timeline Mock
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: "1",
            title: "Watch Intro Video",
            duration: 5,
            isCompleted: false,
            isAIGenerated: true,
            tags: ["Learning"],
        },
        {
            id: "2",
            title: "Read Definition",
            duration: 10,
            isCompleted: false,
            isAIGenerated: true,
            tags: ["Reading"],
        },
        {
            id: "3",
            title: "Solve 1 Practice Problem",
            duration: 15,
            isCompleted: false,
            isAIGenerated: true,
            tags: ["Practice"],
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

    const [isGenerating, setIsGenerating] = useState(false);

    const myKey = process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;

    const handleAddTask = async () => {
        if (inputValue.trim() === "") return;

        setIsGenerating(true);
        const goal = inputValue.trim();
        setInputValue(""); // Clear input immediately

        try {
            const promptText = `
                You are an expert productivity assistant.
                Goal: Break down the user's objective: "${goal}" into 3-5 concrete micro-tasks.
                
                Rules based on psychology:
                1. The first task MUST be a "Quick Win" (under 5 mins) to overcome inertia (Zeigarnik Effect).
                2. Other tasks should fit into a Pomodoro cycle (max 25 mins).
                3. Use simple, action-oriented language.
                
                Response MUST be a raw JSON Array following this exact schema:
                [
                  {
                    "title": "Task name",
                    "duration": "e.g., 5 min",
                    "tag": "Quick Win" | "Deep Work" | "Learning"
                  }
                ]
            `;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${myKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: promptText }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "API Request Failed");
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            
            // Clean up markdown code blocks if present (since we can't enforce JSON mode in v1)
            const cleanResponse = text.replace(/```json/g, "").replace(/```/g, "").trim();
            
            // Parse JSON response
            const generatedTasks = JSON.parse(cleanResponse);

            // Map to existing Task interface
            const newTasks: Task[] = generatedTasks.map((t: any, index: number) => {
                const durationNum = parseInt(t.duration) || 25;
                return {
                    id: Date.now().toString() + index,
                    title: t.title,
                    duration: durationNum,
                    isCompleted: false,
                    isAIGenerated: true,
                    tags: t.tag ? [t.tag] : []
                };
            });

            setTasks((prev) => [...newTasks, ...prev]);
            toast.success("Mission generated! 🚀");

        } catch (error: any) {
            console.error("AI Error:", error);
            // Fallback to manual add if AI fails
            const newTask: Task = {
                id: Date.now().toString(),
                title: goal,
                duration: 25,
                isCompleted: false,
                isAIGenerated: false,
                tags: [],
            };
            setTasks((prev) => [newTask, ...prev]);
            toast.error(`AI Error: ${error.message || "Failed to generate plan"}`);
        } finally {
            setIsGenerating(false);
        }
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

    // Calculate progress
    const progress = ((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100;

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Top Bar */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setMode("burnout")}
                        className="group relative flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600 group-hover:text-red-600 transition-colors">
                                I'm Drained
                            </span>
                            <div className="relative">
                                <BatteryWarning 
                                    size={18} 
                                    className="text-slate-400 group-hover:text-red-500 transition-colors group-hover:animate-pulse" 
                                />
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-0 group-hover:opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                </span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* ==================== LEFT COLUMN: FOCUS STATION ==================== */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
                        
                        {/* Header: Greeting & Energy Stats */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">
                                        Focus Mode
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium mt-1">
                                        Let's get things done.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hero: Neumorphic Timer */}
                        <NeumorphicTimer
                            timeLeft={timeLeft}
                            isRunning={isRunning}
                            onToggle={handleToggleTimer}
                            duration={sessionDuration}
                            setDuration={(d: number) => {
                                setSessionDuration(d);
                                if (!isRunning) setTimeLeft(d * 60);
                            }}
                            progress={progress}
                        />

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
                    </div>

                    {/* ==================== RIGHT COLUMN: AI TASK TIMELINE ==================== */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* AI Mission Input */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.1)] border border-blue-100 p-2 flex items-center gap-4 transition-all focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-300">
                                <div className="pl-4 text-blue-500 animate-pulse">
                                    <Sparkles size={24} />
                                </div>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                                    placeholder="What do you want to achieve? (e.g. Learn Calculus Limits)"
                                    className="w-full py-4 text-lg font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                                />
                                <button 
                                    onClick={handleAddTask}
                                    disabled={isGenerating}
                                    className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ChevronDown size={20} className="-rotate-90" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Vertical Task Timeline */}
                        <div className="relative pl-4">
                            {/* Connecting Line */}
                            <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-blue-100 rounded-full"></div>

                            <div className="space-y-6">
                                {tasks.map((task, index) => (
                                    <div 
                                        key={task.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragEnter={() => handleDragEnter(index)}
                                        onDragEnd={handleDragEnd}
                                        className={`relative pl-12 group transition-all duration-300 ${
                                            draggedIndex === index ? "opacity-50 scale-95" : "opacity-100"
                                        }`}
                                    >
                                        {/* Timeline Node */}
                                        <div className={`absolute left-[19px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-[3px] border-white shadow-sm z-10 transition-colors ${
                                            activeTask?.id === task.id ? "bg-blue-500 ring-4 ring-blue-100" : "bg-blue-200 group-hover:bg-blue-400"
                                        }`}></div>

                                        {/* Task Card */}
                                        <div className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between gap-4 ${
                                            activeTask?.id === task.id ? "ring-2 ring-blue-400 shadow-blue-100" : ""
                                        }`}>
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex flex-col">
                                                    <h4 className={`text-lg font-bold ${activeTask?.id === task.id ? "text-blue-700" : "text-slate-800"}`}>
                                                        {task.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                            ⏱️ {task.duration} min
                                                        </span>
                                                        {task.isAIGenerated && (
                                                            <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-1 rounded-md border border-purple-100 flex items-center gap-1">
                                                                <Sparkles size={10} /> AI
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handlePlayTask(task)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="Start Focus"
                                                >
                                                    <Play size={18} fill="currentColor" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleTaskComplete(task.id)}
                                                    className="p-2 text-slate-300 hover:text-green-500 transition-colors"
                                                    title="Mark Done"
                                                >
                                                    <CheckCircle2 size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {tasks.length === 0 && (
                                <div className="ml-12 bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
                                    <div className="text-4xl mb-4 opacity-30">✨</div>
                                    <p className="text-slate-500 font-medium">
                                        Enter a goal above to generate your mission timeline.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
