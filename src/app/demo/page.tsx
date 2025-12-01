"use client";

import DailyTaskListWithSamples from "@/components/DailyTaskListWithSamples";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            {/* Back Button */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-8 transition-colors"
            >
                <ArrowLeft size={18} />
                Back to Home
            </Link>

            {/* Demo Container */}
            <div className="max-w-5xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-black text-slate-800 mb-3">
                        Daily Task List Demo
                    </h1>
                    <p className="text-slate-500 text-xl font-medium">
                        Notion-inspired simplicity meets Synapse's soft UI design
                    </p>
                </div>

                <DailyTaskListWithSamples showSamples={true} />

                {/* Design Notes */}
                <div className="mt-16 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-800 mb-4">
                        🎨 Design Features
                    </h3>
                    <ul className="space-y-3 text-slate-600 font-medium">
                        <li className="flex items-start gap-3">
                            <span className="text-2xl">✨</span>
                            <div>
                                <strong>Borderless Input:</strong> Clean, Notion-style text input with bottom border that highlights on focus
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <strong>Round Checkboxes:</strong> Circular instead of square, with bounce animation on completion
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-2xl">👆</span>
                            <div>
                                <strong>Hover-Reveal UI:</strong> Drag handle and delete button only appear on hover (reduced visual clutter)
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-2xl">🏷️</span>
                            <div>
                                <strong>Pastel Tags:</strong> Soft color pills for categorization (Work, Health, Personal, Learning)
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-2xl">🎵</span>
                            <div>
                                <strong>Juicy Feedback:</strong> Sound effects, toast notifications, and scale animations on interactions
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-2xl">☕</span>
                            <div>
                                <strong>Friendly Empty State:</strong> Encouraging message with animated emoji mascot
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
