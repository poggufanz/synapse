"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles, Loader2, BookHeart, History, ArrowLeft, Trash2 } from "lucide-react";
import { addWellnessPoints } from "./GrowthGarden";

interface QuickJournalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode?: boolean;
}

interface JournalEntry {
    id: string;
    date: string;
    emotion: { emoji: string; label: string; color: string };
    trigger: string;
    aiResponse: string;
}

const EMOTION_OPTIONS = [
    { emoji: "😰", label: "Cemas", color: "from-yellow-500 to-orange-500" },
    { emoji: "😢", label: "Sedih", color: "from-blue-500 to-indigo-500" },
    { emoji: "😤", label: "Marah", color: "from-red-500 to-rose-500" },
    { emoji: "😔", label: "Kecewa", color: "from-purple-500 to-violet-500" },
    { emoji: "😩", label: "Lelah", color: "from-slate-500 to-gray-500" },
    { emoji: "😟", label: "Khawatir", color: "from-amber-500 to-yellow-500" },
];

const JOURNAL_HISTORY_KEY = "synapse-journal-history";

type JournalStep = "emotion" | "trigger" | "challenge" | "complete";

export default function QuickJournal({ isOpen, onClose, isDarkMode = true }: QuickJournalProps) {
    const [step, setStep] = useState<JournalStep>("emotion");
    const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTION_OPTIONS[0] | null>(null);
    const [trigger, setTrigger] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    // Load history from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(JOURNAL_HISTORY_KEY);
            if (saved) {
                setJournalHistory(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load journal history:", error);
        }
    }, []);

    // Save history to localStorage
    const saveEntry = (entry: JournalEntry) => {
        const updatedHistory = [entry, ...journalHistory].slice(0, 50); // Keep last 50 entries
        setJournalHistory(updatedHistory);
        try {
            localStorage.setItem(JOURNAL_HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save journal entry:", error);
        }
    };

    const deleteEntry = (id: string) => {
        const updatedHistory = journalHistory.filter(e => e.id !== id);
        setJournalHistory(updatedHistory);
        try {
            localStorage.setItem(JOURNAL_HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to delete journal entry:", error);
        }
        if (selectedEntry?.id === id) {
            setSelectedEntry(null);
        }
    };

    const resetJournal = () => {
        setStep("emotion");
        setSelectedEmotion(null);
        setTrigger("");
        setAiResponse("");
        setShowHistory(false);
        setSelectedEntry(null);
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

        let response;
        try {
            response = await fetch("/api/chat-burnout", {
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

    const handleComplete = () => {
        // Save entry to history
        if (selectedEmotion && trigger && aiResponse) {
            const entry: JournalEntry = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                emotion: selectedEmotion,
                trigger,
                aiResponse,
            };
            saveEntry(entry);
            // Award wellness points for completing journal
            addWellnessPoints("task", 2);
        }
        handleClose();
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
                                <h2 className="font-bold text-white text-lg">{showHistory ? "Riwayat Jurnal" : "Jurnal Kilat"}</h2>
                                <p className="text-xs text-white/50">{showHistory ? `${journalHistory.length} entri tersimpan` : "3 menit untuk refleksi"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!showHistory && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowHistory(true)}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                    title="Lihat Riwayat"
                                >
                                    <History size={20} />
                                </motion.button>
                            )}
                            {showHistory && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => { setShowHistory(false); setSelectedEntry(null); }}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                    title="Kembali"
                                >
                                    <ArrowLeft size={20} />
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClose}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Progress Steps - only show when not in history view */}
                    {!showHistory && (
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
                    )}

                    {/* Content */}
                    <div className="p-5 min-h-[300px] max-h-[60vh] overflow-y-auto">
                        {/* History View */}
                        {showHistory ? (
                            <div className="space-y-3">
                                {selectedEntry ? (
                                    // Selected Entry Detail
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <button
                                            onClick={() => setSelectedEntry(null)}
                                            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                                        >
                                            <ArrowLeft size={14} />
                                            Kembali ke daftar
                                        </button>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{selectedEntry.emotion.emoji}</span>
                                                <span className="text-white/70 font-medium">{selectedEntry.emotion.label}</span>
                                            </div>
                                            <p className="text-xs text-white/40 mb-3">
                                                {new Date(selectedEntry.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-sm text-white/60 italic mb-4">"{selectedEntry.trigger}"</p>
                                            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                <div className="flex items-start gap-2">
                                                    <Sparkles className="text-purple-400 shrink-0" size={16} />
                                                    <p className="text-white/80 text-sm leading-relaxed">{selectedEntry.aiResponse}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : journalHistory.length === 0 ? (
                                    // Empty State
                                    <div className="text-center py-12">
                                        <span className="text-4xl mb-4 block">📝</span>
                                        <p className="text-white/40">Belum ada jurnal tersimpan</p>
                                        <p className="text-white/30 text-sm mt-1">Mulai jurnal pertamamu!</p>
                                    </div>
                                ) : (
                                    // Entry List
                                    journalHistory.map((entry) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                            onClick={() => setSelectedEntry(entry)}
                                        >
                                            <span className="text-2xl">{entry.emotion.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white/70 font-medium text-sm truncate">{entry.trigger}</p>
                                                <p className="text-xs text-white/40">
                                                    {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                                                className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        ) : (
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
                                                onClick={handleComplete}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all"
                                            >
                                                <span>Selesai ✨</span>
                                            </motion.button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Footer Tip */}
                    <div className="px-5 py-4 border-t border-white/5 bg-white/[0.02]">
                        <p className="text-xs text-white/30 text-center italic">
                            💡 Menulis perasaan membantu otak memproses emosi lebih baik
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
}
