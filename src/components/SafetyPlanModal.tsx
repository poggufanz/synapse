"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Heart, Phone, Plus, Trash2, ChevronDown, Mail, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SafetyPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode?: boolean;
}

interface EmergencyContact {
    name: string;
    phone: string;
    role?: string;
}

const STORAGE_KEY = "synapse-safety-plan";

const DEFAULT_HOTLINES = [
    { name: "Call Emergency (988)", desc: "Available 24/7 for immediate help", phone: "988", icon: "🆘" },
    { name: "Text Crisis Line (741741)", desc: 'Text "HOME" to connect', phone: "741741", icon: "💬" },
];

const GROUNDING_STRATEGIES = [
    {
        id: "54321",
        title: "5-4-3-2-1 Technique",
        icon: "🖐️",
        iconColor: "#f49d25",
        steps: [
            "Acknowledge 5 things you see around you.",
            "Acknowledge 4 things you can touch.",
            "Acknowledge 3 things you hear.",
            "Acknowledge 2 things you can smell.",
            "Acknowledge 1 thing you can taste."
        ]
    },
    {
        id: "box",
        title: "Box Breathing",
        icon: "🌬️",
        iconColor: "#3b82f6",
        steps: [
            "Inhale for 4 seconds.",
            "Hold for 4 seconds.",
            "Exhale for 4 seconds.",
            "Hold for 4 seconds."
        ]
    },
    {
        id: "sensory",
        title: "Sensory Shock",
        icon: "💧",
        iconColor: "#14b8a6",
        steps: [
            "Splash cold water on your face or hold an ice cube in your hand until it melts.",
            "Focus entirely on the intense sensation of cold to reset your nervous system."
        ]
    }
];

