"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles, Loader2, Mic, History, ArrowLeft, Trash2 } from "lucide-react";
import { addWellnessPoints } from "./GrowthGarden";

interface QuickJournalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode?: boolean;
}

interface JournalEntry {
    id: string;
    date: string;
    emotion: { emoji: string; label: string; icon: string };
    trigger: string;
    aiResponse: string;
}

const EMOTION_OPTIONS = [
    { emoji: "😐", label: "Neutral", icon: "sentiment_neutral" },
    { emoji: "😰", label: "Anxious", icon: "sentiment_worried" },
    { emoji: "😴", label: "Tired", icon: "battery_alert" },
    { emoji: "🌤️", label: "Hopeful", icon: "wb_sunny" },
    { emoji: "⚡", label: "Energized", icon: "battery_charging_full" },
    { emoji: "😢", label: "Sad", icon: "sentiment_sad" },
];

const JOURNAL_HISTORY_KEY = "synapse-journal-history";

type JournalStep = "emotion" | "trigger" | "challenge" | "complete";

export default function QuickJournal({ isOpen, onClose, isDarkMode = false }: QuickJournalProps) {
    const [step, setStep] = useState<JournalStep>("emotion");
    const [selectedEmotion, setSelectedEmotion] = useState<typeof EMOTION_OPTIONS[0] | null>(null);
    const [trigger, setTrigger] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    // Load history
    useEffect(() => {
        try {
            const saved = localStorage.getItem(JOURNAL_HISTORY_KEY);
            if (saved) setJournalHistory(JSON.parse(saved));
        } catch (error) {
            console.error("Failed to load journal history:", error);
        }
    }, []);

    const saveEntry = (entry: JournalEntry) => {
        const updatedHistory = [entry, ...journalHistory].slice(0, 50);
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
        if (selectedEntry?.id === id) setSelectedEntry(null);
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

        try {
            const response = await fetch("/api/chat-burnout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{
                        role: "user",
                        content: `Saya sedang merasa ${selectedEmotion.label.toLowerCase()} karena: "${trigger}". 
                        Tolong bantu saya dengan pendekatan CBT (Cognitive Behavioral Therapy). 
                        Ajukan satu pertanyaan reflektif yang membantu saya menantang pikiran negatif ini.
                        Balas dengan hangat dan singkat (2-3 kalimat saja).`
                    }],
                    persona: "gentle"
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiResponse(data.message);
            } else {
                setAiResponse("Tidak apa-apa merasa seperti itu. Coba tanyakan pada dirimu: apakah ada bukti nyata yang mendukung pikiran ini? Atau mungkin ada sudut pandang lain yang belum kamu pertimbangkan?");
            }
        } catch {
            setAiResponse("Tidak apa-apa merasa seperti itu. Coba tanyakan pada dirimu: apakah ada bukti nyata yang mendukung pikiran ini?");
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = () => {
        if (selectedEmotion && trigger && aiResponse) {
            saveEntry({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                emotion: selectedEmotion,
                trigger,
                aiResponse,
            });
            addWellnessPoints("task", 2);
        }
        handleClose();
    };

    if (!isOpen) return null;

    const bgColor = isDarkMode ? '#23180f' : '#f8f7f5';
    const textColor = isDarkMode ? '#e0dcd9' : '#1c140d';
    const textSecondary = isDarkMode ? 'rgba(224,220,217,0.6)' : '#9e7047';
    const primaryColor = '#e56e06';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col"
                style={{
                    fontFamily: "'Nunito', sans-serif",
                    backgroundColor: bgColor
                }}
            >
                {/* Ambient Background */}
                <div
                    className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        background: isDarkMode
                            ? 'none'
                            : 'radial-gradient(circle at 50% 10%, rgba(229, 110, 6, 0.15) 0%, transparent 50%)'
                    }}
                />

                {/* Header */}
                <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-40">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center p-2 rounded-xl size-10"
                            style={{
                                backgroundColor: bgColor,
                                boxShadow: isDarkMode
                                    ? '8px 8px 16px #1a120b, -8px -8px 16px #2c1e13'
                                    : '8px 8px 16px #dcdad7, -8px -8px 16px #ffffff',
                                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)',
                                color: primaryColor
                            }}
                        >
                            <span className="text-xl">🌿</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight" style={{ color: isDarkMode ? 'white' : textColor }}>
                            Synapse
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {!showHistory && (
                            <button
                                onClick={() => setShowHistory(true)}
                                className="flex items-center justify-center rounded-full size-12 transition-all duration-300 hover:-translate-y-0.5"
                                style={{
                                    backgroundColor: bgColor,
                                    boxShadow: isDarkMode
                                        ? '6px 6px 12px #1a120b, -6px -6px 12px #2c1e13'
                                        : '6px 6px 12px #dcdad7, -6px -6px 12px #ffffff',
                                    border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)',
                                    color: textSecondary
                                }}
                            >
                                <History size={20} />
                            </button>
                        )}
                        {showHistory && (
                            <button
                                onClick={() => { setShowHistory(false); setSelectedEntry(null); }}
                                className="flex items-center justify-center rounded-full size-12 transition-all duration-300 hover:-translate-y-0.5"
                                style={{
                                    backgroundColor: bgColor,
                                    boxShadow: isDarkMode
                                        ? '6px 6px 12px #1a120b, -6px -6px 12px #2c1e13'
                                        : '6px 6px 12px #dcdad7, -6px -6px 12px #ffffff',
                                    border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)',
                                    color: textSecondary
                                }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            className="group flex items-center justify-center rounded-full size-12 transition-all duration-300 hover:-translate-y-0.5"
                            style={{
                                backgroundColor: bgColor,
                                boxShadow: isDarkMode
                                    ? '6px 6px 12px #1a120b, -6px -6px 12px #2c1e13'
                                    : '6px 6px 12px #dcdad7, -6px -6px 12px #ffffff',
                                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)',
                                color: textSecondary
                            }}
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
                    <div className="w-full max-w-[640px] flex flex-col gap-8">
                        {showHistory ? (
                            // History View
                            <div className="space-y-4">
                                <h1 className="text-3xl font-bold text-center" style={{ color: isDarkMode ? 'white' : textColor }}>
                                    Journal History
                                </h1>
                                {selectedEntry ? (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                        <button onClick={() => setSelectedEntry(null)} className="flex items-center gap-2 text-sm" style={{ color: textSecondary }}>
                                            <ArrowLeft size={14} /> Back to list
                                        </button>
                                        <div
                                            className="p-6 rounded-2xl"
                                            style={{
                                                backgroundColor: bgColor,
                                                boxShadow: isDarkMode
                                                    ? '8px 8px 16px #1a120b, -8px -8px 16px #2c1e13'
                                                    : '8px 8px 16px #dcdad7, -8px -8px 16px #ffffff',
                                                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)'
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{selectedEntry.emotion.emoji}</span>
                                                <span style={{ color: textSecondary }}>{selectedEntry.emotion.label}</span>
                                            </div>
                                            <p className="text-xs mb-3" style={{ color: textSecondary }}>
                                                {new Date(selectedEntry.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            <p className="text-sm italic mb-4" style={{ color: textSecondary }}>"{selectedEntry.trigger}"</p>
                                            <div
                                                className="p-4 rounded-xl"
                                                style={{
                                                    backgroundColor: isDarkMode ? 'rgba(229, 110, 6, 0.1)' : 'rgba(229, 110, 6, 0.05)',
                                                    border: `1px solid ${primaryColor}20`
                                                }}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <Sparkles style={{ color: primaryColor }} size={16} className="shrink-0 mt-1" />
                                                    <p className="text-sm leading-relaxed" style={{ color: textColor }}>{selectedEntry.aiResponse}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : journalHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <span className="text-4xl mb-4 block">📝</span>
                                        <p style={{ color: textSecondary }}>No journal entries yet</p>
                                    </div>
                                ) : (
                                    journalHistory.map((entry) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5"
                                            style={{
                                                backgroundColor: bgColor,
                                                boxShadow: isDarkMode
                                                    ? '6px 6px 12px #1a120b, -6px -6px 12px #2c1e13'
                                                    : '6px 6px 12px #dcdad7, -6px -6px 12px #ffffff',
                                                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)'
                                            }}
                                            onClick={() => setSelectedEntry(entry)}
                                        >
                                            <span className="text-2xl">{entry.emotion.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate" style={{ color: textColor }}>{entry.trigger}</p>
                                                <p className="text-xs" style={{ color: textSecondary }}>
                                                    {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                                                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                style={{ color: '#ef4444' }}
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
                                    <motion.div key="emotion" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                        <div className="text-center space-y-2">
                                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight" style={{ color: isDarkMode ? 'white' : textColor }}>
                                                Breathe. <span style={{ color: primaryColor }}>Reflect.</span>
                                            </h1>
                                            <p className="text-lg font-medium" style={{ color: textSecondary }}>
                                                What's on your mind right now?
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-4 py-4">
                                            {EMOTION_OPTIONS.map((emotion) => (
                                                <button
                                                    key={emotion.label}
                                                    onClick={() => handleEmotionSelect(emotion)}
                                                    className="flex items-center gap-2 px-6 h-12 rounded-full font-medium transition-all hover:-translate-y-0.5"
                                                    style={{
                                                        backgroundColor: bgColor,
                                                        boxShadow: isDarkMode
                                                            ? '6px 6px 12px #1a120b, -6px -6px 12px #2c1e13'
                                                            : '6px 6px 12px #dcdad7, -6px -6px 12px #ffffff',
                                                        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)',
                                                        color: textSecondary
                                                    }}
                                                >
                                                    <span className="text-xl">{emotion.emoji}</span>
                                                    <span>{emotion.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Trigger Input */}
                                {step === "trigger" && (
                                    <motion.div key="trigger" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                        <div className="text-center space-y-4">
                                            <button
                                                onClick={() => setStep("emotion")}
                                                className="flex items-center gap-2 px-6 h-12 rounded-full mx-auto"
                                                style={{
                                                    backgroundColor: bgColor,
                                                    boxShadow: isDarkMode
                                                        ? 'inset 6px 6px 12px #1a120b, inset -6px -6px 12px #2c1e13'
                                                        : 'inset 6px 6px 12px #dcdad7, inset -6px -6px 12px #ffffff',
                                                    color: primaryColor,
                                                    border: `1px solid ${primaryColor}20`
                                                }}
                                            >
                                                <span className="text-xl">{selectedEmotion?.emoji}</span>
                                                <span className="font-bold">{selectedEmotion?.label}</span>
                                            </button>
                                            <h2 className="text-2xl font-bold" style={{ color: isDarkMode ? 'white' : textColor }}>
                                                What triggered this feeling?
                                            </h2>
                                        </div>

                                        <div
                                            className="p-6 rounded-[2rem] relative overflow-hidden"
                                            style={{
                                                backgroundColor: bgColor,
                                                boxShadow: isDarkMode
                                                    ? '8px 8px 16px #1a120b, -8px -8px 16px #2c1e13'
                                                    : '8px 8px 16px #dcdad7, -8px -8px 16px #ffffff',
                                                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)'
                                            }}
                                        >
                                            <div
                                                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                                                style={{ backgroundColor: `${primaryColor}10` }}
                                            />
                                            <div className="relative">
                                                <textarea
                                                    value={trigger}
                                                    onChange={(e) => setTrigger(e.target.value)}
                                                    placeholder="Just a few words... Let it flow naturally."
                                                    className="w-full min-h-[200px] rounded-2xl p-6 text-lg resize-none leading-relaxed tracking-wide border-none focus:ring-0 focus:outline-none"
                                                    style={{
                                                        backgroundColor: bgColor,
                                                        boxShadow: isDarkMode
                                                            ? 'inset 6px 6px 12px #1a120b, inset -6px -6px 12px #2c1e13'
                                                            : 'inset 6px 6px 12px #dcdad7, inset -6px -6px 12px #ffffff',
                                                        color: textColor
                                                    }}
                                                    autoFocus
                                                />
                                                <div className="absolute bottom-4 right-4">
                                                    <button className="p-2 rounded-full transition-colors" style={{ color: textSecondary }}>
                                                        <Mic size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <button
                                                onClick={handleTriggerSubmit}
                                                disabled={!trigger.trim()}
                                                className={`relative overflow-hidden rounded-full h-16 w-full max-w-[280px] flex items-center justify-center gap-3 text-lg font-bold tracking-wide transition-all hover:-translate-y-0.5 ${!trigger.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                style={{
                                                    background: `linear-gradient(to right, ${primaryColor}, #ff9e4d)`,
                                                    color: 'white',
                                                    boxShadow: `6px 6px 12px rgba(229,110,6,0.3), -6px -6px 12px #ffffff`
                                                }}
                                            >
                                                <span>Save Reflection</span>
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: AI Challenge */}
                                {step === "challenge" && (
                                    <motion.div key="challenge" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                        <div className="text-center">
                                            <div
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                                                style={{ backgroundColor: `${primaryColor}15`, border: `1px solid ${primaryColor}30` }}
                                            >
                                                <Sparkles style={{ color: primaryColor }} size={20} />
                                                <span style={{ color: primaryColor }} className="font-medium">Cognitive Challenge</span>
                                            </div>
                                        </div>

                                        <div
                                            className="p-5 rounded-2xl"
                                            style={{
                                                backgroundColor: bgColor,
                                                boxShadow: isDarkMode
                                                    ? '8px 8px 16px #1a120b, -8px -8px 16px #2c1e13'
                                                    : '8px 8px 16px #dcdad7, -8px -8px 16px #ffffff',
                                                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)'
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{selectedEmotion?.emoji}</span>
                                                <span className="font-medium" style={{ color: textSecondary }}>{selectedEmotion?.label}</span>
                                            </div>
                                            <p className="text-sm italic" style={{ color: textSecondary }}>"{trigger}"</p>
                                        </div>

                                        <div
                                            className="p-6 rounded-2xl"
                                            style={{
                                                backgroundColor: `${primaryColor}08`,
                                                border: `1px solid ${primaryColor}20`
                                            }}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center gap-3 py-8">
                                                    <Loader2 className="animate-spin" style={{ color: primaryColor }} size={24} />
                                                    <span style={{ color: textSecondary }}>Preparing reflection...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
                                                        <Sparkles style={{ color: primaryColor }} size={16} />
                                                    </div>
                                                    <p className="text-sm leading-relaxed" style={{ color: textColor }}>{aiResponse}</p>
                                                </div>
                                            )}
                                        </div>

                                        {!isLoading && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={handleComplete}
                                                className="w-full h-16 rounded-full flex items-center justify-center gap-2 text-lg font-bold transition-all hover:-translate-y-0.5"
                                                style={{
                                                    background: 'linear-gradient(to right, #22c55e, #10b981)',
                                                    color: 'white',
                                                    boxShadow: '6px 6px 12px rgba(34,197,94,0.3), -6px -6px 12px #ffffff'
                                                }}
                                            >
                                                <span>Complete ✨</span>
                                            </motion.button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 py-6 text-center">
                    <a className="text-sm flex items-center justify-center gap-1 transition-colors" href="#" style={{ color: `${textSecondary}70` }}>
                        <span>💡</span>
                        Writing helps your brain process emotions better
                    </a>
                </footer>
            </motion.div>
        </AnimatePresence>
    );
}
