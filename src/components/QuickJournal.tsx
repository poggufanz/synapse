"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles, Loader2, BookHeart } from "lucide-react";

interface QuickJournalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode?: boolean;
}

const EMOTION_OPTIONS = [
    { emoji: "😰", label: "Cemas", color: "from-yellow-500 to-orange-500" },
    { emoji: "😢", label: "Sedih", color: "from-blue-500 to-indigo-500" },
    { emoji: "😤", label: "Marah", color: "from-red-500 to-rose-500" },
    { emoji: "😔", label: "Kecewa", color: "from-purple-500 to-violet-500" },
    { emoji: "😩", label: "Lelah", color: "from-slate-500 to-gray-500" },
    { emoji: "😟", label: "Khawatir", color: "from-amber-500 to-yellow-500" },
];

type JournalStep = "emotion" | "trigger" | "challenge" | "complete";

export default function QuickJournal({ isOpen, onClose, isDarkMode = true }: QuickJournalProps) {
    const [step, setStep] = useState<JournalStep>("emotion");
    const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTION_OPTIONS[0] | null>(null);
    const [trigger, setTrigger] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState("");

    const resetJournal = () => {
        setStep("emotion");
        setSelectedEmotion(null);
        setTrigger("");
        setAiResponse("");
    };

    const handleClose = () => {
        resetJournal();
        onClose();
    };

    const handleEmotionSelect = (emotion: typeof EMOTION_OPTIONS[0]) => {
        setSelectedEmotion(emotion);
        setStep("trigger");
    };

    const handleTriggerSubmit = async () => {
        if (!trigger.trim() || !selectedEmotion) return;

        setStep("challenge");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat-burnout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "user",
                            content: `Saya sedang merasa ${selectedEmotion.label.toLowerCase()} karena: "${trigger}". 
                            
                            Tolong bantu saya dengan pendekatan CBT (Cognitive Behavioral Therapy). 
                            Ajukan satu pertanyaan reflektif yang membantu saya menantang pikiran negatif ini.
                            Fokus pada: apakah ada bukti nyata untuk pikiran ini? Atau ada cara pandang lain?
                            
                            Balas dengan hangat dan singkat (2-3 kalimat saja).`
                        }
                    ],
                    persona: "gentle"
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiResponse(data.message);
            } else {
                setAiResponse("Tidak apa-apa merasa seperti itu. Coba tanyakan pada dirimu: apakah ada bukti nyata yang mendukung pikiran ini? Atau mungkin ada sudut pandang lain yang belum kamu pertimbangkan?");
            }
        } catch (error) {
            setAiResponse("Tidak apa-apa merasa seperti itu. Coba tanyakan pada dirimu: apakah ada bukti nyata yang mendukung pikiran ini? Atau mungkin ada sudut pandang lain yang belum kamu pertimbangkan?");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-md bg-gradient-to-br from-[#1a1a2e] via-[#1f1f3a] to-[#2a1f4e] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/20">
                                <BookHeart className="text-white" size={22} />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg">Jurnal Kilat</h2>
                                <p className="text-xs text-white/50">3 menit untuk refleksi</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleClose}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </motion.button>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-5 py-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            {["emotion", "trigger", "challenge"].map((s, i) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s
                                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                            : ["trigger", "challenge", "complete"].indexOf(step) > i
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-white/10 text-white/40"
                                        }`}>
                                        {["trigger", "challenge", "complete"].indexOf(step) > i ? "✓" : i + 1}
                                    </div>
                                    {i < 2 && <div className={`w-8 h-0.5 ${["trigger", "challenge", "complete"].indexOf(step) > i ? "bg-green-500/40" : "bg-white/10"}`} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Emotion Selection */}
                            {step === "emotion" && (
                                <motion.div
                                    key="emotion"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-white mb-2">Apa yang kamu rasakan?</h3>
                                        <p className="text-sm text-white/50">Pilih emosi yang paling menggambarkan perasaanmu</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {EMOTION_OPTIONS.map((emotion) => (
                                            <motion.button
                                                key={emotion.label}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleEmotionSelect(emotion)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all`}
                                            >
                                                <span className="text-4xl">{emotion.emoji}</span>
                                                <span className="text-xs text-white/70">{emotion.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Trigger Input */}
                            {step === "trigger" && (
                                <motion.div
                                    key="trigger"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                                            <span className="text-2xl">{selectedEmotion?.emoji}</span>
                                            <span className="text-white/70">{selectedEmotion?.label}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Apa pemicunya?</h3>
                                        <p className="text-sm text-white/50">Tulis singkat apa yang membuatmu merasa seperti ini</p>
                                    </div>

                                    <textarea
                                        value={trigger}
                                        onChange={(e) => setTrigger(e.target.value)}
                                        placeholder="Contoh: Deadline kerja yang menumpuk..."
                                        className="w-full h-32 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all"
                                        autoFocus
                                    />

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleTriggerSubmit}
                                        disabled={!trigger.trim()}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all ${trigger.trim()
                                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                                                : "bg-white/10 text-white/30 cursor-not-allowed"
                                            }`}
                                    >
                                        <span>Lanjut ke Refleksi</span>
                                        <ChevronRight size={18} />
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Step 3: AI Challenge */}
                            {step === "challenge" && (
                                <motion.div
                                    key="challenge"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                                            <Sparkles className="text-purple-400" size={20} />
                                            <span className="text-purple-300 font-medium">Tantangan Kognitif</span>
                                        </div>
                                    </div>

                                    {/* User's emotion and trigger summary */}
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{selectedEmotion?.emoji}</span>
                                            <span className="text-white/70 font-medium">{selectedEmotion?.label}</span>
                                        </div>
                                        <p className="text-sm text-white/50 italic">"{trigger}"</p>
                                    </div>

                                    {/* AI Response */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-3 py-8">
                                                <Loader2 className="animate-spin text-purple-400" size={24} />
                                                <span className="text-white/60">Menyiapkan refleksi...</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-purple-500/20 rounded-xl shrink-0">
                                                        <Sparkles className="text-purple-400" size={16} />
                                                    </div>
                                                    <p className="text-white/80 text-sm leading-relaxed">{aiResponse}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {!isLoading && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleClose}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all"
                                        >
                                            <span>Selesai ✨</span>
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Tip */}
                    <div className="px-5 py-4 border-t border-white/5 bg-white/[0.02]">
                        <p className="text-xs text-white/30 text-center italic">
                            💡 Menulis perasaan membantu otak memproses emosi lebih baik
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
