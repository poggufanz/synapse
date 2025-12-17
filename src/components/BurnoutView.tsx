"use client";

import { useState, useEffect, useRef } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowLeft, Moon, Sun, Send, Music, Wind, Shield, BookHeart, Sparkles, User, Droplets, Settings } from "lucide-react";
import BreathingModal from "./BreathingModal";
import SafetyPlanModal from "./SafetyPlanModal";
import GrowthGarden, { addWellnessPoints } from "./GrowthGarden";
import GrowthGardenModal from "./GrowthGardenModal";
import QuickJournal from "./QuickJournal";
import CreatePersonaPage from "./CreatePersonaPage";

// Chat message type
interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

// Default quick reply pills
const DEFAULT_PILLS = [
    { text: "I'm overwhelmed", emoji: "😰" },
    { text: "Help me breathe", emoji: "🫁" },
    { text: "So tired", emoji: "😴" },
    { text: "Need to vent", emoji: "💭" },
];

// Ambient sound options
const SOUND_OPTIONS = [
    { id: "rain", label: "Rain", icon: "🌧️", url: "https://cdn.pixabay.com/audio/2022/05/13/audio_257112181b.mp3" },
    { id: "whitenoise", label: "White Noise", icon: "📻", url: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3" },
    { id: "ocean", label: "Ocean Waves", icon: "🌊", url: "https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3" },
];

// localStorage keys
const CHAT_HISTORY_KEY = "synapse-burnout-chat-history";
const THEME_KEY = "synapse-burnout-theme";
const SOUND_KEY = "synapse-burnout-sound";

export default function BurnoutView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);
    const aiPersona = useEnergyStore((state) => state.aiPersona);

    // Show Create Persona page
    const [showCreatePersona, setShowCreatePersona] = useState(false);

    // Theme state (default: light for Optimistic Sunrise)
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Sound State
    const [isSoundOn, setIsSoundOn] = useState(false);
    const [selectedSound, setSelectedSound] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pendingPlayRef = useRef(false);


    // Modal States
    const [isBreathingOpen, setIsBreathingOpen] = useState(false);
    const [isSafetyPlanOpen, setIsSafetyPlanOpen] = useState(false);
    const [isJournalOpen, setIsJournalOpen] = useState(false);
    const [isGrowthGardenOpen, setIsGrowthGardenOpen] = useState(false);
    const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);

    // Load theme from localStorage
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === "dark");
            }
        } catch (error) {
            console.error("Failed to load theme:", error);
        }
    }, []);

    // Save theme to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
        } catch (error) {
            console.error("Failed to save theme:", error);
        }
    }, [isDarkMode]);

    // Load selected sound from localStorage
    useEffect(() => {
        try {
            const savedSound = localStorage.getItem(SOUND_KEY);
            if (savedSound && SOUND_OPTIONS.find(s => s.id === savedSound)) {
                setSelectedSound(savedSound);
            }
        } catch (error) {
            console.error("Failed to load sound preference:", error);
        }
    }, []);

    // Initialize audio with selected sound
    useEffect(() => {
        const soundOption = SOUND_OPTIONS.find(s => s.id === selectedSound);
        if (!soundOption) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const audio = new Audio(soundOption.url);
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;

        const handleCanPlay = () => {
            if (pendingPlayRef.current) {
                audio.play().catch(console.error);
                pendingPlayRef.current = false;
            }
        };
        audio.addEventListener('canplaythrough', handleCanPlay);

        if (isSoundOn) {
            audio.play().catch(() => {
                pendingPlayRef.current = true;
            });
        }

        try {
            if (selectedSound) {
                localStorage.setItem(SOUND_KEY, selectedSound);
            }
        } catch (error) {
            console.error("Failed to save sound preference:", error);
        }

        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.pause();
            audioRef.current = null;
        };
    }, [selectedSound]);

    // Watch for isSoundOn changes
    useEffect(() => {
        if (!audioRef.current) return;

        if (isSoundOn) {
            audioRef.current.play().catch(() => {
                pendingPlayRef.current = true;
            });
        } else {
            audioRef.current.pause();
            pendingPlayRef.current = false;
        }
    }, [isSoundOn]);

    // Load chat history
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                if (Array.isArray(parsed)) {
                    setChatMessages(parsed);
                }
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    }, []);

    // Save chat history
    useEffect(() => {
        if (chatMessages.length > 0) {
            try {
                localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatMessages));
            } catch (error) {
                console.error("Failed to save chat history:", error);
            }
        }
    }, [chatMessages]);

    // Scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleSoundSelect = (soundId: string) => {
        if (selectedSound === soundId && isSoundOn) {
            setIsSoundOn(false);
        } else if (selectedSound === soundId && !isSoundOn) {
            setIsSoundOn(true);
        } else {
            setSelectedSound(soundId);
            setIsSoundOn(true);
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const sendMessage = async (message: string) => {
        if (!message.trim()) return;

        const userMsg: ChatMessage = { role: "user", content: message };
        setChatMessages((prev) => [...prev, userMsg]);
        setChatInput("");
        setIsChatLoading(true);

        try {
            const response = await fetch("/api/chat-burnout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: chatMessages,
                    message: userMsg.content,
                    persona,
                    aiPersona,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setChatMessages((prev) => [...prev, { role: "ai", content: data.message }]);
                addWellnessPoints("chat", 3);
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsChatLoading(false);
        }
    };

    const userName = persona?.name || "friend";

    // Show Create Persona page as full-screen overlay
    if (showCreatePersona) {
        return <CreatePersonaPage onClose={() => setShowCreatePersona(false)} isDarkMode={isDarkMode} />;
    }

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                
                .glass-panel {
                    background: ${isDarkMode ? 'rgba(28, 28, 30, 0.75)' : 'rgba(255, 251, 240, 0.75)'};
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)'};
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
                }
                
                .clay-card-base {
                    background-color: ${isDarkMode ? '#1C1C1E' : '#FFFBF0'};
                    border-radius: 2rem;
                    border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'};
                }
                
                .shadow-clay-card {
                    box-shadow: ${isDarkMode
                    ? '20px 20px 60px #151515, -20px -20px 60px #232323'
                    : '20px 20px 60px #d9d4c8, -20px -20px 60px #ffffff'};
                }
                
                .shadow-clay-btn {
                    box-shadow: ${isDarkMode
                    ? '8px 8px 16px #151515, -8px -8px 16px #232323'
                    : '8px 8px 16px #d9d4c8, -8px -8px 16px #ffffff'};
                }
                
                .shadow-clay-inset {
                    box-shadow: ${isDarkMode
                    ? 'inset 6px 6px 12px #151515, inset -6px -6px 12px #232323'
                    : 'inset 6px 6px 12px #d1ccc0, inset -6px -6px 12px #ffffff'};
                }
                
                .ai-chat-bubble {
                    background-color: ${isDarkMode ? '#2a3a4a' : '#C9EAFA'};
                    border-radius: 1.5rem 1.5rem 1.5rem 0.5rem;
                    border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'};
                }
                
                .user-chat-bubble {
                    background-color: ${isDarkMode ? '#4a3a2a' : '#FFEDCC'};
                    border-radius: 1.5rem 1.5rem 0.5rem 1.5rem;
                    border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'};
                }
                
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                /* Custom Scrollbar Styling */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'};
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'};
                    background-clip: content-box;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.03)'};
                }
                
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>

            {/* Main Container - Scrollable Page */}
            <div
                className={`min-h-screen w-full overflow-y-auto custom-scrollbar transition-colors duration-300 selection:bg-orange-200`}
                style={{
                    fontFamily: "'Nunito', sans-serif",
                    backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFBF0',
                    backgroundImage: isDarkMode
                        ? 'none'
                        : 'radial-gradient(at 0% 0%, hsla(33,100%,93%,0.6) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(140,40%,90%,0.6) 0, transparent 50%)'
                }}
            >
                {/* Background Blobs - Fixed Position */}
                <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                    <div
                        className={`absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] mix-blend-multiply`}
                        style={{
                            backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255, 224, 179, 0.3)',
                            animation: 'breathe 4s ease-in-out infinite'
                        }}
                    />
                    <div
                        className={`absolute top-[20%] right-[0%] w-[50%] h-[50%] rounded-full blur-[100px] mix-blend-multiply`}
                        style={{ backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(197, 214, 204, 0.3)' }}
                    />
                    <div
                        className={`absolute bottom-[0%] left-[20%] w-[60%] h-[50%] rounded-full blur-[130px] mix-blend-multiply`}
                        style={{ backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(225, 246, 255, 0.4)' }}
                    />
                </div>

                {/* Main Content - Scrollable */}
                <main className="px-4 sm:px-6 lg:px-8 pb-8 pt-4 max-w-7xl mx-auto w-full z-0">
                    {/* Top Bar with Exit Button */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setMode(null)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-clay-btn hover:shadow-clay-inset text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 group ${isDarkMode ? 'text-white/70' : 'text-stone-600'}`}
                            style={{ backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFBF0' }}
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Exit</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`size-10 rounded-full shadow-clay-btn flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-clay-inset ${isDarkMode ? 'text-yellow-300' : 'text-stone-600'}`}
                            style={{ backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFBF0' }}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>

                    {/* Welcome Section */}
                    <section className="mb-6 text-center" style={{ animation: 'breathe 8s ease-in-out infinite' }}>
                        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                            Your Resilience Story, {userName}.
                        </h2>
                        <p className={`text-base sm:text-lg font-semibold max-w-2xl mx-auto ${isDarkMode ? 'text-green-400' : 'text-[#628F7A]'}`}>
                            Let's collaboratively write your journey of strength and growth.
                        </p>
                    </section>

                    {/* Two Column Grid - 3:1 Ratio */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 items-start">
                        {/* Left: Chat Panel (3 cols) */}
                        <div className="lg:col-span-3 flex flex-col">
                            <div
                                className="clay-card-base shadow-clay-card relative overflow-hidden p-4 sm:p-6 flex flex-col"
                                style={{ backgroundColor: isDarkMode ? '#252528' : '#F5F8FF', maxHeight: '600px' }}
                            >
                                {/* Decorative gradients */}
                                <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-blue-900/20' : 'from-[#E1F6FF]/50'} to-transparent pointer-events-none`} />
                                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-orange-500/10' : 'bg-[#FFE0B3]/30'}`} />
                                <div className={`absolute -left-10 bottom-0 w-32 h-32 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-green-500/10' : 'bg-[#E3EBE6]/30'}`} />

                                {/* Chat Header */}
                                <div className="relative z-10 flex items-center gap-4 mb-4 flex-shrink-0">
                                    <div
                                        className="size-10 rounded-full flex items-center justify-center shadow-clay-btn"
                                        style={{
                                            backgroundColor: isDarkMode ? '#2a3a4a' : '#E1F6FF',
                                            color: isDarkMode ? '#93c5fd' : '#70BBE8'
                                        }}
                                    >
                                        <Sparkles size={20} />
                                    </div>
                                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                                        The Storyteller AI
                                    </h3>
                                </div>

                                {/* Chat Messages - Scrollable Area with Custom Scrollbar */}
                                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-2 relative z-10">
                                    {chatMessages.length === 0 && (
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="size-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    backgroundColor: isDarkMode ? '#2a3a4a' : '#E1F6FF',
                                                    color: isDarkMode ? '#93c5fd' : '#70BBE8'
                                                }}
                                            >
                                                <Sparkles size={14} />
                                            </div>
                                            <div className="ai-chat-bubble px-4 py-3 max-w-[85%]">
                                                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-white/90' : 'text-stone-700'}`}>
                                                    Hello {userName}! Let's begin the first chapter of your Resilience Story. What kind of situations or feelings usually lead you to a challenging moment?
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start gap-3`}>
                                            {msg.role === "ai" && (
                                                <div
                                                    className="size-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        backgroundColor: isDarkMode ? '#2a3a4a' : '#E1F6FF',
                                                        color: isDarkMode ? '#93c5fd' : '#70BBE8'
                                                    }}
                                                >
                                                    <Sparkles size={14} />
                                                </div>
                                            )}
                                            <div className={`px-4 py-3 max-w-[85%] ${msg.role === "user" ? "user-chat-bubble" : "ai-chat-bubble"}`}>
                                                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-white/90' : 'text-stone-700'}`}>
                                                    {msg.content}
                                                </p>
                                            </div>
                                            {msg.role === "user" && (
                                                <div
                                                    className="size-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        backgroundColor: isDarkMode ? '#4a3a2a' : '#FFE0B3',
                                                        color: isDarkMode ? '#fcd34d' : '#FFAB80'
                                                    }}
                                                >
                                                    <User size={14} />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isChatLoading && (
                                        <div className="flex justify-start items-start gap-3">
                                            <div
                                                className="size-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    backgroundColor: isDarkMode ? '#2a3a4a' : '#E1F6FF',
                                                    color: isDarkMode ? '#93c5fd' : '#70BBE8'
                                                }}
                                            >
                                                <Sparkles size={14} />
                                            </div>
                                            <div className="ai-chat-bubble px-4 py-3">
                                                <div className="flex gap-1">
                                                    <span className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-blue-400' : 'bg-[#70BBE8]'}`} />
                                                    <span className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-blue-400' : 'bg-[#70BBE8]'}`} style={{ animationDelay: '0.1s' }} />
                                                    <span className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-blue-400' : 'bg-[#70BBE8]'}`} style={{ animationDelay: '0.2s' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Quick Reply Pills */}
                                <div className="flex flex-wrap gap-2 mt-3 mb-3 flex-shrink-0 relative z-10">
                                    {DEFAULT_PILLS.map((pill, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage(pill.text)}
                                            className={`text-xs font-semibold px-3 py-2 rounded-full shadow-clay-btn active:shadow-clay-inset transition-all duration-200 flex items-center gap-1.5`}
                                            style={{
                                                backgroundColor: isDarkMode ? '#2a3a4a' : '#E1F6FF',
                                                color: isDarkMode ? '#93c5fd' : '#70BBE8'
                                            }}
                                        >
                                            <span>{pill.emoji}</span>
                                            <span>{pill.text}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)}
                                            placeholder="Continue your story..."
                                            className={`w-full pl-5 pr-14 py-3 rounded-full shadow-clay-inset border border-white/50 focus:ring-2 focus:ring-[#FFAB80]/50 focus:border-[#FFAB80]/50 text-sm transition-all duration-300 outline-none ${isDarkMode ? 'text-white placeholder-white/30 bg-[#1C1C1E]' : 'text-stone-700 placeholder-stone-400 bg-[#FFFBF0]'}`}
                                        />
                                        <button
                                            onClick={() => sendMessage(chatInput)}
                                            disabled={!chatInput.trim() || isChatLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-full flex items-center justify-center shadow-clay-btn transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: '#FFAB80', color: 'white' }}
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Growth Garden Panel (1 col) */}
                        <div className="lg:col-span-1">
                            <div
                                className="clay-card-base shadow-clay-card relative overflow-hidden p-4 sm:p-5 flex flex-col"
                                style={{
                                    backgroundColor: isDarkMode ? '#1a2e1a' : '#E0F2F7',
                                    backgroundImage: isDarkMode
                                        ? 'none'
                                        : 'radial-gradient(at 20% 80%, hsla(200,80%,90%,0.8) 0, transparent 50%), radial-gradient(at 80% 20%, hsla(45,100%,90%,0.6) 0, transparent 50%), radial-gradient(at 50% 50%, hsla(30,80%,90%,0.4) 0, transparent 50%)'
                                }}
                            >
                                {/* Decorative gradients */}
                                <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-green-900/20' : 'from-[#E1F6FF]/50'} to-transparent pointer-events-none`} />
                                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-orange-500/10' : 'bg-[#FFE0B3]/50'}`} />
                                <div className={`absolute -left-10 bottom-0 w-32 h-32 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-green-500/10' : 'bg-[#E3EBE6]/50'}`} />

                                {/* Header */}
                                <div className="relative z-10 text-center mb-3 flex-shrink-0">
                                    <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-[#70BBE8]'}`}>
                                        Your Resilience Journey
                                    </p>
                                    <h3 className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                                        Growth Garden
                                    </h3>
                                </div>

                                {/* Growth Garden Preview - Clickable to open modal */}
                                <button
                                    onClick={() => setIsGrowthGardenOpen(true)}
                                    className="relative z-10 overflow-hidden rounded-2xl p-4 mb-4 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    style={{
                                        backgroundColor: isDarkMode ? 'rgba(26, 46, 26, 0.5)' : 'rgba(255, 255, 255, 0.6)',
                                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'}`,
                                        boxShadow: isDarkMode
                                            ? 'inset 4px 4px 8px rgba(0,0,0,0.2), inset -4px -4px 8px rgba(255,255,255,0.05)'
                                            : 'inset 4px 4px 8px rgba(0,0,0,0.05), inset -4px -4px 8px rgba(255,255,255,0.8)'
                                    }}
                                >
                                    <GrowthGarden isDarkMode={isDarkMode} compact={true} previewOnly={true} />
                                </button>

                                {/* Action Buttons - Horizontal */}
                                <div className="relative z-10 flex-shrink-0 flex gap-2">
                                    {/* Journal Button */}
                                    <button
                                        onClick={() => setIsJournalOpen(true)}
                                        className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl shadow-clay-btn hover:shadow-clay-inset transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                                        style={{ backgroundColor: isDarkMode ? '#4a3a2a' : '#FFE0B3' }}
                                    >
                                        <BookHeart size={20} style={{ color: isDarkMode ? '#fcd34d' : '#FFAB80' }} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Journal</span>
                                    </button>

                                    {/* Breathe Button */}
                                    <button
                                        onClick={() => setIsBreathingOpen(true)}
                                        className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl shadow-clay-btn hover:shadow-clay-inset transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                                        style={{ backgroundColor: isDarkMode ? '#2a3a2e' : '#E3EBE6' }}
                                    >
                                        <Wind size={20} style={{ color: isDarkMode ? '#86efac' : '#628F7A' }} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>Breathe</span>
                                    </button>
                                    {/* Safety Plan Button */}
                                    <button
                                        onClick={() => setIsSafetyPlanOpen(true)}
                                        className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl shadow-clay-btn hover:shadow-clay-inset transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                                        style={{ backgroundColor: isDarkMode ? '#2a3a4a' : '#E1F6FF' }}
                                    >
                                        <Shield size={20} style={{ color: isDarkMode ? '#93c5fd' : '#70BBE8' }} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Safety</span>
                                    </button>
                                </div>
                            </div>

                            {/* Current AI Persona Card - Separate Card Below Growth Garden */}
                            <button
                                onClick={() => setShowCreatePersona(true)}
                                className="clay-card-base shadow-clay-card relative overflow-hidden p-4 mt-4 w-full text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    backgroundColor: isDarkMode ? '#2a2520' : '#FFF8E8',
                                    backgroundImage: isDarkMode
                                        ? 'none'
                                        : 'radial-gradient(at 20% 80%, hsla(40,100%,90%,0.6) 0, transparent 50%), radial-gradient(at 80% 20%, hsla(30,100%,90%,0.4) 0, transparent 50%)'
                                }}
                            >
                                {/* Decorative gradient */}
                                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-amber-500/10' : 'bg-[#FFE0B3]/50'}`} />

                                <div className="relative z-10 flex items-center gap-4">
                                    {/* Avatar with generated image */}
                                    <div
                                        className="size-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                                        style={{
                                            backgroundColor: isDarkMode ? '#3a3530' : '#FFEDCC',
                                            border: `3px solid ${isDarkMode ? 'rgba(252,211,77,0.3)' : 'rgba(255,171,128,0.5)'}`,
                                            boxShadow: isDarkMode
                                                ? '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(255,255,255,0.05)'
                                                : '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.8)'
                                        }}
                                    >
                                        {aiPersona ? (
                                            <img
                                                src={aiPersona.avatar || `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(aiPersona.name)}&backgroundColor=FFEDCC`}
                                                alt={aiPersona.name}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <Settings size={24} style={{ color: isDarkMode ? '#8a857e' : '#8a857e' }} />
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-amber-400/70' : 'text-amber-600'}`}>
                                            {aiPersona ? 'Your Friend' : 'AI Friend'}
                                        </p>
                                        <p className={`text-base font-bold truncate ${isDarkMode ? 'text-white' : 'text-stone-700'}`}>
                                            {aiPersona ? aiPersona.name : 'Customize your friend →'}
                                        </p>
                                        {aiPersona && (
                                            <p className={`text-xs truncate ${isDarkMode ? 'text-white/60' : 'text-stone-500'}`}>
                                                {aiPersona.type} • {aiPersona.language}
                                            </p>
                                        )}
                                    </div>

                                    {/* Sparkle indicator */}
                                    {aiPersona && (
                                        <Sparkles size={20} style={{ color: isDarkMode ? '#fcd34d' : '#FFAB80' }} className="flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </main>



                {/* Sounds Button - Bottom Left */}
                <div className="fixed bottom-6 left-6 z-50">
                    <div className="relative group">
                        <button
                            onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
                            className={`size-12 rounded-full shadow-clay-btn flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-clay-inset ${isDarkMode ? 'text-white/70' : 'text-stone-600'}`}
                            style={{ backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFBF0' }}
                        >
                            <Music size={22} />
                            {isSoundOn && (
                                <span className="absolute top-0 right-0 size-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
                            )}
                        </button>

                        {/* Sound Menu Popup */}
                        {isSoundMenuOpen && (
                            <div
                                className="absolute bottom-full mb-2 left-0 w-32 rounded-xl shadow-clay-card p-2 space-y-1"
                                style={{ backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFBF0' }}
                            >
                                {SOUND_OPTIONS.map((sound) => (
                                    <button
                                        key={sound.id}
                                        onClick={() => {
                                            handleSoundSelect(sound.id);
                                            setIsSoundMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/20 transition-colors ${isDarkMode ? 'text-white/80' : 'text-stone-700'} ${selectedSound === sound.id && isSoundOn ? (isDarkMode ? 'text-green-400' : 'text-green-600') : ''}`}
                                    >
                                        <span className="text-lg">{sound.icon}</span>
                                        <span>{sound.label.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Exit Button */}
                <div className="fixed top-20 right-4 z-50 md:hidden">
                    <button
                        onClick={() => setMode(null)}
                        className={`size-10 rounded-full shadow-clay-btn flex items-center justify-center ${isDarkMode ? 'text-white/70' : 'text-stone-600'}`}
                        style={{ backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFBF0' }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>

                {/* Modals */}
                <BreathingModal
                    isOpen={isBreathingOpen}
                    onClose={() => setIsBreathingOpen(false)}
                    isDarkMode={isDarkMode}
                />

                <SafetyPlanModal
                    isOpen={isSafetyPlanOpen}
                    onClose={() => setIsSafetyPlanOpen(false)}
                    isDarkMode={isDarkMode}
                />

                <QuickJournal
                    isOpen={isJournalOpen}
                    onClose={() => setIsJournalOpen(false)}
                    isDarkMode={isDarkMode}
                />

                <GrowthGardenModal
                    isOpen={isGrowthGardenOpen}
                    onClose={() => setIsGrowthGardenOpen(false)}
                    isDarkMode={isDarkMode}
                />
            </div>
        </>
    );
}
