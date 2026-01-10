"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEnergyStore } from "@/store/useEnergyStore";
import {
    Send, Bot, ArrowLeft, Sparkles, MessageSquare, Zap, Brain, ChevronDown,
    Plus, Trash2, Menu, PanelLeftClose, BookOpen, Lightbulb, HelpCircle,
    CheckCircle, RotateCcw, GraduationCap, Layers, BookMarked, GitBranch
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

// Dynamic import for MindMapCanvas to avoid SSR issues with react-flow
const MindMapCanvas = dynamic(() => import("./MindMapCanvas"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#111722]">
            <div className="text-[#92a4c9] animate-pulse">Loading Mind Map...</div>
        </div>
    ),
});

// Types
interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

interface Flashcard {
    id: string;
    type: "concept" | "term";
    title: string;
    description: string;
}

interface KeyTakeaway {
    id: string;
    content: string;
}

// LocalStorage helpers
const STORAGE_KEY = "study-mode-conversations";

const loadConversations = (): Conversation[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveConversations = (conversations: Conversation[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const generateTitle = (messages: ChatMessage[]): string => {
    const firstUserMsg = messages.find(m => m.role === "user");
    if (!firstUserMsg) return "New Study Session";
    return firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "");
};

// Empty topics by default - user will create their own
const TOPICS_STORAGE_KEY = "study-mode-topics";
const ACTIVE_TOPIC_KEY = "study-mode-active-topic";

const sampleFlashcards: Flashcard[] = [
    { id: "1", type: "concept", title: "Backpropagation", description: "The algorithm used to calculate the gradient of the loss function..." },
    { id: "2", type: "term", title: "Weight", description: "A parameter within a neural network that transforms input data..." },
];

const sampleTakeaways: KeyTakeaway[] = [
    { id: "1", content: "Backpropagation is the method of calculating gradients." },
    { id: "2", content: "Error rate determines the magnitude of weight adjustments." },
];

export default function StudyModeView() {
    const router = useRouter();
    const persona = useEnergyStore((state) => state.persona);

    // Conversation state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // UI state
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [knowledgeRailOpen, setKnowledgeRailOpen] = useState(true);
    const [activeTopic, setActiveTopic] = useState({ id: "1", name: "", icon: "📚", active: true });
    const [masteryProgress, setMasteryProgress] = useState(65);
    const [flashcards, setFlashcards] = useState<Flashcard[]>(sampleFlashcards);
    const [takeaways, setTakeaways] = useState<KeyTakeaway[]>(sampleTakeaways);
    const [viewMode, setViewMode] = useState<"chat" | "mindmap">("chat");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [attachments, setAttachments] = useState<{ data: string; mimeType: string; name: string }[]>([]);
    const [showMindmapSuggestion, setShowMindmapSuggestion] = useState(false);
    const [isGeneratingMindmap, setIsGeneratingMindmap] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load conversations from localStorage on mount
    useEffect(() => {
        const loaded = loadConversations();
        setConversations(loaded);
        if (loaded.length > 0) {
            const mostRecent = loaded.sort((a, b) => b.updatedAt - a.updatedAt)[0];
            setCurrentConversationId(mostRecent.id);
            setMessages(mostRecent.messages);
        }

        // Load saved topic from localStorage
        const savedTopic = localStorage.getItem(ACTIVE_TOPIC_KEY);
        if (savedTopic) {
            try {
                setActiveTopic(JSON.parse(savedTopic));
            } catch {
                // Ignore parsing errors
            }
        }
    }, []);

    // Save to localStorage when conversations change
    useEffect(() => {
        if (conversations.length > 0) {
            saveConversations(conversations);
        }
    }, [conversations]);

    // Sync current messages to conversation
    useEffect(() => {
        if (currentConversationId && messages.length > 0) {
            setConversations(prev => prev.map(conv =>
                conv.id === currentConversationId
                    ? { ...conv, messages, title: generateTitle(messages), updatedAt: Date.now() }
                    : conv
            ));
        }
    }, [messages, currentConversationId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const startNewSession = useCallback(() => {
        const newConv: Conversation = {
            id: generateId(),
            title: "New Study Session",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
        setMessages([]);
    }, []);

    const selectConversation = useCallback((conv: Conversation) => {
        setCurrentConversationId(conv.id);
        setMessages(conv.messages);
    }, []);

    const deleteConversation = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConversations(prev => {
            const updated = prev.filter(c => c.id !== id);
            saveConversations(updated);
            return updated;
        });
        if (currentConversationId === id) {
            setCurrentConversationId(null);
            setMessages([]);
        }
    }, [currentConversationId]);

    const handleSend = async () => {
        if (!input.trim()) return;

        if (!currentConversationId) {
            const newConv: Conversation = {
                id: generateId(),
                title: "New Study Session",
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            setConversations(prev => [newConv, ...prev]);
            setCurrentConversationId(newConv.id);
        }

        const userMsg: ChatMessage = { role: "user", content: input || (attachments.length > 0 ? "[File attached]" : "") };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        const currentAttachments = [...attachments];
        setAttachments([]);
        setIsLoading(true);

        try {
            const currentHistory = [...messages, userMsg];

            const response = await fetch("/api/chat-productive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: currentHistory,
                    message: userMsg.content,
                    persona,
                    thinkingMode: "dynamic",
                    studyMode: true,
                    topic: activeTopic.name,
                    attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, { role: "ai", content: data.message }]);

                // Simulate mastery progress increase
                setMasteryProgress(prev => Math.min(prev + 2, 100));
            }
        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (action: string) => {
        setInput(action);
    };

    // File upload handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("File terlalu besar. Maksimal 10MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            setAttachments([{ data: base64, mimeType: file.type, name: file.name }]);
        };
        reader.readAsDataURL(file);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Review Cards handlers
    const startReview = () => {
        setCurrentCardIndex(0);
        setShowReviewModal(true);
    };

    const nextCard = () => {
        if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            setShowReviewModal(false);
            setMasteryProgress(prev => Math.min(prev + 5, 100));
        }
    };

    const prevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    // Generate mindmap from conversation - using Task Decomposition technique
    const generateMindmapFromChat = useCallback(async () => {
        setIsGeneratingMindmap(true);
        setShowMindmapSuggestion(false);

        try {
            // Extract topics from recent messages
            const recentMessages = messages.slice(-10).map(m => m.content).join("\n");

            const response = await fetch("/api/chat-productive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Kamu adalah ahli Task Decomposition. Berdasarkan percakapan berikut, pecahkan topik utama menjadi langkah-langkah/sub-task yang actionable.

Format JSON yang dibutuhkan:
{
  "main": {"label": "Topik Utama (max 3 kata)", "description": "Deskripsi singkat"},
  "steps": [
    {"label": "Langkah 1", "description": "Detail singkat", "priority": "high"},
    {"label": "Langkah 2", "description": "Detail singkat", "priority": "medium"},
    ...
  ]
}

Priority: "high" (penting/pertama), "medium" (menengah), "low" (opsional)
Berikan 4-6 langkah yang jelas dan actionable.

Percakapan:
${recentMessages}

Hanya return JSON, tanpa text lain.`,
                    studyMode: true,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                try {
                    const conceptText = data.message.replace(/\`\`\`json|\`\`\`/g, "").trim();
                    const decompositionData = JSON.parse(conceptText);

                    // Create main node at center
                    const mainNode = {
                        id: "main-" + Date.now(),
                        type: "concept",
                        position: { x: 400, y: 80 },
                        data: {
                            label: decompositionData.main?.label || activeTopic.name,
                            description: decompositionData.main?.description || "Topik Utama",
                            type: "main",
                            icon: "🎯"
                        },
                    };

                    // Create step nodes in a logical layout
                    const steps = decompositionData.steps || [];
                    const priorityIcons: Record<string, string> = {
                        high: "🔴",
                        medium: "🟡",
                        low: "🟢"
                    };

                    const stepNodes = steps.map((step: { label: string; description?: string; priority?: string }, i: number) => {
                        // Arrange in 2 columns
                        const col = i % 2;
                        const row = Math.floor(i / 2);
                        return {
                            id: `step-${Date.now()}-${i}`,
                            type: "concept",
                            position: {
                                x: 150 + col * 500,
                                y: 220 + row * 130
                            },
                            data: {
                                label: `${i + 1}. ${(step.label || "Langkah").slice(0, 20)}`,
                                description: (step.description || "").slice(0, 35),
                                type: "concept",
                                icon: priorityIcons[step.priority || "medium"] || "📌"
                            },
                        };
                    });

                    const allNodes = [mainNode, ...stepNodes];
                    const edges = stepNodes.map((node: { id: string }, index: number) => ({
                        id: `e-${mainNode.id}-${node.id}`,
                        source: mainNode.id,
                        target: node.id,
                        animated: index < 2, // Animate high priority edges
                        style: {
                            stroke: index < 2 ? "#ef4444" : index < 4 ? "#eab308" : "#22c55e",
                            strokeWidth: 2
                        },
                    }));

                    localStorage.setItem("mindmap-nodes", JSON.stringify(allNodes));
                    localStorage.setItem("mindmap-edges", JSON.stringify(edges));

                    // Switch to mindmap view  
                    setViewMode("mindmap");

                    // Add success message
                    setMessages(prev => [...prev, {
                        role: "ai",
                        content: `✅ **Task Breakdown berhasil dibuat!**\n\nTopik "${decompositionData.main?.label || activeTopic.name}" sudah dipecah menjadi ${steps.length} langkah.\n\n🔴 High Priority | 🟡 Medium | 🟢 Low\n\nLihat di tab **Mind Map** untuk visualnya.`
                    }]);

                } catch {
                    setMessages(prev => [...prev, {
                        role: "ai",
                        content: "Maaf, gagal membuat breakdown. Coba jelaskan topik yang ingin dipecah dengan lebih detail."
                    }]);
                }
            }
        } catch (error) {
            console.error("Task decomposition error:", error);
        } finally {
            setIsGeneratingMindmap(false);
        }
    }, [messages, activeTopic.name]);

    // Group conversations by date
    const groupedConversations = conversations.reduce((acc, conv) => {
        const date = new Date(conv.updatedAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let group = "Older";
        if (date.toDateString() === today.toDateString()) {
            group = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            group = "Yesterday";
        } else if (date > new Date(today.setDate(today.getDate() - 7))) {
            group = "Previous 7 Days";
        }

        if (!acc[group]) acc[group] = [];
        acc[group].push(conv);
        return acc;
    }, {} as Record<string, Conversation[]>);

    return (
        <div className="h-screen bg-[#111722] flex overflow-hidden">
            {/* Left Sidebar - Session History */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full bg-[#111722]/50 backdrop-blur-sm border-r border-[#232f48] flex flex-col overflow-hidden"
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 flex items-center justify-between shrink-0 border-b border-[#232f48]/50">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 text-[#92a4c9] hover:text-white hover:bg-[#232f48] rounded-lg transition-all"
                            >
                                <PanelLeftClose size={20} />
                            </button>
                            <button
                                onClick={startNewSession}
                                className="p-2 text-[#92a4c9] hover:text-white hover:bg-[#232f48] rounded-lg transition-all"
                                title="New session"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Energy Meter */}
                        <div className="p-4 border-b border-[#232f48]/50">
                            <div className="bg-[#1a2332] rounded-xl p-4 border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-[#92a4c9] font-medium uppercase tracking-wider">Mental Energy</span>
                                    <span className="text-xs text-emerald-400 font-bold">85%</span>
                                </div>
                                <div className="h-2 w-full bg-[#111722]/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 w-[85%] rounded-full shadow-[0_0_10px_rgba(19,91,236,0.6)]"></div>
                                </div>
                                <p className="text-[10px] text-[#92a4c9] mt-2 text-right">Optimal for deep work</p>
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto px-3 pb-4">
                            {Object.entries(groupedConversations).map(([group, convs]) => (
                                <div key={group} className="mb-4">
                                    <p className="text-xs font-bold text-[#556987] uppercase tracking-wider px-2 py-2">{group}</p>
                                    {convs.map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => selectConversation(conv)}
                                            className={`w-full group flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${currentConversationId === conv.id
                                                ? "bg-[#1a2333] border border-[#232f48] text-white"
                                                : "text-[#92a4c9] hover:bg-[#1a2333]/50 hover:text-white"
                                                }`}
                                        >
                                            <BookOpen size={16} className="shrink-0" />
                                            <span className="text-sm truncate flex-1">{conv.title}</span>
                                            <button
                                                onClick={(e) => deleteConversation(conv.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-[#556987] hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </button>
                                    ))}
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <p className="text-center text-[#556987] text-sm py-8">
                                    No study sessions yet
                                </p>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Background Pattern */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(#232f48 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                />

                {/* Header */}
                <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-[#232f48]/50 bg-[#111722]/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 text-[#92a4c9] hover:text-white hover:bg-[#232f48] rounded-lg transition-all"
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        <Link
                            href="/"
                            prefetch={true}
                            className="p-2 text-[#92a4c9] hover:text-white hover:bg-[#232f48] rounded-lg transition-all"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-[0_0_15px_rgba(19,91,236,0.5)]">
                                <GraduationCap className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-white text-lg font-bold leading-tight">Study Mode</h2>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                                    <span className="text-xs text-emerald-400 font-medium">High Energy State</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Topic Input - Simple editable field */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#1a2332]/50 backdrop-blur-sm rounded-lg border border-[#232f48]">
                            <span className="text-lg">📚</span>
                            <input
                                type="text"
                                value={activeTopic.name}
                                onChange={(e) => {
                                    const newTopic = { ...activeTopic, name: e.target.value };
                                    setActiveTopic(newTopic);
                                    localStorage.setItem(ACTIVE_TOPIC_KEY, JSON.stringify(newTopic));
                                }}
                                placeholder="Ketik topik studi..."
                                className="bg-transparent text-white font-medium text-sm outline-none w-40 placeholder:text-[#556987]"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (confirm('Hapus semua data mindmap dari localStorage?')) {
                                    localStorage.removeItem('mindmap-nodes');
                                    localStorage.removeItem('mindmap-edges');
                                    localStorage.removeItem(ACTIVE_TOPIC_KEY);
                                    setActiveTopic({ id: "1", name: "", icon: "📚", active: true });
                                }
                            }}
                            className="p-2 text-[#556987] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Reset data"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {/* View Mode Toggle + Knowledge Rail Toggle */}
                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-[#1a2332]/50 backdrop-blur-sm rounded-lg p-1 border border-[#232f48]">
                            <button
                                onClick={() => setViewMode("chat")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === "chat"
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-[#92a4c9] hover:text-white"
                                    }`}
                            >
                                <MessageSquare size={14} />
                                Chat
                            </button>
                            <button
                                onClick={() => setViewMode("mindmap")}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === "mindmap"
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-[#92a4c9] hover:text-white"
                                    }`}
                            >
                                <GitBranch size={14} />
                                Mind Map
                            </button>
                        </div>

                        <button
                            onClick={() => setKnowledgeRailOpen(!knowledgeRailOpen)}
                            className="p-2 text-[#92a4c9] hover:text-white hover:bg-[#232f48] rounded-lg transition-all"
                            title="Toggle Knowledge Rail"
                        >
                            <BookMarked size={20} />
                        </button>
                    </div>
                </header>

                {/* Main Grid */}
                <div className="flex-1 flex overflow-hidden relative z-10">
                    {/* Content Area - Chat or Mind Map */}
                    {viewMode === "chat" ? (
                        <div className="flex-1 flex flex-col min-w-0">
                            {/* Mastery Progress */}
                            <div className="px-6 py-4">
                                <div className="max-w-3xl mx-auto bg-[#1a2332]/60 backdrop-blur-sm rounded-xl p-4 border border-[#232f48]/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-bold">Topic Mastery: {activeTopic.name}</span>
                                        <span className="text-blue-400 font-bold text-lg">{masteryProgress}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-[#111722]/50 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(19,91,236,0.5)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${masteryProgress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <p className="text-sm text-[#92a4c9] flex items-center gap-1 mt-2">
                                        <Zap size={14} className="text-yellow-400" />
                                        You&apos;re in the flow zone! Keep pushing.
                                    </p>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <div className="max-w-3xl mx-auto px-6 py-4 space-y-6">
                                    {/* Welcome Message */}
                                    {messages.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="inline-flex p-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-600/20 mb-6">
                                                <Brain className="text-white" size={40} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white mb-3">
                                                Ready to learn {activeTopic.name}?
                                            </h2>
                                            <p className="text-[#92a4c9] max-w-md mx-auto leading-relaxed mb-8">
                                                I&apos;m your AI study partner. I&apos;ll challenge your understanding,
                                                help you review concepts, and quiz you on what you&apos;ve learned.
                                            </p>

                                            {/* Quick Actions */}
                                            <div className="flex flex-wrap justify-center gap-3">
                                                {[
                                                    { icon: <HelpCircle size={16} />, text: "Quiz Me", action: "Quiz me on this topic" },
                                                    { icon: <Lightbulb size={16} />, text: "Explain Concept", action: "Explain the basics" },
                                                    { icon: <Layers size={16} />, text: "Deep Dive", action: "Let's go deeper" },
                                                ].map((item, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleQuickAction(item.action)}
                                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2332] hover:bg-[#232f48] border border-[#232f48] hover:border-blue-500/30 rounded-xl text-sm text-[#92a4c9] hover:text-white transition-all"
                                                    >
                                                        <span className="text-blue-400">{item.icon}</span>
                                                        {item.text}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Messages */}
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "user"
                                                ? "bg-blue-600 shadow-[0_0_15px_rgba(19,91,236,0.4)]"
                                                : "bg-[#1a2332] border border-[#232f48]"
                                                }`}>
                                                {msg.role === "user" ? (
                                                    <span className="text-xs font-bold text-white">ME</span>
                                                ) : (
                                                    <Bot size={18} className="text-blue-400" />
                                                )}
                                            </div>
                                            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                                                <span className="text-xs text-[#556987] px-1">
                                                    {msg.role === "user" ? "You" : "Study AI"}
                                                </span>
                                                <div className={`p-4 rounded-2xl ${msg.role === "user"
                                                    ? "bg-blue-600/20 border border-blue-500/30 rounded-tr-none text-white"
                                                    : "bg-[#1a2332] border border-[#232f48] rounded-tl-none text-[#cfd9e8]"
                                                    }`}>
                                                    {msg.role === "ai" ? (
                                                        <div className="prose prose-invert prose-sm max-w-none">
                                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading */}
                                    {isLoading && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#1a2332] border border-[#232f48] flex items-center justify-center">
                                                <Bot size={18} className="text-blue-400 animate-pulse" />
                                            </div>
                                            <div className="bg-[#1a2332] border border-[#232f48] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                            </div>
                                        </div>
                                    )}

                                    <div ref={chatEndRef} />
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-6 bg-gradient-to-t from-[#111722] via-[#111722] to-transparent">
                                <div className="max-w-3xl mx-auto">
                                    {/* Quick Actions */}
                                    <div className="flex gap-2 mb-3 overflow-x-auto">
                                        {[
                                            { icon: <HelpCircle size={14} />, text: "Quiz Me" },
                                            { icon: <Lightbulb size={14} />, text: "Summarize" },
                                            { icon: <Sparkles size={14} />, text: "Give Hint" },
                                        ].map((action, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleQuickAction(action.text)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2332] hover:bg-[#232f48] border border-[#232f48] hover:border-blue-500/30 rounded-lg text-xs text-[#92a4c9] hover:text-white transition-all whitespace-nowrap"
                                            >
                                                <span className="text-blue-400">{action.icon}</span>
                                                {action.text}
                                            </button>
                                        ))}

                                        {/* Task Breakdown button - only show if there are messages */}
                                        {messages.length >= 2 && (
                                            <button
                                                onClick={generateMindmapFromChat}
                                                disabled={isGeneratingMindmap}
                                                className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-xs font-medium text-purple-300 hover:text-white transition-all whitespace-nowrap ${isGeneratingMindmap ? 'animate-pulse' : ''}`}
                                            >
                                                <GitBranch size={14} className={isGeneratingMindmap ? 'animate-spin' : ''} />
                                                {isGeneratingMindmap ? 'Breaking down...' : '✨ Task Breakdown'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Input Field */}
                                    <div className="relative">
                                        {/* Attachment Preview */}
                                        {attachments.length > 0 && (
                                            <div className="mb-2 flex flex-wrap gap-2">
                                                {attachments.map((att, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-[#232f48] px-3 py-1.5 rounded-lg text-sm">
                                                        <span className="text-[#92a4c9]">{att.name}</span>
                                                        <button onClick={() => removeAttachment(idx)} className="text-red-400 hover:text-red-300">
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="bg-[#1a2332] border border-[#232f48] rounded-2xl shadow-2xl flex items-end p-2 gap-2 focus-within:border-blue-500/50 transition-colors">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                accept="image/*,application/pdf,.txt,.md"
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 text-[#92a4c9] hover:text-white hover:bg-[#232f48] rounded-xl transition-colors"
                                                title="Attach file"
                                            >
                                                <Plus size={20} />
                                            </button>
                                            <textarea
                                                ref={textareaRef}
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Ask a question or type 'Quiz me'..."
                                                rows={1}
                                                className="w-full bg-transparent border-0 text-white placeholder-[#556987] focus:ring-0 resize-none py-3 max-h-32 text-sm"
                                            />
                                            <button
                                                onClick={handleSend}
                                                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_15px_rgba(19,91,236,0.5)] disabled:opacity-50 transition-all"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-center text-[10px] text-[#556987] mt-2">
                                        AI can make mistakes. Verify important information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Mind Map View */
                        <div className="flex-1 min-w-0 relative">
                            {/* Loading overlay when generating mindmap */}
                            <AnimatePresence>
                                {isGeneratingMindmap && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 flex items-center justify-center bg-[#111722]/90 backdrop-blur-sm"
                                    >
                                        <div className="text-center">
                                            <motion.div
                                                animate={{
                                                    rotate: 360,
                                                    scale: [1, 1.1, 1]
                                                }}
                                                transition={{
                                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                                    scale: { duration: 1, repeat: Infinity }
                                                }}
                                                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                                            >
                                                <GitBranch size={40} className="text-white" />
                                            </motion.div>
                                            <h3 className="text-xl font-bold text-white mb-2">Breaking Down Task...</h3>
                                            <p className="text-[#92a4c9] text-sm">AI sedang memecah topik menjadi langkah-langkah</p>
                                            <div className="flex justify-center gap-1 mt-4">
                                                <motion.div
                                                    animate={{ y: [0, -10, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                    className="w-3 h-3 bg-purple-500 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{ y: [0, -10, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                                                    className="w-3 h-3 bg-blue-500 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{ y: [0, -10, 0] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                    className="w-3 h-3 bg-cyan-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <MindMapCanvas topic={activeTopic.name} />
                        </div>
                    )}

                    {/* Right Sidebar - Knowledge Rail */}
                    <AnimatePresence>
                        {knowledgeRailOpen && (
                            <motion.aside
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 320, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="h-full bg-[#111722]/50 backdrop-blur-sm border-l border-[#232f48] flex flex-col overflow-hidden"
                            >
                                {/* Header */}
                                <div className="p-5 border-b border-[#232f48]/50 flex items-center justify-between">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <Sparkles size={18} className="text-blue-400" />
                                        Knowledge Rail
                                    </h3>
                                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">
                                        Live
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                    {/* Key Takeaways */}
                                    <div>
                                        <h4 className="text-xs font-bold text-[#556987] uppercase tracking-wider mb-3 flex items-center gap-2">
                                            Key Takeaways
                                            <span className="flex-1 h-px bg-[#232f48]" />
                                        </h4>
                                        <ul className="space-y-3">
                                            {takeaways.map((takeaway) => (
                                                <li key={takeaway.id} className="flex gap-3 text-sm text-[#cfd9e8] group">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(19,91,236,0.8)] shrink-0" />
                                                    <span className="group-hover:text-white transition-colors">{takeaway.content}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Flashcards */}
                                    <div>
                                        <h4 className="text-xs font-bold text-[#556987] uppercase tracking-wider mb-3 flex items-center gap-2">
                                            Generated Flashcards
                                            <span className="flex-1 h-px bg-[#232f48]" />
                                        </h4>
                                        <div className="space-y-3">
                                            {flashcards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    className="bg-[#1a2332] border border-[#232f48] rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${card.type === "concept"
                                                            ? "text-blue-400 bg-blue-500/10"
                                                            : "text-emerald-400 bg-emerald-500/10"
                                                            }`}>
                                                            {card.type}
                                                        </span>
                                                        <RotateCcw size={14} className="text-[#556987] group-hover:text-blue-400 transition-colors" />
                                                    </div>
                                                    <h5 className="text-white font-bold mb-1">{card.title}</h5>
                                                    <p className="text-xs text-[#92a4c9] line-clamp-2">{card.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Review Button */}
                                <div className="p-5">
                                    <button
                                        onClick={startReview}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-[0_0_15px_rgba(19,91,236,0.5)] flex items-center justify-center gap-2 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                    >
                                        <BookOpen size={18} />
                                        Review {flashcards.length} Cards Now
                                    </button>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Review Cards Modal */}
            <AnimatePresence>
                {showReviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowReviewModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a2332] border border-[#232f48] rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
                        >
                            {/* Progress */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm text-[#92a4c9]">
                                    Card {currentCardIndex + 1} of {flashcards.length}
                                </span>
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="text-[#92a4c9] hover:text-white"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 bg-[#111722] rounded-full overflow-hidden mb-6">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                                />
                            </div>

                            {/* Card Content */}
                            {flashcards[currentCardIndex] && (
                                <div className="text-center mb-8">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${flashcards[currentCardIndex].type === "concept"
                                        ? "text-blue-400 bg-blue-500/20"
                                        : "text-emerald-400 bg-emerald-500/20"
                                        }`}>
                                        {flashcards[currentCardIndex].type}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mt-4 mb-3">
                                        {flashcards[currentCardIndex].title}
                                    </h3>
                                    <p className="text-[#92a4c9] leading-relaxed">
                                        {flashcards[currentCardIndex].description}
                                    </p>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex gap-3">
                                <button
                                    onClick={prevCard}
                                    disabled={currentCardIndex === 0}
                                    className="flex-1 py-3 bg-[#232f48] text-[#92a4c9] rounded-xl font-bold hover:bg-[#353b4b] hover:text-white disabled:opacity-50 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={nextCard}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                >
                                    {currentCardIndex === flashcards.length - 1 ? "Complete!" : "Next"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
