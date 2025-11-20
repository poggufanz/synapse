"use client";

import { useState } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowRight, Brain, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
    const setPersona = useEnergyStore((state) => state.setPersona);
    const [step, setStep] = useState<"login" | "test" | "complete">("login");
    const [name, setName] = useState("");

    // Psychology Test State
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const questions = [
        {
            id: 1,
            question: "When you're stressed, what helps you most?",
            options: [
                { label: "Venting to a friend", value: "social" },
                { label: "Being alone & quiet", value: "solitary" },
                { label: "Solving the problem immediately", value: "action" },
            ],
        },
        {
            id: 2,
            question: "How do you prefer to learn new things?",
            options: [
                { label: "Deep dive into theory first", value: "theoretical" },
                { label: "Just start doing it (Trial & Error)", value: "practical" },
                { label: "Having someone explain it to me", value: "social" },
            ],
        },
        {
            id: 3,
            question: "What's your biggest productivity blocker?",
            options: [
                { label: "Overthinking / Perfectionism", value: "perfectionist" },
                { label: "Low Energy / Burnout", value: "burnout_prone" },
                { label: "Distractions / Procrastination", value: "distracted" },
            ],
        },
    ];

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setStep("test");
    };

    const handleAnswer = (value: string) => {
        setAnswers((prev) => ({ ...prev, [questions[currentQuestion].id]: value }));

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        } else {
            finishTest();
        }
    };

    const finishTest = () => {
        // Simple logic to determine persona based on answers
        // In a real app, this would be more complex
        const traits = Object.values(answers);
        let personaType = "Balanced Explorer";

        if (traits.includes("burnout_prone")) personaType = "Sensitive Soul";
        if (traits.includes("action") && traits.includes("practical")) personaType = "Action Taker";
        if (traits.includes("perfectionist") || traits.includes("theoretical")) personaType = "Deep Thinker";

        setPersona({ name, type: personaType, traits });
        toast.success(`Welcome, ${name}! Your persona: ${personaType}`);
        setStep("complete");
    };

    if (step === "login") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                            <Brain className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Synapse</h1>
                        <p className="text-slate-400">Your adaptive mental companion.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">What should we call you?</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="Enter your name"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full btn-primary flex items-center justify-center gap-2"
                        >
                            Get Started <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (step === "test") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <div className="max-w-lg w-full bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn">
                    <div className="mb-8">
                        <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                            <span>Psychology Check</span>
                            <span>{currentQuestion + 1} / {questions.length}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
                                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
                        {questions[currentQuestion].question}
                    </h2>

                    <div className="space-y-3">
                        {questions[currentQuestion].options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(option.value)}
                                className="w-full text-left p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all duration-200 group"
                            >
                                <span className="text-slate-200 group-hover:text-white transition-colors">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null; // Should trigger parent state change
}
