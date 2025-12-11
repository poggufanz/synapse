"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Clock, Check, RefreshCw, Zap, Coffee, Brain } from "lucide-react";

export interface PreviewTask {
    action: string;
    summary: string;
    duration: number;
    energy: "Recovery" | "Shallow Work" | "Deep Work";
    source: string;
}

interface BreakdownPreviewModalProps {
    isOpen: boolean;
    tasks: PreviewTask[];
    isLoading: boolean;
    originalInput: string;
    onAccept: (tasks: PreviewTask[]) => void;
    onReprompt: (feedback: string) => void;
    onCancel: () => void;
}

const energyIcons: Record<string, React.ReactNode> = {
    "Recovery": <Coffee size={14} className="text-green-500" />,
    "Shallow Work": <Zap size={14} className="text-amber-500" />,
    "Deep Work": <Brain size={14} className="text-purple-500" />,
};

const energyColors: Record<string, string> = {
    "Recovery": "bg-green-50 border-green-200 text-green-700",
    "Shallow Work": "bg-amber-50 border-amber-200 text-amber-700",
    "Deep Work": "bg-purple-50 border-purple-200 text-purple-700",
};

export default function BreakdownPreviewModal({
    isOpen,
    tasks,
    isLoading,
    originalInput,
    onAccept,
    onReprompt,
    onCancel,
}: BreakdownPreviewModalProps) {
    const [repromptText, setRepromptText] = useState("");
    const [showRepromptInput, setShowRepromptInput] = useState(false);

    const handleReprompt = () => {
        if (repromptText.trim()) {
            onReprompt(repromptText.trim());
            setRepromptText("");
            setShowRepromptInput(false);
        }
    };

    const totalTime = tasks.reduce((acc, t) => acc + (t.duration || 5), 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-purple-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">AI Breakdown</h2>
                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{originalInput}</p>
                                </div>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                        <RefreshCw size={28} className="text-purple-500 animate-spin" />
                                    </div>
                                    <p className="text-slate-600 font-medium">Breaking down into micro-tasks...</p>
                                    <p className="text-sm text-slate-400 mt-1">This takes a few seconds</p>
                                </div>
                            ) : tasks.length > 0 ? (
                                <>
                                    {/* Summary Badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                            <Sparkles size={14} />
                                            {tasks.length} micro-tasks
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                            <Clock size={14} />
                                            ~{totalTime} min total
                                        </span>
                                    </div>

                                    {/* Task List */}
                                    <div className="space-y-3">
                                        {tasks.map((task, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Number Badge */}
                                                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                                                        {index + 1}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        {/* Action + Duration */}
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h4 className="font-bold text-slate-800 truncate">{task.action}</h4>
                                                            <span className="text-xs text-slate-400 shrink-0">~{task.duration || 5}m</span>
                                                        </div>

                                                        {/* Summary */}
                                                        <p className="text-sm text-slate-500 mb-2">{task.summary}</p>

                                                        {/* Energy Tag */}
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${energyColors[task.energy] || energyColors["Shallow Work"]}`}>
                                                            {energyIcons[task.energy]}
                                                            {task.energy}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Reprompt Input */}
                                    {showRepromptInput && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-4"
                                        >
                                            <textarea
                                                value={repromptText}
                                                onChange={(e) => setRepromptText(e.target.value)}
                                                placeholder="E.g., 'Make them even smaller' or 'Focus more on reading'"
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-400 transition-colors"
                                                rows={2}
                                                autoFocus
                                            />
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-500">No tasks generated yet</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {!isLoading && tasks.length > 0 && (
                            <div className="p-4 border-t border-slate-100 bg-slate-50">
                                <div className="flex gap-3">
                                    {/* Cancel */}
                                    <button
                                        onClick={onCancel}
                                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>

                                    {/* Reprompt */}
                                    {showRepromptInput ? (
                                        <button
                                            onClick={handleReprompt}
                                            disabled={!repromptText.trim()}
                                            className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw size={16} />
                                            Regenerate
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowRepromptInput(true)}
                                            className="py-3 px-4 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors flex items-center gap-2"
                                        >
                                            <RefreshCw size={16} />
                                            Adjust
                                        </button>
                                    )}

                                    {/* Accept */}
                                    {!showRepromptInput && (
                                        <button
                                            onClick={() => onAccept(tasks)}
                                            className="flex-1 py-3 px-4 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                                        >
                                            <Check size={18} />
                                            Add Tasks
                                        </button>
                                    )}
                                </div>

                                <p className="text-xs text-slate-400 text-center mt-3">
                                    💡 Each task is designed to take just 5 minutes
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
