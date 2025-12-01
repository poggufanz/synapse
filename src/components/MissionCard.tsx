"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";

interface MissionCardProps {
    action: string;
    summary: string;
    energy: "Deep Work" | "Shallow Work" | "Recovery";
    source: string;
    isCompleted: boolean;
    onToggle: () => void;
}

export default function MissionCard({
    action,
    summary,
    energy,
    source,
    isCompleted,
    onToggle,
}: MissionCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getEnergyColor = (tag: string) => {
        switch (tag) {
            case "Deep Work":
                return "bg-red-50 text-red-600 border-red-100";
            case "Shallow Work":
                return "bg-blue-50 text-blue-600 border-blue-100";
            case "Recovery":
                return "bg-green-50 text-green-600 border-green-100";
            default:
                return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    return (
        <div
            className={`bg-white border-2 rounded-3xl transition-all duration-300 overflow-hidden ${isCompleted
                ? "border-slate-100 opacity-60"
                : "border-slate-100 hover:border-blue-200 shadow-soft-blue hover:shadow-md"
                }`}
        >
            {/* Header (Always Visible) */}
            <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className="shrink-0 text-slate-200 hover:text-blue-500 transition-colors"
                >
                    {isCompleted ? (
                        <CheckCircle2 className="text-blue-500 w-8 h-8" />
                    ) : (
                        <Circle className="w-8 h-8" />
                    )}
                </button>

                <div className="flex-1">
                    <h3
                        className={`font-bold text-lg transition-all ${isCompleted ? "text-slate-400 line-through" : "text-slate-800"
                            }`}
                    >
                        {action}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider ${getEnergyColor(
                            energy
                        )}`}
                    >
                        {energy}
                    </span>
                    <button className="text-slate-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-0 animate-slideDown">
                    <div className="pl-10 pr-2">
                        <p className="text-slate-600 text-sm leading-relaxed mb-3 font-medium">
                            {summary}
                        </p>
                        <div className="flex justify-end">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                Source: {source}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
