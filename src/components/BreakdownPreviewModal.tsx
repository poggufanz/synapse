"use client";

import { useState, useEffect } from "react";
import { X, Check, Sparkles, Clock, Zap, Brain, Battery, RefreshCw, MessageSquare } from "lucide-react";

export interface PreviewTask {
    id: string;
    action: string;
    summary?: string;
    energy: "Deep Work" | "Shallow Work" | "Recovery";
    duration: number;
    isSelected: boolean;
    source?: string;
}

interface BreakdownPreviewModalProps {
    isOpen: boolean;
    tasks: PreviewTask[];
    isLoading?: boolean;
    originalInput?: string;
    onAccept: (selectedTasks: PreviewTask[]) => void;
    onReprompt: (feedback: string) => void;
    onCancel: () => void;
}

const getEnergyIcon = (energy: string) => {
    switch (energy) {
        case "Deep Work":
            return <Brain size={14} className="text-purple-500" />;
        case "Shallow Work":
            return <Zap size={14} className="text-blue-500" />;
        case "Recovery":
            return <Battery size={14} className="text-green-500" />;
        default:
            return <Zap size={14} className="text-slate-500" />;
    }
};

const getEnergyColor = (energy: string) => {
    switch (energy) {
        case "Deep Work":
            return "bg-purple-100 text-purple-600 border-purple-200";
        case "Shallow Work":
            return "bg-blue-100 text-blue-600 border-blue-200";
        case "Recovery":
            return "bg-green-100 text-green-600 border-green-200";
        default:
            return "bg-slate-100 text-slate-600 border-slate-200";
    }
};

export default function BreakdownPreviewModal({
    isOpen,
    tasks: initialTasks,
    isLoading = false,
    originalInput = "",
    onAccept,
    onReprompt,
    onCancel,
}: BreakdownPreviewModalProps) {
    const [tasks, setTasks] = useState<PreviewTask[]>([]);
    const [showReprompt, setShowReprompt] = useState(false);
    const [repromptFeedback, setRepromptFeedback] = useState("");

    // Reset tasks when initial tasks change
    useEffect(() => {
        if (initialTasks.length > 0) {
            setTasks(initialTasks.map(t => ({ ...t, isSelected: true })));
        }
    }, [initialTasks]);

    const toggleTask = (id: string) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, isSelected: !task.isSelected } : task
            )
        );
    };

    const selectAll = () => {
        setTasks(prev => prev.map(task => ({ ...task, isSelected: true })));
    };

    const deselectAll = () => {
        setTasks(prev => prev.map(task => ({ ...task, isSelected: false })));
    };

    const handleAccept = () => {
        const selectedTasks = tasks.filter(task => task.isSelected);
        onAccept(selectedTasks);
    };

    const handleReprompt = () => {
        if (repromptFeedback.trim()) {
            onReprompt(repromptFeedback);
            setRepromptFeedback("");
            setShowReprompt(false);
        }
    };

    const selectedCount = tasks.filter(t => t.isSelected).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-slideUp max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">AI Breakdown Preview</h3>
                            <p className="text-sm text-slate-500">Select tasks to add to your list</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Original Input Preview */}
                {originalInput && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-4 flex-shrink-0">
                        <p className="text-xs text-slate-500 mb-1">Breaking down:</p>
                        <p className="text-sm text-slate-700 font-medium truncate">{originalInput}</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="py-12 text-center flex-1 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Breaking down your task...</p>
                        <p className="text-xs text-slate-400 mt-2">This may take a moment</p>
                    </div>
                ) : showReprompt ? (
                    /* Reprompt Input */
                    <div className="flex-1 flex flex-col">
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                How should I adjust the breakdown?
                            </label>
                            <textarea
                                value={repromptFeedback}
                                onChange={(e) => setRepromptFeedback(e.target.value)}
                                placeholder="e.g., 'Make the steps smaller' or 'Focus more on design tasks'"
                                className="w-full h-24 p-3 border-2 border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-400"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReprompt(false)}
                                className="flex-1 py-3 px-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleReprompt}
                                disabled={!repromptFeedback.trim()}
                                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw size={16} className="inline mr-2" />
                                Re-break
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Selection Controls */}
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                            <span className="text-sm text-slate-500">
                                {selectedCount} of {tasks.length} selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={selectAll}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAll}
                                    className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="space-y-2 overflow-y-auto flex-1 pr-1 min-h-0">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        task.isSelected
                                            ? "border-blue-400 bg-blue-50/50"
                                            : "border-slate-100 hover:border-slate-200 bg-white"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox */}
                                        <div
                                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                                task.isSelected
                                                    ? "bg-blue-500 border-blue-500"
                                                    : "border-slate-300"
                                            }`}
                                        >
                                            {task.isSelected && (
                                                <Check size={12} className="text-white" />
                                            )}
                                        </div>

                                        {/* Task Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800 text-sm">
                                                {task.action}
                                            </p>
                                            {task.summary && (
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                    {task.summary}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getEnergyColor(
                                                        task.energy
                                                    )}`}
                                                >
                                                    {getEnergyIcon(task.energy)}
                                                    {task.energy}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock size={12} />
                                                    {task.duration}m
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-3 px-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAccept}
                                    disabled={selectedCount === 0}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                                >
                                    Add {selectedCount} Tasks
                                </button>
                            </div>
                            
                            {/* Reprompt Button */}
                            <button
                                onClick={() => setShowReprompt(true)}
                                className="w-full py-2.5 px-4 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={14} />
                                Not quite right? Adjust the breakdown
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
