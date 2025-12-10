"use client";

import { useState, useEffect, useRef } from "react";
import { useEnergyStore } from "@/store/useEnergyStore";
import { ArrowLeft, Moon, Sun, Send, Music, Wind } from "lucide-react";
import BreathingModal from "./BreathingModal";

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

    // Breathing Modal State
    const [isBreathingOpen, setIsBreathingOpen] = useState(false);

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
        }

        audioRef.current = new Audio(soundOption.url);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;

        // Resume playing if sound was on
        if (isSoundOn) {
            audioRef.current.play().catch(() => { });
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
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [selectedSound]);

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
        if (isSoundOn) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => { });
        }
        setIsSoundOn(!isSoundOn);
    };

    const handleSoundSelect = (soundId: string) => {
        if (selectedSound === soundId && isSoundOn) {
            // Same sound clicked while playing - stop it
            audioRef.current?.pause();
            setIsSoundOn(false);
        } else {
            // Different sound or not playing - play it
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
        // Main background - deeper, more immersive gradients
        bg: isDarkMode
            ? "from-[#0a1120] via-[#131b2e] to-[#1a1535]"
            : "from-amber-50 via-[#FDF8F3] to-orange-50",
        // Text colors - softer for relaxation
        text: isDarkMode ? "text-white/95" : "text-slate-800",
        textMuted: isDarkMode ? "text-white/70" : "text-slate-600",
        textSubtle: isDarkMode ? "text-white/50" : "text-slate-400",
        // Blob colors - more vibrant, layered
        blob1: isDarkMode ? "bg-cyan-500/25" : "bg-orange-300/35",
        blob2: isDarkMode ? "bg-purple-600/20" : "bg-amber-200/40",
        blob3: isDarkMode ? "bg-teal-500/20" : "bg-rose-100/30",
        blob4: isDarkMode ? "bg-indigo-600/15" : "bg-yellow-200/25",
        // UI elements - enhanced glassmorphism
        cardBg: isDarkMode 
            ? "bg-white/[0.08] border-white/[0.12] backdrop-blur-xl" 
            : "bg-white/80 border-orange-100/60 backdrop-blur-xl shadow-lg shadow-orange-100/20",
        buttonBg: isDarkMode 
            ? "bg-white/[0.08] border-white/[0.12] hover:bg-white/[0.15] backdrop-blur-lg" 
            : "bg-white/70 border-orange-100/50 hover:bg-white/90 backdrop-blur-lg",
        buttonText: isDarkMode ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-800",
        // Breathing sphere - glowing effect
        sphereGradient: isDarkMode ? "from-cyan-400 via-teal-400 to-emerald-400" : "from-orange-400 via-amber-400 to-yellow-400",
        sphereGlow: isDarkMode ? "rgba(34,211,238,0.4)" : "rgba(251,146,60,0.4)",
        sphereGlowStrong: isDarkMode ? "rgba(34,211,238,0.6)" : "rgba(251,146,60,0.6)",
        sphereGlowWeak: isDarkMode ? "rgba(34,211,238,0.15)" : "rgba(251,146,60,0.15)",
        sphereText: isDarkMode ? "text-slate-900" : "text-white",
        sphereBorder: isDarkMode ? "border-cyan-400/40" : "border-orange-300/40",
        sphereBorderWeak: isDarkMode ? "border-cyan-400/20" : "border-orange-200/20",
        // Chat - premium bubble styling
        userBubble: isDarkMode 
            ? "bg-gradient-to-br from-cyan-500 to-teal-500 text-slate-900 shadow-lg shadow-cyan-500/20" 
            : "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50",
        aiBubble: isDarkMode 
            ? "bg-white/[0.08] border-white/[0.15] text-white/90 backdrop-blur-lg" 
            : "bg-white/85 border-orange-100/60 text-slate-700 backdrop-blur-lg shadow-md shadow-orange-50",
        loadingDot: isDarkMode ? "bg-cyan-400" : "bg-orange-400",
        pillBg: isDarkMode 
            ? "bg-white/[0.08] border-white/[0.12] backdrop-blur-lg" 
            : "bg-white/80 border-orange-100/50 backdrop-blur-lg shadow-sm",
        pillText: isDarkMode 
            ? "text-white/80 hover:text-white hover:bg-white/[0.15]" 
            : "text-slate-600 hover:text-slate-800 hover:bg-white",
        inputBg: isDarkMode 
            ? "bg-white/[0.08] border-white/[0.12] focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-white/40 backdrop-blur-lg" 
            : "bg-white/80 border-orange-100/50 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-200/50 text-slate-700 placeholder-slate-400 backdrop-blur-lg shadow-inner",
        sendBtn: isDarkMode 
            ? "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-900 shadow-lg shadow-cyan-500/25" 
            : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg shadow-orange-200/50",
        // Decorative - more visible
        gridOpacity: "opacity-[0.02]",
        emojiOpacity: isDarkMode ? "opacity-[0.12]" : "opacity-[0.08]",
        geometricBorder: isDarkMode ? "border-cyan-300/15" : "border-orange-300/20",
        // Mood card - enhanced
        moodCardBg: isDarkMode 
            ? "bg-white/[0.08] border-white/[0.12] backdrop-blur-xl" 
            : "bg-white/80 border-orange-100/50 backdrop-blur-xl shadow-lg shadow-orange-50",
        moodSelected: isDarkMode ? "ring-2 ring-cyan-400/80 bg-cyan-400/10" : "ring-2 ring-orange-400/80 bg-orange-50",
        // New: accent colors for glows
        accentGlow: isDarkMode ? "cyan-400" : "orange-400",
        accentColor: isDarkMode ? "#22d3ee" : "#fb923c",
    };

    return (
        <div className={`h-screen bg-gradient-to-br ${theme.bg} ${theme.text} font-sans relative overflow-hidden transition-all duration-500`}>
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                {/* Enhanced Blobs with more layers */}
                <div className={`absolute top-[5%] right-[-15%] w-[500px] h-[500px] ${theme.blob1} rounded-full mix-blend-screen filter blur-[100px] animate-blob`} />
                <div className={`absolute bottom-[-15%] left-[-15%] w-[400px] h-[400px] ${theme.blob2} rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000`} />
                <div className={`absolute top-[35%] left-[5%] w-[350px] h-[350px] ${theme.blob3} rounded-full mix-blend-screen filter blur-[90px] animate-blob animation-delay-4000`} />
                <div className={`absolute top-[60%] right-[10%] w-[300px] h-[300px] ${theme.blob4} rounded-full mix-blend-screen filter blur-[70px] animate-blob animation-delay-3000`} />

                {/* Floating Particles - small glowing dots */}
                <div className="absolute inset-0">
                    {/* Large particles */}
                    <div className={`absolute top-[15%] left-[20%] w-3 h-3 rounded-full ${isDarkMode ? 'bg-cyan-400/40' : 'bg-orange-400/30'} animate-float-slow`} style={{ animationDelay: '0s' }} />
                    <div className={`absolute top-[25%] right-[25%] w-2 h-2 rounded-full ${isDarkMode ? 'bg-teal-400/50' : 'bg-amber-400/40'} animate-float-slow`} style={{ animationDelay: '2s' }} />
                    <div className={`absolute bottom-[30%] left-[15%] w-4 h-4 rounded-full ${isDarkMode ? 'bg-purple-400/30' : 'bg-rose-300/30'} animate-float-slow`} style={{ animationDelay: '1s' }} />
                    <div className={`absolute top-[45%] right-[10%] w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-cyan-300/40' : 'bg-orange-300/35'} animate-float-slow`} style={{ animationDelay: '3s' }} />
                    <div className={`absolute bottom-[20%] right-[30%] w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-400/35' : 'bg-yellow-400/30'} animate-float-slow`} style={{ animationDelay: '1.5s' }} />
                    <div className={`absolute top-[70%] left-[25%] w-2 h-2 rounded-full ${isDarkMode ? 'bg-teal-300/45' : 'bg-orange-300/40'} animate-float-slow`} style={{ animationDelay: '2.5s' }} />
                    {/* Medium particles */}
                    <div className={`absolute top-[10%] left-[45%] w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-orange-600/15'} animate-twinkle`} style={{ animationDelay: '0.5s' }} />
                    <div className={`absolute top-[55%] left-[8%] w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white/25' : 'bg-amber-600/20'} animate-twinkle`} style={{ animationDelay: '1.5s' }} />
                    <div className={`absolute bottom-[45%] right-[15%] w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-orange-500/15'} animate-twinkle`} style={{ animationDelay: '2.5s' }} />
                    <div className={`absolute top-[75%] right-[40%] w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white/15' : 'bg-rose-500/15'} animate-twinkle`} style={{ animationDelay: '0s' }} />
                    {/* Small sparkles */}
                    <div className={`absolute top-[20%] right-[45%] w-1 h-1 rounded-full ${isDarkMode ? 'bg-cyan-200/60' : 'bg-orange-400/50'} animate-pulse`} />
                    <div className={`absolute bottom-[35%] left-[40%] w-1 h-1 rounded-full ${isDarkMode ? 'bg-teal-200/50' : 'bg-amber-400/45'} animate-pulse`} style={{ animationDelay: '1s' }} />
                    <div className={`absolute top-[40%] left-[60%] w-1 h-1 rounded-full ${isDarkMode ? 'bg-purple-200/40' : 'bg-orange-300/40'} animate-pulse`} style={{ animationDelay: '2s' }} />
                </div>

                {/* Subtle Grid Pattern */}
                <div className={`absolute inset-0 ${theme.gridOpacity}`} style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 0)`,
                    backgroundSize: '50px 50px'
                }} />

                {/* Floating Decorative Emojis - more subtle */}
                <div className={`absolute top-16 right-20 ${theme.emojiOpacity} animate-float`} style={{ animationDuration: '8s' }}>
                    <span className="text-5xl blur-[0.5px]">🌙</span>
                </div>
                <div className={`absolute bottom-28 left-20 ${theme.emojiOpacity} animate-float`} style={{ animationDuration: '10s', animationDelay: '2s' }}>
                    <span className="text-4xl blur-[0.5px]">☁️</span>
                </div>
                <div className={`absolute top-[28%] left-[6%] ${theme.emojiOpacity} animate-float`} style={{ animationDuration: '9s', animationDelay: '1s' }}>
                    <span className="text-3xl blur-[0.5px]">✨</span>
                </div>
                <div className={`absolute bottom-[22%] right-[8%] ${theme.emojiOpacity} animate-float`} style={{ animationDuration: '11s', animationDelay: '3s' }}>
                    <span className="text-4xl blur-[0.5px]">💫</span>
                </div>

                {/* Geometric Accents with glow */}
                <div className={`absolute top-[18%] left-[18%] w-16 h-16 border-2 ${theme.geometricBorder} rounded-2xl rotate-12 animate-float`} style={{ animationDuration: '12s' }} />
                <div className={`absolute bottom-[28%] right-[22%] w-10 h-10 border ${theme.geometricBorder} rounded-full animate-float`} style={{ animationDuration: '14s', animationDelay: '2s' }} />
                <div className={`absolute top-[55%] right-[5%] w-6 h-6 border ${theme.geometricBorder} rounded-lg rotate-45 animate-float`} style={{ animationDuration: '10s', animationDelay: '1s' }} />
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


            {/* Main Content - Full Height Chat */}
            <div className="h-full w-full flex flex-col items-center pt-16 pb-8 px-4 relative z-10">

                {/* Greeting - with fade-in animation */}
                <p className={`${theme.textMuted} text-xl font-light italic mb-6 animate-fade-in-up tracking-wide`} style={{ animationDelay: '0.2s' }}>
                    hey {userName.toLowerCase()}, i'm here.
                </p>

                {/* Chat Container */}
                <div className="flex-1 w-full max-w-2xl flex flex-col min-h-0">
                    {/* Chat Messages - Hidden scrollbar with smooth animations */}
                    <div className="flex-1 overflow-y-auto px-2 space-y-5 min-h-0 mb-4 scrollbar-hide">
                        {chatMessages.length === 0 && (
                            <div className={`text-center ${theme.textSubtle} py-12 animate-fade-in-up`}>
                                <div className="text-4xl mb-4 opacity-50">🌿</div>
                                <p className="italic text-lg">take your time. i'm listening.</p>
                                <p className="text-sm mt-2 opacity-70">this is a safe space</p>
                            </div>
                        )}
                        {chatMessages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                {msg.role === "ai" && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20' : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                                        <span className="text-sm">😌</span>
                                    </div>
                                )}
                                <div className={`max-w-[80%] px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed transition-all duration-300 ${msg.role === "user"
                                    ? `${theme.userBubble} rounded-br-lg`
                                    : `${theme.aiBubble} rounded-bl-lg`
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start animate-fade-in-up">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20' : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                                    <span className="text-sm animate-pulse">😌</span>
                                </div>
                                <div className={`px-5 py-4 rounded-3xl rounded-bl-lg ${theme.aiBubble}`}>
                                    <div className="flex gap-1.5">
                                        <span className={`w-2.5 h-2.5 ${theme.loadingDot} rounded-full animate-bounce`} />
                                        <span className={`w-2.5 h-2.5 ${theme.loadingDot} rounded-full animate-bounce [animation-delay:0.15s]`} />
                                        <span className={`w-2.5 h-2.5 ${theme.loadingDot} rounded-full animate-bounce [animation-delay:0.3s]`} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Reply Pills - Premium squishy buttons */}
                    <div className="flex flex-wrap justify-center gap-3 mb-5 px-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        {DEFAULT_PILLS.map((pill, index) => (
                            <button
                                key={index}
                                onClick={() => sendMessage(pill.text)}
                                className={`group flex items-center gap-2.5 px-5 py-3 rounded-2xl border ${theme.pillBg} ${theme.pillText} text-sm cursor-pointer select-none
                                    transition-all duration-200 ease-out
                                    hover:scale-[1.03] hover:shadow-lg
                                    active:scale-95 active:shadow-sm
                                `}
                                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                            >
                                <span className="text-lg group-hover:scale-110 transition-transform duration-200">{pill.emoji}</span>
                                <span className="font-medium">{pill.text}</span>
                            </button>
                        ))}
                    </div>

                    {/* Input Area - Enhanced */}
                    <div className="flex gap-3 px-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage(chatInput)}
                            placeholder="or just type..."
                            className={`flex-1 border rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none transition-all duration-300 ${theme.inputBg}`}
                        />
                        <button
                            onClick={() => sendMessage(chatInput)}
                            disabled={!chatInput.trim() || isChatLoading}
                            className={`${theme.sendBtn} px-5 py-3.5 rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>

                {/* Bottom Quote - Enhanced */}
                <p className={`${theme.textSubtle} text-sm italic mt-8 animate-fade-in-up tracking-wide opacity-80`} style={{ animationDelay: '0.6s' }}>
                    ✨ "it's okay to rest. you're doing enough." ✨
                </p>
            </div>

            {/* Decorative Elements - Bottom Left */}
            <div className="absolute bottom-8 left-8 opacity-30 pointer-events-none z-0">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <path d="M10 50 Q30 30, 50 50" stroke="currentColor" strokeWidth="1" className={isDarkMode ? "text-indigo-300" : "text-orange-300"} />
                    <circle cx="15" cy="45" r="3" fill="currentColor" className={isDarkMode ? "text-indigo-200" : "text-orange-200"} />
                </svg>
            </div>

            {/* Custom styles - Enhanced animations */}
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
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
                }
                /* Fade in up animation */
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                    opacity: 0;
                }
                /* Slow float animation */
                @keyframes float-slow {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                        opacity: 0.6;
                    }
                    25% {
                        transform: translateY(-15px) translateX(5px);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateY(-8px) translateX(-5px);
                        opacity: 0.5;
                    }
                    75% {
                        transform: translateY(-20px) translateX(3px);
                        opacity: 0.7;
                    }
                }
                .animate-float-slow {
                    animation: float-slow 15s ease-in-out infinite;
                }
                /* Twinkle animation */
                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.2;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.2);
                    }
                }
                .animate-twinkle {
                    animation: twinkle 4s ease-in-out infinite;
                }
            `}</style>

            {/* Breathing Modal */}
            <BreathingModal
                isOpen={isBreathingOpen}
                onClose={() => setIsBreathingOpen(false)}
            />
        </div>
    );
}