export default function SafetyPlanModal({ isOpen, onClose, isDarkMode = false }: SafetyPlanModalProps) {
    const [warningSigns, setWarningSigns] = useState<string[]>([]);
    const [copingStrategies, setCopingStrategies] = useState<string[]>([]);
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
    const [openStrategy, setOpenStrategy] = useState<string | null>("54321");

    const [newWarning, setNewWarning] = useState("");
    const [newCoping, setNewCoping] = useState("");
    const [newContactName, setNewContactName] = useState("");
    const [newContactPhone, setNewContactPhone] = useState("");
    const [newContactRole, setNewContactRole] = useState("");

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

    const addContact = () => {
        if (newContactName.trim() && newContactPhone.trim()) {
            setEmergencyContacts([...emergencyContacts, {
                name: newContactName.trim(),
                phone: newContactPhone.trim(),
                role: newContactRole.trim() || undefined
            }]);
            setNewContactName("");
            setNewContactPhone("");
            setNewContactRole("");
        }
    };

    const removeItem = (type: "warning" | "coping" | "contact", index: number) => {
        if (type === "warning") setWarningSigns(warningSigns.filter((_, i) => i !== index));
        else if (type === "coping") setCopingStrategies(copingStrategies.filter((_, i) => i !== index));
        else setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
    };

    const callNumber = (phone: string) => {
        window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
    };

    if (!isOpen) return null;

    const bgColor = isDarkMode ? '#221a10' : '#f8f7f5';
    const textColor = isDarkMode ? '#eaddcf' : '#4a453e';
    const primaryColor = '#f49d25';

    const neoSurface = {
        backgroundColor: bgColor,
        boxShadow: isDarkMode
            ? '9px 9px 18px #15100a, -9px -9px 18px #2f2416'
            : '9px 9px 18px #d6d3cd, -9px -9px 18px #ffffff',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.4)'
    };

    const neoBtn = {
        backgroundColor: bgColor,
        boxShadow: isDarkMode
            ? '6px 6px 12px #15100a, -6px -6px 12px #2f2416'
            : '6px 6px 12px #d6d3cd, -6px -6px 12px #ffffff',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.4)'
    };

    const neoInset = {
        backgroundColor: bgColor,
        boxShadow: isDarkMode
            ? 'inset 6px 6px 12px #15100a, inset -6px -6px 12px #2f2416'
            : 'inset 6px 6px 12px #d6d3cd, inset -6px -6px 12px #ffffff'
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
                style={{ fontFamily: "'Nunito', sans-serif", backgroundColor: bgColor }}
            >
                {/* Background Gradient Blobs */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px]" style={{ backgroundColor: `${primaryColor}20` }} />
                    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[100px]" style={{ backgroundColor: isDarkMode ? 'rgba(249,115,22,0.1)' : 'rgba(255,200,150,0.2)' }} />
                </div>

                {/* Header */}
                <header className="relative z-10 flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-xl" style={{ ...neoBtn, color: primaryColor }}>
                            <span className="text-xl">🛡️</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight" style={{ color: isDarkMode ? 'white' : textColor }}>
                            Synapse
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-8">
                            <span className="text-sm font-medium" style={{ color: primaryColor }}>Safety Plan</span>
                        </nav>
                        <button onClick={onClose} className="flex items-center justify-center size-10 rounded-full transition-all hover:-translate-y-0.5" style={neoBtn}>
                            <X size={20} style={{ color: textColor }} />
                        </button>
                    </div>
                </header>

                {/* Main Content - Scrollable */}
                <main className="relative z-10 flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-12">
                    {/* Page Heading */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col items-center text-center gap-4"
                    >
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: isDarkMode ? 'white' : textColor }}>
                            Safety Plan
                        </h1>
                        <p className="text-lg md:text-xl font-light max-w-2xl" style={{ color: `${textColor}99` }}>
                            You are not alone. Here are your anchors to help you navigate through the storm.
                        </p>
                    </motion.div>

                    {/* Emergency Actions */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                        {DEFAULT_HOTLINES.map((hotline, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => callNumber(hotline.phone)}
                                className="group relative flex items-center justify-between p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                                style={neoBtn}
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-lg font-bold" style={{ color: idx === 0 ? primaryColor : textColor }}>
                                        {hotline.name}
                                    </span>
                                    <span className="text-sm" style={{ color: `${textColor}60` }}>{hotline.desc}</span>
                                </div>
                                <div className="size-12 rounded-full flex items-center justify-center" style={{ ...neoInset, color: idx === 0 ? primaryColor : textColor }}>
                                    <span className="text-2xl">{hotline.icon}</span>
                                </div>
                            </motion.button>
                        ))}
                    </section>

                    {/* Your Circle */}
                    <section className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                        <h2 className="text-2xl font-bold pl-2" style={{ color: isDarkMode ? 'white' : textColor, borderLeft: `4px solid ${primaryColor}80` }}>
                            Your Circle
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {emergencyContacts.map((contact, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 rounded-2xl flex flex-col items-center text-center gap-4 group"
                                    style={neoSurface}
                                >
                                    <div className="relative size-20 rounded-full p-1" style={neoSurface}>
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center">
                                            <span className="text-3xl">👤</span>
                                        </div>
                                        <div className="absolute bottom-0 right-0 size-5 rounded-full bg-green-500" style={{ border: `2px solid ${bgColor}` }} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold" style={{ color: textColor }}>{contact.name}</h3>
                                        {contact.role && <p className="text-sm" style={{ color: primaryColor }}>{contact.role}</p>}
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <button onClick={() => callNumber(contact.phone)} className="size-10 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5" style={neoBtn}>
                                            <Phone size={18} style={{ color: textColor }} />
                                        </button>
                                        <button className="size-10 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5" style={neoBtn}>
                                            <MessageSquare size={18} style={{ color: textColor }} />
                                        </button>
                                        <button onClick={() => removeItem("contact", idx)} className="size-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ ...neoBtn, color: '#ef4444' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Add Contact Card */}
                            <div className="p-6 rounded-2xl flex flex-col gap-4" style={neoSurface}>
                                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: `${textColor}60` }}>Add Contact</h3>
                                <input
                                    type="text"
                                    value={newContactName}
                                    onChange={(e) => setNewContactName(e.target.value)}
                                    placeholder="Name..."
                                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                                    style={{ ...neoInset, color: textColor }}
                                />
                                <input
                                    type="text"
                                    value={newContactRole}
                                    onChange={(e) => setNewContactRole(e.target.value)}
                                    placeholder="Role (optional)..."
                                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                                    style={{ ...neoInset, color: textColor }}
                                />
                                <input
                                    type="tel"
                                    value={newContactPhone}
                                    onChange={(e) => setNewContactPhone(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addContact()}
                                    placeholder="Phone..."
                                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                                    style={{ ...neoInset, color: textColor }}
                                />
                                <button
                                    onClick={addContact}
                                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                                    style={{
                                        background: `linear-gradient(to right, ${primaryColor}, #ff9e4d)`,
                                        color: 'white',
                                        boxShadow: `6px 6px 12px rgba(244,157,37,0.3), -6px -6px 12px #ffffff`
                                    }}
                                >
                                    <Plus size={16} className="inline mr-2" />
                                    Add Contact
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Grounding Strategies */}
                    <section className="w-full max-w-4xl mx-auto flex flex-col gap-6 mb-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold pl-2" style={{ color: isDarkMode ? 'white' : textColor, borderLeft: `4px solid ${primaryColor}80` }}>
                                Grounding Now
                            </h2>
                            <span className="text-sm" style={{ color: `${textColor}60` }}>Pick one to focus on</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {GROUNDING_STRATEGIES.map((strategy) => (
                                <div key={strategy.id} className="group">
                                    <button
                                        onClick={() => setOpenStrategy(openStrategy === strategy.id ? null : strategy.id)}
                                        className="w-full rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all"
                                        style={openStrategy === strategy.id ? { ...neoInset, color: primaryColor } : neoBtn}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full flex items-center justify-center" style={{ ...neoSurface, color: strategy.iconColor }}>
                                                <span className="text-xl">{strategy.icon}</span>
                                            </div>
                                            <span className="font-bold text-lg" style={{ color: openStrategy === strategy.id ? primaryColor : textColor }}>
                                                {strategy.title}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            size={20}
                                            className={`transition-transform ${openStrategy === strategy.id ? 'rotate-180' : ''}`}
                                            style={{ color: textColor }}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openStrategy === strategy.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 p-6 rounded-xl text-base leading-relaxed space-y-2" style={{ ...neoInset, color: `${textColor}dd` }}>
                                                    {strategy.steps.map((step, idx) => (
                                                        <p key={idx}><strong>{idx + 1}.</strong> {step}</p>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* Safety Confirmation Footer */}
                <div
                    className="sticky bottom-0 w-full py-6 flex justify-center pb-8 px-6"
                    style={{
                        background: isDarkMode
                            ? 'linear-gradient(to top, #221a10, #221a10, transparent)'
                            : 'linear-gradient(to top, #f8f7f5, #f8f7f5, transparent)'
                    }}
                >
                    <button
                        onClick={onClose}
                        className="group w-full max-w-md h-16 rounded-full flex items-center justify-center gap-3 font-bold text-lg tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ ...neoBtn, color: primaryColor }}
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">✅</span>
                        <span>I'm Safe Now</span>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
