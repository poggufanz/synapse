"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import GrowthGarden from "./GrowthGarden";

interface GrowthGardenModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}

export default function GrowthGardenModal({ isOpen, onClose, isDarkMode }: GrowthGardenModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-4 sm:inset-8 lg:inset-16 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div
                            className="relative w-full max-w-2xl max-h-full overflow-hidden rounded-[2rem] pointer-events-auto"
                            style={{
                                backgroundColor: isDarkMode ? '#1a2e1a' : '#E0F2F7',
                                boxShadow: isDarkMode
                                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'}`
                            }}
                        >
                            {/* Decorative gradients */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-green-900/20' : 'from-[#E1F6FF]/50'} to-transparent pointer-events-none`} />
                            <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-orange-500/10' : 'bg-[#FFE0B3]/50'}`} />
                            <div className={`absolute -left-20 bottom-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-green-500/10' : 'bg-[#E3EBE6]/50'}`} />

                            {/* Header */}
                            <div className="relative z-10 flex items-center justify-between p-6 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                                <div>
                                    <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-[#70BBE8]'}`}>
                                        Your Resilience Journey
                                    </p>
                                    <h2 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                                        Growth Garden
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${isDarkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-black/5 text-stone-600 hover:bg-black/10'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 p-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                                <GrowthGarden isDarkMode={isDarkMode} compact={false} previewOnly={false} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
