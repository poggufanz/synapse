"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Heart, Phone, Plus, Trash2, Shield, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SafetyPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode?: boolean;
}

interface EmergencyContact {
    name: string;
    phone: string;
}

const STORAGE_KEY = "synapse-safety-plan";

const DEFAULT_HOTLINES = [
    { name: "Into The Light (LISA)", phone: "119", emoji: "🆘" },
    { name: "Yayasan Pulih", phone: "021-788-42580", emoji: "💚" },
];

export default function SafetyPlanModal({ isOpen, onClose, isDarkMode = true }: SafetyPlanModalProps) {
    const [warningSigns, setWarningSigns] = useState<string[]>([]);
    const [copingStrategies, setCopingStrategies] = useState<string[]>([]);
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

    const [newWarning, setNewWarning] = useState("");
    const [newCoping, setNewCoping] = useState("");
    const [newContactName, setNewContactName] = useState("");
    const [newContactPhone, setNewContactPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");

    // Load from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                setWarningSigns(data.warningSigns || []);
                setCopingStrategies(data.copingStrategies || []);
                setEmergencyContacts(data.emergencyContacts || []);
            }
        } catch (error) {
            console.error("Failed to load safety plan:", error);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                warningSigns,
                copingStrategies,
                emergencyContacts,
            }));
        } catch (error) {
            console.error("Failed to save safety plan:", error);
        }
    }, [warningSigns, copingStrategies, emergencyContacts]);

    const addWarningSign = () => {
        if (newWarning.trim()) {
            setWarningSigns([...warningSigns, newWarning.trim()]);
            setNewWarning("");
        }
    };

    const addCopingStrategy = () => {
        if (newCoping.trim()) {
            setCopingStrategies([...copingStrategies, newCoping.trim()]);
            setNewCoping("");
        }
    };

    // Validate phone number - only allow numbers, +, -, spaces, and parentheses
    const isValidPhone = (phone: string): boolean => {
        const phoneRegex = /^[0-9+\-()\s]+$/;
        return phoneRegex.test(phone) && phone.replace(/[^0-9]/g, '').length >= 3;
    };

    const handlePhoneChange = (value: string) => {
        // Allow empty or valid phone characters
        if (value === '' || /^[0-9+\-()\s]*$/.test(value)) {
            setNewContactPhone(value);
            setPhoneError("");
        } else {
            setPhoneError("Hanya angka dan karakter +, -, (, ) yang diizinkan");
        }
    };

    const addContact = () => {
        if (!newContactName.trim()) {
            return;
        }
        if (!newContactPhone.trim()) {
            setPhoneError("Nomor telepon harus diisi");
            return;
        }
        if (!isValidPhone(newContactPhone.trim())) {
            setPhoneError("Nomor telepon tidak valid (minimal 3 digit)");
            return;
        }
        setEmergencyContacts([...emergencyContacts, { name: newContactName.trim(), phone: newContactPhone.trim() }]);
        setNewContactName("");
        setNewContactPhone("");
        setPhoneError("");
    };

    const removeItem = (type: "warning" | "coping" | "contact", index: number) => {
        if (type === "warning") {
            setWarningSigns(warningSigns.filter((_, i) => i !== index));
        } else if (type === "coping") {
            setCopingStrategies(copingStrategies.filter((_, i) => i !== index));
        } else {
            setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
        }
    };

    const callNumber = (phone: string) => {
        window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
            >
                {/* Beautiful gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />

                {/* Floating orbs for visual interest */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-40 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg shadow-red-500/30"
                        >
                            <Shield className="text-white" size={28} />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Safety Plan</h1>
                            <p className="text-sm text-white/50">Your personal crisis support card 💪</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-3 text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-2xl"
                    >
                        <X size={24} />
                    </motion.button>
                </motion.div>

                {/* Content - Scrollable */}
                <div className="relative flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Warning Signs Section */}
                    <motion.section
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 p-5 backdrop-blur-sm"
                    >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-bl-full" />

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg shadow-yellow-500/20">
                                    <AlertTriangle className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg">Tanda Peringatan</h2>
                                    <p className="text-xs text-yellow-200/60">Kenali saat kamu mulai tidak baik-baik saja</p>
                                </div>
                            </div>

                            {warningSigns.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {warningSigns.map((sign, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 10, opacity: 0 }}
                                            className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                                        >
                                            <span className="text-sm text-white flex items-center gap-2">
                                                <span className="text-yellow-400">⚠️</span> {sign}
                                            </span>
                                            <button
                                                onClick={() => removeItem("warning", idx)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newWarning}
                                    onChange={(e) => setNewWarning(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addWarningSign()}
                                    placeholder="Contoh: Mulai isolasi diri..."
                                    className="flex-1 px-4 py-3 rounded-2xl text-sm bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addWarningSign}
                                    className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all"
                                >
                                    <Plus size={18} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.section>

                    {/* Coping Strategies Section */}
                    <motion.section
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/5 border border-pink-500/20 p-5 backdrop-blur-sm"
                    >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-bl-full" />

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl shadow-lg shadow-pink-500/20">
                                    <Heart className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg">Strategi Koping</h2>
                                    <p className="text-xs text-pink-200/60">Hal yang bisa menenangkanmu</p>
                                </div>
                            </div>

                            {copingStrategies.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {copingStrategies.map((strategy, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 10, opacity: 0 }}
                                            className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                                        >
                                            <span className="text-sm text-white flex items-center gap-2">
                                                <span className="text-pink-400">💖</span> {strategy}
                                            </span>
                                            <button
                                                onClick={() => removeItem("coping", idx)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCoping}
                                    onChange={(e) => setNewCoping(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addCopingStrategy()}
                                    placeholder="Contoh: Dengar playlist favorit..."
                                    className="flex-1 px-4 py-3 rounded-2xl text-sm bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addCopingStrategy}
                                    className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all"
                                >
                                    <Plus size={18} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.section>

                    {/* Emergency Contacts Section */}
                    <motion.section
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/30 p-5 backdrop-blur-sm"
                    >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/30 to-transparent rounded-bl-full" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl" />

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/30">
                                    <Phone className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg">Kontak Darurat</h2>
                                    <p className="text-xs text-red-200/60">Orang yang bisa kamu hubungi</p>
                                </div>
                            </div>

                            {/* Hotlines */}
                            <div className="space-y-3 mb-5">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={12} /> Hotline Krisis 24 Jam
                                </p>
                                {DEFAULT_HOTLINES.map((hotline, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => callNumber(hotline.phone)}
                                        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-all"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="text-xl">{hotline.emoji}</span>
                                            {hotline.name}
                                        </span>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
                                            <span className="text-sm font-bold">{hotline.phone}</span>
                                            <Phone size={14} />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Personal Contacts */}
                            {emergencyContacts.length > 0 && (
                                <div className="space-y-2 mb-5">
                                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Kontak Pribadi</p>
                                    {emergencyContacts.map((contact, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="flex items-center gap-2"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => callNumber(contact.phone)}
                                                className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                                            >
                                                <span className="font-medium text-white flex items-center gap-2">
                                                    <span className="text-green-400">👤</span> {contact.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white/60">{contact.phone}</span>
                                                    <div className="p-1.5 bg-green-500/20 rounded-lg">
                                                        <Phone size={12} className="text-green-400" />
                                                    </div>
                                                </div>
                                            </motion.button>
                                            <button
                                                onClick={() => removeItem("contact", idx)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Add Contact */}
                            <div className="space-y-3 pt-3 border-t border-white/10">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Tambah Kontak Baru</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newContactName}
                                        onChange={(e) => setNewContactName(e.target.value)}
                                        placeholder="Nama..."
                                        className="flex-1 px-4 py-3 rounded-2xl text-sm bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all"
                                    />
                                    <div className="flex-1 flex flex-col">
                                        <input
                                            type="tel"
                                            value={newContactPhone}
                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addContact()}
                                            placeholder="Nomor HP..."
                                            className={`w-full px-4 py-3 rounded-2xl text-sm bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${phoneError ? "border-red-500/50 focus:ring-red-400/50" : "border-white/10 focus:ring-green-400/50"
                                                }`}
                                        />
                                        {phoneError && (
                                            <span className="mt-1 text-xs text-red-400">{phoneError}</span>
                                        )}
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={addContact}
                                        className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all"
                                    >
                                        <Plus size={18} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Motivational Footer */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center py-6"
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10">
                            <span className="text-2xl">💜</span>
                            <p className="text-white/60 text-sm font-medium italic">
                                Kamu tidak sendirian. Bantuan selalu tersedia.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
