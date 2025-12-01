"use client";

import { useState, KeyboardEvent } from "react";
import { GripVertical, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface Task {
    id: string;
    text: string;
    isCompleted: boolean;
    tags: string[];
}

interface TaskRowProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
    const [isHovered, setIsHovered] = useState(false);

    const getTagColor = (tag: string) => {
        const colors: Record<string, string> = {
            Work: "bg-blue-100 text-blue-600 border-blue-200",
            Health: "bg-green-100 text-green-600 border-green-200",
            Personal: "bg-purple-100 text-purple-600 border-purple-200",
            Learning: "bg-orange-100 text-orange-600 border-orange-200",
            default: "bg-slate-100 text-slate-600 border-slate-200",
        };
        return colors[tag] || colors.default;
    };

    return (
        <div
            className="group flex items-center gap-3 bg-white rounded-2xl p-4 transition-all duration-200 hover:bg-gray-50 border border-gray-100 hover:shadow-sm animate-slideDown"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Drag Handle (Appears on Hover) */}
            <div
                className={`transition-opacity duration-200 cursor-grab active:cursor-grabbing ${
                    isHovered ? "opacity-100" : "opacity-0"
                }`}
            >
                <GripVertical className="text-gray-300" size={18} />
            </div>

            {/* Round Checkbox with Bounce */}
            <button
                onClick={() => onToggle(task.id)}
                className="shrink-0 text-gray-200 hover:text-blue-500 transition-all duration-200 hover:scale-110 active:scale-95"
            >
                {task.isCompleted ? (
                    <CheckCircle2 className="text-blue-500 w-7 h-7 animate-bounce" />
                ) : (
                    <Circle className="w-7 h-7" />
                )}
            </button>

            {/* Task Text */}
            <div className="flex-1 min-w-0">
                <p
                    className={`text-base font-medium transition-all duration-200 ${
                        task.isCompleted
                            ? "text-gray-400 line-through"
                            : "text-slate-800"
                    }`}
                >
                    {task.text}
                </p>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
                <div className="flex gap-2">
                    {task.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${getTagColor(
                                tag
                            )}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Delete Button (Appears on Hover) */}
            <button
                onClick={() => onDelete(task.id)}
                className={`shrink-0 text-gray-300 hover:text-red-500 transition-all duration-200 ${
                    isHovered ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}

// Sample tasks for demo
const SAMPLE_TASKS: Task[] = [
    {
        id: "1",
        text: "Review PR for authentication module",
        isCompleted: true,
        tags: ["Work"],
    },
    {
        id: "2",
        text: "30-minute morning yoga session",
        isCompleted: false,
        tags: ["Health"],
    },
    {
        id: "3",
        text: "Finish reading 'Atomic Habits' chapter 3",
        isCompleted: false,
        tags: ["Learning", "Personal"],
    },
];

interface DailyTaskListWithSamplesProps {
    showSamples?: boolean;
}

export default function DailyTaskListWithSamples({
    showSamples = false,
}: DailyTaskListWithSamplesProps) {
    const [tasks, setTasks] = useState<Task[]>(showSamples ? SAMPLE_TASKS : []);
    const [inputValue, setInputValue] = useState("");

    const handleAddTask = () => {
        if (inputValue.trim() === "") return;

        // Auto-detect tags based on keywords
        const detectTags = (text: string): string[] => {
            const tags: string[] = [];
            const lowerText = text.toLowerCase();
            
            if (lowerText.includes("work") || lowerText.includes("meeting") || lowerText.includes("pr")) {
                tags.push("Work");
            }
            if (lowerText.includes("health") || lowerText.includes("exercise") || lowerText.includes("yoga")) {
                tags.push("Health");
            }
            if (lowerText.includes("learn") || lowerText.includes("read") || lowerText.includes("study")) {
                tags.push("Learning");
            }
            if (lowerText.includes("personal") || lowerText.includes("family") || lowerText.includes("friend")) {
                tags.push("Personal");
            }
            
            return tags;
        };

        const newTask: Task = {
            id: Date.now().toString(),
            text: inputValue.trim(),
            isCompleted: false,
            tags: detectTags(inputValue.trim()),
        };

        setTasks((prev) => [newTask, ...prev]);
        setInputValue("");
        toast.success("Task added! 🎯");

        // Play completion sound
        new Audio("/notification.mp3").play().catch(() => {});
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleAddTask();
        }
    };

    const handleToggleTask = (id: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id
                    ? { ...task, isCompleted: !task.isCompleted }
                    : task
            )
        );

        const task = tasks.find((t) => t.id === id);
        if (task && !task.isCompleted) {
            toast.success("Nice work! 🎉");
            new Audio("/notification.mp3").play().catch(() => {});
        }
    };

    const handleDeleteTask = (id: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        toast.success("Task removed 🗑️");
    };

    const completedCount = tasks.filter((t) => t.isCompleted).length;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <span className="text-4xl">📝</span>
                        Daily Task List
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Small wins add up to big victories
                    </p>
                </div>
                {tasks.length > 0 && (
                    <div className="text-sm font-bold text-slate-400">
                        {completedCount}/{tasks.length} done
                    </div>
                )}
            </div>

            {/* Quick Add Input */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Apa goal kecil hari ini?"
                    className="w-full text-lg font-medium text-slate-800 placeholder:text-gray-400 focus:outline-none bg-transparent border-b-2 border-gray-100 focus:border-blue-300 pb-3 transition-colors duration-200"
                />
                <p className="text-xs text-gray-400 mt-3 font-medium">
                    Press <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-bold">Enter</kbd> to add
                    <span className="ml-2 text-gray-300">•</span>
                    <span className="ml-2">Keywords like "work", "health", "learn" auto-add tags</span>
                </p>
            </div>

            {/* Task List */}
            {tasks.length > 0 ? (
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
                    <div className="mb-6 animate-bounce">
                        <span className="text-8xl">☕</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">
                        All clear!
                    </h3>
                    <p className="text-slate-500 font-medium text-lg">
                        Time to relax or add a new mission?
                    </p>
                </div>
            )}
        </div>
    );
}
