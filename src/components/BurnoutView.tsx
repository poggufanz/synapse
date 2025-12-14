"use client";

import { useState, useEffect, useRef } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowLeft, Moon, Sun, Send, Music, Wind, Shield, BookHeart } from "lucide-react";
import BreathingModal from "./BreathingModal";
import SafetyPlanModal from "./SafetyPlanModal";
import GrowthGarden, { addWellnessPoints } from "./GrowthGarden";
import QuickJournal from "./QuickJournal";

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

// Mood options
const MOOD_OPTIONS = [
    { icon: "😫", label: "Stressed" },
    { icon: "😰", label: "Anxious" },
    { icon: "😐", label: "Neutral" },
    { icon: "😌", label: "Calm" },
    { icon: "🧘", label: "Zen" },
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
const MOOD_KEY = "synapse-burnout-mood";
const SOUND_KEY = "synapse-burnout-sound";

export default function BurnoutView() {
    const setMode = useEnergyStore((state) => state.setMode);
    const persona = useEnergyStore((state) => state.persona);

    // Theme state (default: dark)
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Mood state
    const [mood, setMood] = useState<string | null>(null);

    // Breathing state
    const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [isBreathingActive, setIsBreathingActive] = useState(false);

    // Hold-to-activate state (3 second hold)
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const holdStartTimeRef = useRef<number>(0);
    const HOLD_DURATION = 3000; // 3 seconds to activate

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Sound State
    const [isSoundOn, setIsSoundOn] = useState(false);
    const [selectedSound, setSelectedSound] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pendingPlayRef = useRef(false); // Track if we need to play after audio is ready

    // Breathing Modal State
    const [isBreathingOpen, setIsBreathingOpen] = useState(false);

    // Safety Plan Modal State
    const [isSafetyPlanOpen, setIsSafetyPlanOpen] = useState(false);

    // Quick Journal State
    const [isJournalOpen, setIsJournalOpen] = useState(false);

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

    // Load mood from localStorage
    useEffect(() => {
        try {
            const savedMood = localStorage.getItem(MOOD_KEY);
            if (savedMood) {
                setMood(savedMood);
            }
        } catch (error) {
            console.error("Failed to load mood:", error);
        }
    }, []);

    // Save mood to localStorage
    useEffect(() => {
        if (mood) {
            try {
                localStorage.setItem(MOOD_KEY, mood);
            } catch (error) {
                console.error("Failed to save mood:", error);
            }
        }
    }, [mood]);

    // Breathing Animation Loop - only runs when activated
    useEffect(() => {
        if (!isBreathingActive) return;

        const interval = setInterval(() => {
            setBreathingPhase((prev) => {
                if (prev === "inhale") return "hold";
                if (prev === "hold") return "exhale";
                return "inhale";
            });
        }, 4000);
        return () => clearInterval(interval);
    }, [isBreathingActive]);

    // Hold-to-activate handlers
    const handleHoldStart = () => {
        setIsHolding(true);
        holdStartTimeRef.current = Date.now();
        setHoldProgress(0);

        // Update progress every 30ms
        holdTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - holdStartTimeRef.current;
            const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setHoldProgress(progress);

            // Activate breathing when hold completes
            if (elapsed >= HOLD_DURATION) {
                setIsBreathingActive(true);
                setIsHolding(false);
                setHoldProgress(0);
                if (holdTimerRef.current) {
                    clearInterval(holdTimerRef.current);
                }
            }
        }, 30);
    };

    const handleHoldEnd = () => {
        setIsHolding(false);
        setHoldProgress(0);
        if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
        }
    };

    // Cleanup hold timer on unmount
    useEffect(() => {
        return () => {
            if (holdTimerRef.current) {
                clearInterval(holdTimerRef.current);
            }
        };
    }, []);

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

        // Pause current audio if playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const audio = new Audio(soundOption.url);
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;

        // Handle canplaythrough event for pending play
        const handleCanPlay = () => {
            if (pendingPlayRef.current) {
                audio.play().catch(console.error);
                pendingPlayRef.current = false;
            }
        };
        audio.addEventListener('canplaythrough', handleCanPlay);

        // If sound was already on (e.g., on initial load), try to play
        if (isSoundOn) {
            audio.play().catch(() => {
                // If play fails (common on first interaction), set pending
                pendingPlayRef.current = true;
            });
        }

        // Save preference
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

    // Watch for isSoundOn changes to play/pause
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

    const toggleSound = () => {
        if (!audioRef.current) return;
        setIsSoundOn(!isSoundOn);
    };

    const handleSoundSelect = (soundId: string) => {
        if (selectedSound === soundId && isSoundOn) {
            // Same sound clicked while playing - stop it
            setIsSoundOn(false);
        } else if (selectedSound === soundId && !isSoundOn) {
            // Same sound but not playing - play it
            setIsSoundOn(true);
        } else {
            // Different sound - select it and play
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
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setChatMessages((prev) => [...prev, { role: "ai", content: data.message }]);
                // Award wellness points for chat interaction
                addWellnessPoints("chat", 3);
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsChatLoading(false);
        }
    };

    const userName = persona?.name || "friend";

    // Theme-aware classes
    const theme = {
        // Main background
        bg: isDarkMode
            ? "from-[#0f1a2e] via-[#1a2642] to-[#2a1f4e]"
            : "from-orange-50 via-[#F5F0E6] to-amber-100",
        // Text colors
        text: isDarkMode ? "text-white" : "text-slate-800",
        textMuted: isDarkMode ? "text-white/60" : "text-slate-500",
        textSubtle: isDarkMode ? "text-white/40" : "text-slate-400",
        // Blob colors
        blob1: isDarkMode ? "bg-indigo-500/20" : "bg-orange-200/30",
        blob2: isDarkMode ? "bg-purple-500/20" : "bg-amber-200/30",
        blob3: isDarkMode ? "bg-blue-500/15" : "bg-orange-100/40",
        // UI elements
        cardBg: isDarkMode ? "bg-white/10 border-white/10" : "bg-white/70 border-orange-200/50",
        buttonBg: isDarkMode ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-white/60 border-orange-200/50 hover:bg-white/80",
        buttonText: isDarkMode ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-slate-800",
        // Breathing sphere
        sphereGradient: isDarkMode ? "from-[#4fd1c5] to-[#2dd4bf]" : "from-orange-400 to-amber-500",
        sphereGlow: isDarkMode ? "rgba(79,209,197,0.4)" : "rgba(251,146,60,0.4)",
        sphereGlowStrong: isDarkMode ? "rgba(79,209,197,0.6)" : "rgba(251,146,60,0.6)",
        sphereGlowWeak: isDarkMode ? "rgba(79,209,197,0.2)" : "rgba(251,146,60,0.2)",
        sphereText: isDarkMode ? "text-[#0f1a2e]" : "text-white",
        sphereBorder: isDarkMode ? "border-[#4fd1c5]/30" : "border-orange-300/30",
        sphereBorderWeak: isDarkMode ? "border-[#4fd1c5]/20" : "border-orange-200/20",
        // Chat
        userBubble: isDarkMode ? "bg-[#2dd4bf] text-[#0f1a2e]" : "bg-orange-500 text-white shadow-lg shadow-orange-200",
        aiBubble: isDarkMode ? "bg-white/10 border-white/10 text-white/90" : "bg-white/70 border-orange-100 text-slate-700",
        loadingDot: isDarkMode ? "bg-[#4fd1c5]" : "bg-orange-400",
        pillBg: isDarkMode ? "bg-white/10 border-white/10" : "bg-white/70 border-orange-200/50",
        pillText: isDarkMode ? "text-white/70 hover:text-white hover:bg-white/20" : "text-slate-600 hover:text-slate-800 hover:bg-white",
        inputBg: isDarkMode ? "bg-white/10 border-white/10 focus:border-[#4fd1c5]/50 text-white placeholder-white/30" : "bg-white/70 border-orange-200/50 focus:border-orange-400 text-slate-700 placeholder-slate-400",
        sendBtn: isDarkMode ? "bg-[#2dd4bf] hover:bg-[#4fd1c5] text-[#0f1a2e]" : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200",
        // Decorative
        gridOpacity: "opacity-[0.03]",
        emojiOpacity: isDarkMode ? "opacity-[0.15]" : "opacity-10",
        geometricBorder: isDarkMode ? "border-indigo-300/20" : "border-orange-300/20",
        // Mood card
        moodCardBg: isDarkMode ? "bg-white/10 border-white/10" : "bg-white/70 border-orange-200/50",
        moodSelected: isDarkMode ? "ring-2 ring-[#4fd1c5]" : "ring-2 ring-orange-400",
    };

    return (
        <div className={`h-screen bg-gradient-to-br ${theme.bg} ${theme.text} font-sans relative overflow-hidden transition-all duration-500`}>
            {/* Global Template Styles */}
            <style jsx global>{`
                .glass-panel-burnout {
                    background: ${isDarkMode ? 'rgba(30, 41, 59, 0.65)' : 'rgba(255, 255, 255, 0.65)'};
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)'};
                }
                .clay-card-burnout {
                    background-color: ${isDarkMode ? '#1e293b' : '#FDFBF7'};
                    border-radius: 1.5rem;
                    box-shadow: ${isDarkMode
                    ? '8px 8px 16px 0px rgba(0, 0, 0, 0.4), -8px -8px 16px 0px rgba(255, 255, 255, 0.02)'
                    : '8px 8px 16px 0px #E6E1D6, -8px -8px 16px 0px #FFFFFF'};
                }
            `}</style>
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                {/* Blobs */}
                <div className={`absolute top-[10%] right-[-10%] w-96 h-96 ${theme.blob1} rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-56 h-56 ${theme.blob2} rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob animation-delay-2000`} />
                <div className={`absolute top-[40%] left-[10%] w-64 h-64 ${theme.blob3} rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000`} />

                {/* Grid Pattern */}
                <div className={`absolute inset-0 ${theme.gridOpacity}`} style={{
                    backgroundImage: `linear-gradient(${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />

                {/* Floating Decorative Emojis */}
                <div className={`absolute top-20 right-16 ${theme.emojiOpacity} animate-float`}>
                    <span className="text-6xl">🔋</span>
                </div>
                <div className={`absolute bottom-32 left-16 ${theme.emojiOpacity} animate-float animation-delay-2000`}>
                    <span className="text-5xl">☕</span>
                </div>
                <div className={`absolute top-[30%] left-[8%] ${theme.emojiOpacity} animate-float animation-delay-1000`}>
                    <span className="text-4xl">🌙</span>
                </div>
                <div className={`absolute bottom-[20%] right-[12%] ${theme.emojiOpacity} animate-float animation-delay-3000`}>
                    <span className="text-5xl">☁️</span>
                </div>
                <div className={`absolute top-[50%] right-[5%] ${theme.emojiOpacity} animate-pulse`}>
                    <span className="text-4xl">😌</span>
                </div>
                <div className={`absolute bottom-[40%] left-[3%] ${theme.emojiOpacity} animate-float animation-delay-1500`}>
                    <span className="text-3xl">🧘</span>
                </div>

                {/* Geometric Accents */}
                <div className={`absolute top-[15%] left-[15%] w-12 h-12 border-4 ${theme.geometricBorder} rounded-xl rotate-45 animate-float animation-delay-2000`} />
                <div className={`absolute bottom-[25%] right-[20%] w-8 h-8 border-2 ${theme.geometricBorder} rounded-full animate-float`} />
            </div>

            {/* Top Left: Music Controls */}
            <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
                {/* Music Card */}
                <div className={`backdrop-blur-sm border rounded-2xl p-3 shadow-lg ${theme.moodCardBg} transition-all duration-300`}>
                    {/* Music Icon */}
                    <div className={`flex items-center justify-center mb-3 ${theme.textMuted}`}>
                        <Music size={20} />
                    </div>

                    {/* Sound Options - Vertical */}
                    <div className="flex flex-col gap-2">
                        {SOUND_OPTIONS.map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => handleSoundSelect(sound.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm ${selectedSound === sound.id && isSoundOn
                                    ? `${theme.sendBtn} scale-105`
                                    : `${theme.pillBg} ${theme.pillText} hover:scale-105`
                                    }`}
                            >
                                <span className="text-lg">{sound.icon}</span>
                                <span className={`text-xs ${selectedSound === sound.id && isSoundOn ? '' : theme.textMuted}`}>
                                    {sound.label.split(' ')[0]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Breathing Button - Separate Card */}
                <button
                    onClick={() => setIsBreathingOpen(true)}
                    className={`backdrop-blur-sm border rounded-2xl p-3 shadow-lg ${theme.moodCardBg} flex items-center justify-center gap-2 transition-all text-sm ${theme.pillText} hover:scale-105`}
                >
                    <Wind size={18} />
                    <span>Breathe</span>
                </button>

                {/* Quick Journal Button - Separate Card */}
                <button
                    onClick={() => setIsJournalOpen(true)}
                    className={`backdrop-blur-sm border rounded-2xl p-3 shadow-lg ${theme.moodCardBg} flex items-center justify-center gap-2 transition-all text-sm ${theme.pillText} hover:scale-105`}
                >
                    <BookHeart size={18} />
                    <span>Jurnal</span>
                </button>
            </div>

            {/* Top Right: Exit Button */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={() => setMode(null)}
                    className={`flex items-center gap-2 ${theme.textMuted} hover:${theme.text} transition-colors text-sm`}
                >
                    <ArrowLeft size={16} />
                    <span>exit</span>
                </button>
            </div>

            {/* Right Side: Growth Garden */}
            <div className="absolute right-4 top-20 z-40 w-80">
                <GrowthGarden />
            </div>

            {/* Bottom Right: Theme Toggle */}
            <div className="absolute bottom-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${theme.buttonBg} ${theme.buttonText} text-sm shadow-lg cursor-pointer select-none
                        hover:scale-105 hover:shadow-xl
                        active:scale-90
                    `}
                >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{isDarkMode ? "Light" : "Dark"}</span>
                </button>
            </div>

            {/* Bottom Left: Safety Plan Emergency Button */}
            <div className="absolute bottom-6 left-6 z-50">
                <button
                    onClick={() => setIsSafetyPlanOpen(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border bg-red-500/20 border-red-500/50 text-red-400 text-sm shadow-lg cursor-pointer select-none
                        hover:scale-105 hover:shadow-xl hover:bg-red-500/30
                        active:scale-90
                    `}
                >
                    <Shield size={16} />
                    <span>Safety Plan</span>
                </button>
            </div>


            {/* Main Content - Full Height Chat */}
            <div className="h-full w-full flex flex-col items-center pt-16 pb-8 px-4 relative z-10">

                {/* Greeting */}
                <p className={`${theme.textMuted} text-lg font-light italic mb-4`}>
                    hey {userName.toLowerCase()}, i'm here.
                </p>

                {/* Chat Container */}
                <div className="flex-1 w-full max-w-2xl flex flex-col min-h-0">
                    {/* Chat Messages - Hidden scrollbar */}
                    <div className="flex-1 overflow-y-auto px-2 space-y-4 min-h-0 mb-4 scrollbar-hide">
                        {chatMessages.length === 0 && (
                            <div className={`text-center ${theme.textSubtle} py-8`}>
                                <p className="italic">take your time. i'm listening.</p>
                            </div>
                        )}
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-sm border ${msg.role === "user"
                                    ? `${theme.userBubble} rounded-br-md`
                                    : `${theme.aiBubble} rounded-bl-md`
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className={`backdrop-blur-sm border px-4 py-3 rounded-2xl rounded-bl-md ${theme.aiBubble}`}>
                                    <div className="flex gap-1">
                                        <span className={`w-2 h-2 ${theme.loadingDot} rounded-full animate-bounce`} />
                                        <span className={`w-2 h-2 ${theme.loadingDot} rounded-full animate-bounce [animation-delay:0.1s]`} />
                                        <span className={`w-2 h-2 ${theme.loadingDot} rounded-full animate-bounce [animation-delay:0.2s]`} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Reply Pills - Squishy buttons */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4 px-4">
                        {DEFAULT_PILLS.map((pill, index) => (
                            <button
                                key={index}
                                onClick={() => sendMessage(pill.text)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm border ${theme.pillBg} ${theme.pillText} text-sm shadow-sm cursor-pointer select-none
                                    transition-all duration-150 ease-out
                                    hover:scale-105 hover:shadow-md
                                    active:scale-90 active:shadow-sm
                                `}
                            >
                                <span className="text-base">{pill.emoji}</span>
                                <span className="font-medium">{pill.text}</span>
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-3 px-4">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)}
                            placeholder="or just type..."
                            className={`flex-1 backdrop-blur-sm border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all shadow-sm ${theme.inputBg}`}
                        />
                        <button
                            onClick={() => sendMessage(chatInput)}
                            disabled={!chatInput.trim() || isChatLoading}
                            className={`${theme.sendBtn} px-4 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                {/* Bottom Quote */}
                <p className={`${theme.textSubtle} text-sm italic mt-6`}>
                    "it's okay to rest. you're doing enough."
                </p>
            </div>

            {/* Decorative Elements - Bottom Left */}
            <div className="absolute bottom-8 left-8 opacity-30 pointer-events-none z-0">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <path d="M10 50 Q30 30, 50 50" stroke="currentColor" strokeWidth="1" className={isDarkMode ? "text-indigo-300" : "text-orange-300"} />
                    <circle cx="15" cy="45" r="3" fill="currentColor" className={isDarkMode ? "text-indigo-200" : "text-orange-200"} />
                </svg>
            </div>

            {/* Custom styles */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                /* Squishy button animation */
                button {
                    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease;
                }
            `}</style>

            {/* Breathing Modal */}
            <BreathingModal
                isOpen={isBreathingOpen}
                onClose={() => setIsBreathingOpen(false)}
            />

            {/* Safety Plan Modal */}
            <SafetyPlanModal
                isOpen={isSafetyPlanOpen}
                onClose={() => setIsSafetyPlanOpen(false)}
                isDarkMode={isDarkMode}
            />

            {/* Quick Journal Modal */}
            <QuickJournal
                isOpen={isJournalOpen}
                onClose={() => setIsJournalOpen(false)}
                isDarkMode={isDarkMode}
            />
        </div>
    );
}
