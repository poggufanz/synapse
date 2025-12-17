"use client";

import { useState, useRef } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowLeft, Search, X, Sparkles, ChevronDown, ArrowRight, User, Camera, Upload } from "lucide-react";

// Language options
const LANGUAGE_OPTIONS = [
    { value: "Indonesian", label: "Bahasa Indonesia" },
    { value: "English", label: "English" },
    { value: "Japanese", label: "日本語 (Japanese)" },
    { value: "Korean", label: "한국어 (Korean)" },
    { value: "Spanish", label: "Español" },
    { value: "French", label: "Français" },
];

// Default placeholder avatar
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=synapse&backgroundColor=FFEDCC";

interface CreatePersonaPageProps {
    onClose: () => void;
    isDarkMode?: boolean;
}

export default function CreatePersonaPage({ onClose, isDarkMode = false }: CreatePersonaPageProps) {
    const setAiPersona = useEnergyStore((state) => state.setAiPersona);

    // Form state
    const [searchQuery, setSearchQuery] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPersona, setGeneratedPersona] = useState<{
        name: string;
        type: string;
        interactionStyle: string;
    } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState("Indonesian");
    const [interactionStyle, setInteractionStyle] = useState("");

    // Generate persona from character name
    const handleGenerate = async () => {
        if (!searchQuery.trim()) return;

        setIsGenerating(true);

        try {
            // Generate persona traits only (avatar is now user-uploaded)
            const response = await fetch("/api/generate-persona-traits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ characterName: searchQuery }),
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedPersona(data);
                setInteractionStyle(data.interactionStyle || "");
            }
        } catch (error) {
            console.error("Generate persona error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle avatar upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Activate the persona
    const handleActivate = () => {
        if (!generatedPersona) return;

        setAiPersona({
            name: generatedPersona.name,
            type: generatedPersona.type,
            interactionStyle: interactionStyle || generatedPersona.interactionStyle,
            language: selectedLanguage,
            avatar: avatarUrl || `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(generatedPersona.name)}&backgroundColor=FFEDCC`,
        });

        onClose();
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchQuery("");
        setGeneratedPersona(null);
        setInteractionStyle("");
        setAvatarUrl(null);
    };

    // Theme colors
    const colors = {
        bg: isDarkMode ? "#1C1C1E" : "#F8F7F6",
        bgCard: isDarkMode ? "#252528" : "#F8F7F6",
        text: isDarkMode ? "#FFFFFF" : "#4A453E",
        textSub: isDarkMode ? "#8A857E" : "#8A857E",
        primary: "#EEAD2B",
        primaryDark: "#D4961F",
        shadowDark: isDarkMode ? "#151515" : "#DCDAD5",
        shadowLight: isDarkMode ? "#2A2A2D" : "#FFFFFF",
    };

    const neoFlat = `8px 8px 16px ${colors.shadowDark}, -8px -8px 16px ${colors.shadowLight}`;
    const neoPressed = `inset 6px 6px 12px ${colors.shadowDark}, inset -6px -6px 12px ${colors.shadowLight}`;
    const neoSm = `4px 4px 8px ${colors.shadowDark}, -4px -4px 8px ${colors.shadowLight}`;

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap');
            `}</style>

            <div
                className="min-h-screen w-full overflow-y-auto"
                style={{
                    fontFamily: "'Spline Sans', sans-serif",
                    backgroundColor: colors.bg,
                }}
            >
                {/* Header */}
                <header
                    className="sticky top-0 z-10 flex items-center justify-between px-6 py-6 md:px-12 lg:px-40"
                    style={{ backgroundColor: `${colors.bg}E6`, backdropFilter: "blur(8px)" }}
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="flex size-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                            style={{ backgroundColor: colors.bg, boxShadow: neoFlat, color: colors.text }}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h2
                            className="text-xl font-bold tracking-tight hidden sm:block"
                            style={{ color: colors.text }}
                        >
                            Create New Persona
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
                            />
                            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textSub }}>
                                Burnout Mode Active
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex flex-1 flex-col items-center justify-start px-6 pb-20 pt-8 md:px-12">
                    <div className="w-full max-w-3xl flex flex-col gap-10">
                        {/* Headline */}
                        <div className="text-center space-y-2">
                            <h1
                                className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
                                style={{ color: colors.text }}
                            >
                                Who should be your{" "}
                                <span style={{ color: colors.primary }}>guide</span> today?
                            </h1>
                            <p className="text-lg font-light" style={{ color: colors.textSub }}>
                                Select a persona to help navigate your tasks with lower cognitive load.
                            </p>
                        </div>

                        {/* Search Section */}
                        <div className="w-full">
                            <label
                                className="group relative flex h-16 w-full items-center rounded-full transition-all"
                                style={{ backgroundColor: colors.bg, boxShadow: neoPressed }}
                            >
                                <div
                                    className="flex size-16 items-center justify-center pl-2"
                                    style={{ color: colors.primary }}
                                >
                                    <Search size={28} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                    placeholder="Search for a character (e.g., Yoda, Sherlock Holmes)..."
                                    className="h-full flex-1 border-none bg-transparent px-2 text-lg font-medium focus:ring-0 focus:outline-none"
                                    style={{ color: colors.text }}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors"
                                        style={{ color: colors.textSub }}
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={handleGenerate}
                                    disabled={!searchQuery.trim() || isGenerating}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-12 rounded-full transition-all disabled:opacity-50"
                                    style={{ backgroundColor: colors.primary, color: "white", boxShadow: neoSm }}
                                >
                                    {isGenerating ? (
                                        <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Sparkles size={20} />
                                    )}
                                </button>
                            </label>
                        </div>

                        {/* Generated Persona Card */}
                        {generatedPersona && (
                            <div
                                className="relative w-full overflow-hidden rounded-[2rem] p-8 transition-transform duration-500 hover:scale-[1.01]"
                                style={{ backgroundColor: colors.bgCard, boxShadow: neoFlat }}
                            >
                                {/* Decorative background */}
                                <div
                                    className="absolute -right-20 -top-20 size-64 rounded-full blur-[80px]"
                                    style={{ backgroundColor: `${colors.primary}10` }}
                                />

                                <div className="relative flex flex-col gap-8 md:flex-row md:items-start">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col items-center gap-4 md:w-1/3">
                                        <div
                                            className="relative size-32 md:size-40 rounded-full p-1 cursor-pointer group"
                                            style={{ boxShadow: neoSm }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div
                                                className="absolute inset-0 rounded-full"
                                                style={{ background: `linear-gradient(to top right, ${colors.primary}20, transparent)` }}
                                            />
                                            <div
                                                className="h-full w-full rounded-full bg-cover bg-center border-4 flex items-center justify-center overflow-hidden relative"
                                                style={{
                                                    borderColor: colors.bg,
                                                    backgroundColor: isDarkMode ? "#3a3a3e" : "#FFEDCC",
                                                }}
                                            >
                                                {avatarUrl ? (
                                                    <img
                                                        src={avatarUrl}
                                                        alt={generatedPersona.name}
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={64} style={{ color: colors.primary }} />
                                                )}
                                                {/* Upload overlay */}
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                                    <Camera size={32} className="text-white" />
                                                </div>
                                            </div>
                                            {/* Hidden file input */}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                            />
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: isDarkMode ? "#3a3a3e" : "#FFEDCC",
                                                color: colors.primary,
                                                boxShadow: neoSm
                                            }}
                                        >
                                            <Upload size={16} />
                                            Upload Photo
                                        </button>
                                        <div className="text-center">
                                            <h3
                                                className="text-2xl font-bold"
                                                style={{ color: colors.text }}
                                            >
                                                {generatedPersona.name}
                                            </h3>
                                            <p
                                                className="text-sm font-medium uppercase tracking-wide"
                                                style={{ color: colors.primary }}
                                            >
                                                {generatedPersona.type}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="flex flex-1 flex-col gap-5 md:pt-2">
                                        {/* Interaction Style */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    className="text-xs font-bold uppercase tracking-wider"
                                                    style={{ color: colors.textSub }}
                                                >
                                                    Interaction Style
                                                </label>
                                            </div>
                                            <div
                                                className="rounded-2xl p-5"
                                                style={{ backgroundColor: colors.bg, boxShadow: neoPressed }}
                                            >
                                                <textarea
                                                    value={interactionStyle}
                                                    onChange={(e) => setInteractionStyle(e.target.value)}
                                                    rows={3}
                                                    className="w-full leading-relaxed bg-transparent border-none focus:ring-0 focus:outline-none resize-none"
                                                    style={{ color: colors.text }}
                                                    placeholder="Describe how you want the AI to interact..."
                                                />
                                            </div>
                                        </div>

                                        {/* Language Selection */}
                                        <div className="space-y-3 pt-2">
                                            <label
                                                className="text-xs font-bold uppercase tracking-wider"
                                                style={{ color: colors.textSub }}
                                            >
                                                Language
                                            </label>
                                            <div className="relative w-full max-w-[240px]">
                                                <select
                                                    value={selectedLanguage}
                                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                                    className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm font-medium cursor-pointer border-none focus:outline-none focus:ring-1"
                                                    style={{
                                                        backgroundColor: colors.bg,
                                                        boxShadow: neoPressed,
                                                        color: colors.text,
                                                    }}
                                                >
                                                    {LANGUAGE_OPTIONS.map((lang) => (
                                                        <option key={lang.value} value={lang.value}>
                                                            {lang.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div
                                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                                                    style={{ color: colors.primary }}
                                                >
                                                    <ChevronDown size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse items-center justify-center gap-6 pt-4 sm:flex-row sm:justify-end">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 text-sm font-bold transition-colors"
                                style={{ color: colors.textSub }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleActivate}
                                disabled={!generatedPersona}
                                className="group relative flex items-center gap-2 overflow-hidden rounded-full px-8 py-4 text-white transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: colors.primary,
                                    boxShadow: `4px 4px 10px rgba(238,173,43,0.4), -4px -4px 10px rgba(255,255,255,0.8)`,
                                }}
                            >
                                <span className="relative z-10 text-base font-bold tracking-wide">
                                    Activate Persona
                                </span>
                                <ArrowRight
                                    size={20}
                                    className="relative z-10 transition-transform group-hover:translate-x-1"
                                />
                                {/* Glossy overlay */}
                                <div
                                    className="absolute inset-0 opacity-50"
                                    style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)" }}
                                />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
