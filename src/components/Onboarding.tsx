"use client";

import { useState } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowRight, Check, Brain, Zap, Clock, Sparkles, Lightbulb, Coffee, Battery, Target, Smile } from "lucide-react";
import { toast } from "sonner";
import LoadingScreen from "./LoadingScreen";

const questions = [
    {
        id: 1,
        text: "When you have a big deadline, you usually...",
        options: [
            { text: "Plan every detail weeks ahead", trait: "Structured" },
            { text: "Wait for the adrenaline rush", trait: "Spontaneous" },
            { text: "Worry about it constantly", trait: "Anxious" },
        ],
    },
    {
        id: 2,
        text: "After a long day of work, you recharge by...",
        options: [
            { text: "Going out with friends", trait: "Extroverted" },
            { text: "Reading or gaming alone", trait: "Introverted" },
            { text: "Doing a creative hobby", trait: "Creative" },
        ],
    },
    {
        id: 3,
        text: "Your ideal workspace is...",
        options: [
            { text: "Perfectly organized and silent", trait: "Focused" },
            { text: "Busy coffee shop with noise", trait: "Adaptable" },
            { text: "Filled with sticky notes and chaos", trait: "Chaotic" },
        ],
    },
];

export default function Onboarding() {
    const setPersona = useEnergyStore((state) => state.setPersona);
    const [step, setStep] = useState(0); // 0: Name, 1-3: Questions
    const [name, setName] = useState("");
    const [answers, setAnswers] = useState<string[]>([]);
    const [isFinishing, setIsFinishing] = useState(false);

    const handleNext = (answer?: string) => {
        if (step === 0 && !name.trim()) return;

        if (answer) {
            setAnswers([...answers, answer]);
        }

        if (step < questions.length) {
            setStep(step + 1);
        } else {
            // Finish
            setIsFinishing(true);
            setTimeout(() => {
                const traits = [...answers, answer!].filter(Boolean);
                const type = determineType(traits);
                setPersona({ name, type, traits });
            }, 3000);
        }
    };

    const handleSkip = () => {
        setIsFinishing(true);
        setTimeout(() => {
            setPersona({ name: "Friend", type: "Action Taker", traits: [] });
        }, 2000);
    };

    const determineType = (traits: string[]) => {
        if (traits.includes("Anxious") || traits.includes("Introverted")) return "Sensitive Soul";
        if (traits.includes("Structured") || traits.includes("Focused")) return "Deep Thinker";
        return "Action Taker";
    };

    if (isFinishing) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                {/* Gradient Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

                {/* Floating Productivity Icons */}
                <div className="absolute top-[15%] left-[10%] opacity-20 animate-float">
                    <Brain className="text-blue-400 w-12 h-12 rotate-12" />
                </div>
                <div className="absolute top-[20%] right-[15%] opacity-20 animate-float animation-delay-2000">
                    <Zap className="text-yellow-400 w-10 h-10 -rotate-12" />
                </div>
                <div className="absolute bottom-[20%] left-[15%] opacity-20 animate-float animation-delay-4000">
                    <Clock className="text-purple-400 w-14 h-14 rotate-6" />
                </div>
                <div className="absolute bottom-[30%] right-[10%] opacity-20 animate-float">
                    <Lightbulb className="text-orange-400 w-12 h-12 -rotate-6" />
                </div>
                <div className="absolute top-[40%] left-[5%] opacity-15 animate-float animation-delay-1000">
                    <Sparkles className="text-cyan-400 w-8 h-8" />
                </div>
                <div className="absolute bottom-[10%] left-[40%] opacity-15 animate-float animation-delay-3000">
                    <Coffee className="text-amber-500 w-10 h-10 rotate-12" />
                </div>
                <div className="absolute top-[10%] right-[30%] opacity-15 animate-float animation-delay-1500">
                    <Battery className="text-green-400 w-10 h-10 -rotate-45" />
                </div>
                <div className="absolute bottom-[40%] left-[5%] opacity-15 animate-float animation-delay-2500">
                    <Target className="text-red-400 w-12 h-12" />
                </div>
                <div className="absolute top-[50%] right-[5%] opacity-15 animate-float animation-delay-500">
                    <Smile className="text-pink-400 w-9 h-9 rotate-12" />
                </div>
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-blue-600" : "bg-slate-100"
                                }`}
                        />
                    ))}
                </div>

                <div className="text-center animate-fadeIn">
                    {step === 0 && (
                        <>
                            <div className="mb-8 relative w-48 h-48 mx-auto animate-float">
                                {/* Logo Glow */}
                                <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-3xl transform scale-110 translate-y-4" />
                                
                                {/* Floating Particles */}
                                <div className="absolute -top-4 -right-4 w-6 h-6 bg-yellow-300 rounded-full blur-sm animate-bounce delay-700 opacity-60" />
                                <div className="absolute top-1/2 -left-8 w-4 h-4 bg-blue-400 rounded-full blur-sm animate-pulse delay-1000 opacity-60" />
                                
                                <img 
                                    src="/images/logo.png" 
                                    alt="Synapse Logo" 
                                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                                />
                            </div>
                            <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Welcome to Synapse</h1>
                            <p className="text-slate-500 text-lg mb-8 font-medium">Let's get to know you. What should we call you?</p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl px-6 py-4 text-xl text-center font-bold text-slate-800 placeholder-slate-300 focus:outline-none transition-all mb-4"
                                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                            />

                            {/* Privacy Notice */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs text-slate-600 text-center leading-relaxed">
                                    <span className="font-bold text-blue-600">🔒 Your Privacy Matters</span>
                                    <br />
                                    Your data is used ONLY for AI personalization. Never shared or sold.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    if (!name.trim()) {
                                        toast.error("Please tell us your name first!");
                                        return;
                                    }
                                    handleNext();
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mb-3"
                            >
                                Continue <ArrowRight size={20} />
                            </button>

                            {/* Skip Button */}
                            <button
                                onClick={handleSkip}
                                className="w-full text-slate-400 hover:text-slate-600 font-medium py-2 transition-colors text-sm"
                            >
                                Skip for Now
                            </button>
                        </>
                    )}

                    {step > 0 && step <= questions.length && (
                        <>
                            <h2 className="text-3xl font-black text-slate-800 mb-12 leading-tight">
                                {questions[step - 1].text}
                            </h2>
                            <div className="space-y-4">
                                {questions[step - 1].options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleNext(opt.trait)}
                                        className="w-full bg-white border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold py-5 px-6 rounded-2xl transition-all duration-200 text-left flex items-center justify-between group shadow-sm hover:shadow-md"
                                    >
                                        {opt.text}
                                        <Check className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
