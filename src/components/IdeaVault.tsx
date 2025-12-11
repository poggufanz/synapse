"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function IdeaVault() {
    const [isOpen, setIsOpen] = useState(false);
    const [idea, setIdea] = useState("");
    const [ideas, setIdeas] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showSparkles, setShowSparkles] = useState(false);

    // Lampu menyala jika sudah ada ide tersimpan
    const isLit = ideas.length > 0;

    const handleOpen = () => {
        setIsOpen(true);
        // Delay modal muncul agar animasi lampu jatuh selesai dulu
        setTimeout(() => setShowModal(true), 800);
    };

    const handleClose = () => {
        setShowModal(false);
        setTimeout(() => setIsOpen(false), 300);
    };

    const handleSave = () => {
        if (!idea.trim()) return;
        setIdeas((prev) => [idea, ...prev]);
        setIdea("");

        // Trigger sparkle animation - durasi lebih lama
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 1500);

        toast.success("Idea locked in the vault! 🔒");
    };

    // Sparkle positions around the modal
    const sparklePositions = [
        { x: -50, y: -30, delay: 0 },
        { x: 50, y: -40, delay: 0.1 },
        { x: -60, y: 40, delay: 0.15 },
        { x: 55, y: 50, delay: 0.05 },
        { x: -40, y: 80, delay: 0.2 },
        { x: 45, y: 90, delay: 0.12 },
        { x: 0, y: -50, delay: 0.08 },
        { x: -55, y: 5, delay: 0.18 },
        { x: 60, y: 0, delay: 0.07 },
    ];

    return (
        <>
            {/* Trigger Button - hanya muncul saat tidak open */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleOpen}
                        className={`fixed bottom-8 right-8 p-4 rounded-full shadow-lg transition-all hover:scale-110 z-40 group border-b-4 active:border-b-0 active:translate-y-1 ${isLit
                            ? "bg-yellow-300 text-yellow-900 border-yellow-500 shadow-[0_0_30px_rgba(253,224,71,0.8)] animate-pulse"
                            : "bg-slate-300 hover:bg-slate-200 text-slate-600 border-slate-400 hover:shadow-slate-200"
                            }`}
                    >
                        {/* Lightbulb icon pointing up for button */}
                        <svg width="32" height="32" viewBox="0 0 24 24" fill={isLit ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                            <path d="M9 18h6" />
                            <path d="M10 22h4" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Lampu jatuh dengan tali */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                            onClick={handleClose}
                        />

                        {/* Container lampu + modal - centered */}
                        <div className="relative flex flex-col items-center z-10 mt-8">
                            {/* Tali + Lampu dengan efek swing */}
                            <motion.div
                                initial={{ y: -150 }}
                                animate={{
                                    y: 0,
                                    rotate: [0, 8, -6, 4, -2, 0], // Efek berayun
                                }}
                                exit={{ y: -150 }}
                                transition={{
                                    y: { duration: 0.5, ease: "easeOut" },
                                    rotate: {
                                        duration: 1.5,
                                        ease: "easeInOut",
                                        times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                                    }
                                }}
                                className="flex flex-col items-center origin-top"
                            >
                                {/* Tali */}
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-[3px] h-16 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full origin-top"
                                />

                                {/* Fitting / Socket lampu */}
                                <div className="w-6 h-4 bg-slate-500 rounded-b-lg -mt-0.5" />
                                <div className="w-5 h-1 bg-slate-600 rounded-sm -mt-0.5" />

                                {/* Lampu pijar - KEBALIK (bola menghadap bawah) */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="relative"
                                >
                                    {/* Glow effect */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{
                                            opacity: [0, 0.9, 0.7],
                                            scale: [0.5, 1.3, 1.1]
                                        }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                        className="absolute -inset-6 bg-yellow-300 rounded-full blur-2xl -z-10"
                                    />

                                    {/* Bola Lampu - menghadap ke bawah */}
                                    <motion.div
                                        animate={{
                                            filter: ["brightness(0.6)", "brightness(1.2)", "brightness(1)"]
                                        }}
                                        transition={{ delay: 0.5, duration: 0.4 }}
                                        className="w-16 h-20 relative"
                                    >
                                        {/* Glass bulb */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-100 via-yellow-200 to-yellow-400 rounded-full border-4 border-yellow-400 shadow-lg"
                                            style={{ borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%" }}
                                        />
                                        {/* Filament glow */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0, 1, 0.8] }}
                                            transition={{ delay: 0.6, duration: 0.3 }}
                                            className="absolute inset-4 flex items-center justify-center"
                                        >
                                            <div className="w-4 h-6 bg-yellow-500 rounded-full blur-sm" />
                                        </motion.div>
                                        {/* Inner highlight */}
                                        <div className="absolute top-3 left-3 w-4 h-4 bg-white/40 rounded-full blur-sm" />
                                    </motion.div>

                                    {/* Sinar memancar - default */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        {[...Array(8)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scaleY: 0, opacity: 0 }}
                                                animate={{
                                                    scaleY: showSparkles ? [1, 1.8, 1] : 1,
                                                    opacity: showSparkles ? [0.6, 1, 0.6] : 0.6
                                                }}
                                                transition={{
                                                    delay: showSparkles ? 0 : 0.7,
                                                    duration: showSparkles ? 0.5 : 0.3
                                                }}
                                                className="absolute w-1 h-6 bg-gradient-to-b from-yellow-400 to-transparent rounded-full"
                                                style={{
                                                    transform: `rotate(${i * 45}deg) translateY(35px)`,
                                                    transformOrigin: "center top"
                                                }}
                                            />
                                        ))}
                                    </motion.div>

                                    {/* Extra kling rays saat save - garis pendek memancar keluar */}
                                    <AnimatePresence>
                                        {showSparkles && (
                                            <>
                                                {/* Burst rays - garis pendek di luar lampu */}
                                                {[
                                                    { angle: -60, dist: 48 },
                                                    { angle: -30, dist: 50 },
                                                    { angle: 0, dist: 52 },
                                                    { angle: 30, dist: 50 },
                                                    { angle: 60, dist: 48 },
                                                    { angle: 120, dist: 48 },
                                                    { angle: 150, dist: 50 },
                                                    { angle: 180, dist: 52 },
                                                    { angle: -150, dist: 50 },
                                                    { angle: -120, dist: 48 },
                                                ].map((ray, i) => (
                                                    <motion.div
                                                        key={`ray-${i}`}
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{
                                                            opacity: [0, 1, 1, 0],
                                                            width: [0, 18, 18, 0],
                                                        }}
                                                        transition={{
                                                            duration: 1.2,
                                                            delay: i * 0.08,
                                                            ease: "easeOut"
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            left: '50%',
                                                            top: '50%',
                                                            height: '4px',
                                                            background: 'linear-gradient(to right, #FBBF24, #FDE047)',
                                                            borderRadius: '4px',
                                                            transformOrigin: 'left center',
                                                            transform: `rotate(${ray.angle}deg) translateX(${ray.dist}px)`,
                                                        }}
                                                    />
                                                ))}

                                                {/* Glow pulse */}
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{
                                                        opacity: [0, 0.8, 0],
                                                        scale: [0.5, 2, 2.5]
                                                    }}
                                                    transition={{ duration: 1.0 }}
                                                    className="absolute -inset-8 bg-yellow-300 rounded-full blur-2xl -z-10"
                                                />
                                            </>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>

                            {/* Modal Form - langsung di bawah lampu */}
                            <AnimatePresence>
                                {showModal && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="mt-4 w-80 relative"
                                    >
                                        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <span className="text-xl">💡</span> Idea Vault
                                                </h2>
                                                <button
                                                    onClick={handleClose}
                                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                                                >
                                                    <X size={18} className="text-slate-400" />
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                <textarea
                                                    value={idea}
                                                    onChange={(e) => setIdea(e.target.value)}
                                                    placeholder="Quick thought? Catch it here..."
                                                    className="w-full h-24 p-3 text-sm font-medium placeholder-slate-400 resize-none rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:outline-none transition-colors"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleSave}
                                                    disabled={!idea.trim()}
                                                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Lock size={16} />
                                                    Save for Later
                                                </button>
                                            </div>

                                            {ideas.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                        Vaulted ({ideas.length})
                                                    </h3>
                                                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                                                        {ideas.map((item, idx) => (
                                                            <div key={idx} className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 font-medium">
                                                                {item}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
