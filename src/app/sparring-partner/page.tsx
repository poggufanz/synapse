"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEnergyStore } from "@/store/useEnergyStore";
import { Send, Bot, ArrowLeft, Sparkles, MessageSquare, Zap, Paperclip, X, FileText, Brain, ChevronDown, Plus, Trash2, Menu, PanelLeftClose } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploadButton, { FileAttachment } from "@/components/FileUploadButton";
import ReactMarkdown from "react-markdown";

type ThinkingMode = "off" | "dynamic" | "low" | "medium" | "high";

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

// LocalStorage helpers
const STORAGE_KEY = "sparring-conversations";

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
    if (!firstUserMsg) return "New Chat";
    return firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "");
};

export default function SparringPartnerPage() {
    const router = useRouter();
    const persona = useEnergyStore((state) => state.persona);

    // Conversation state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // UI state
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const [thinkingMode, setThinkingMode] = useState<ThinkingMode>("dynamic");
    const [showThinkingMenu, setShowThinkingMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load conversations from localStorage on mount
    useEffect(() => {
        const loaded = loadConversations();
        setConversations(loaded);
        // Auto-select the most recent conversation or start fresh
        if (loaded.length > 0) {
            const mostRecent = loaded.sort((a, b) => b.updatedAt - a.updatedAt)[0];
            setCurrentConversationId(mostRecent.id);
            setMessages(mostRecent.messages);
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

    const startNewChat = useCallback(() => {
        const newConv: Conversation = {
            id: generateId(),
            title: "New Chat",
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

        // If no conversation exists, create one
        if (!currentConversationId) {
            const newConv: Conversation = {
                id: generateId(),
                title: "New Chat",
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            setConversations(prev => [newConv, ...prev]);
            setCurrentConversationId(newConv.id);
        }

        const userMsg: ChatMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Include current userMsg in history (messages state is stale at this point)
            const currentHistory = [...messages, userMsg];

            const response = await fetch("/api/chat-productive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: currentHistory,
                    message: userMsg.content,
                    persona,
                    thinkingMode,
                    attachments: attachments.map(f => ({
                        data: f.data,
                        mimeType: f.mimeType,
                        name: f.name,
                    })),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, { role: "ai", content: data.message }]);
            }
            // Clear attachments after sending
            setAttachments([]);
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
        <div className="h-screen bg-slate-900 flex overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full bg-slate-950 border-r border-slate-800 flex flex-col overflow-hidden"
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 flex items-center justify-between shrink-0">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                            >
                                <PanelLeftClose size={20} />
                            </button>
                            <button
                                onClick={startNewChat}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                title="New chat"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto px-2 pb-4">
                            {Object.entries(groupedConversations).map(([group, convs]) => (
                                <div key={group} className="mb-4">
                                    <p className="text-xs font-medium text-slate-500 px-3 py-2">{group}</p>
                                    {convs.map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => selectConversation(conv)}
                                            className={`w-full group flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${currentConversationId === conv.id
                                                ? "bg-slate-800 text-white"
                                                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                                }`}
                                        >
                                            <MessageSquare size={16} className="shrink-0" />
                                            <span className="text-sm truncate flex-1">{conv.title}</span>
                                            <button
                                                onClick={(e) => deleteConversation(conv.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </button>
                                    ))}
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <p className="text-center text-slate-600 text-sm py-8">
                                    No conversations yet
                                </p>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header - Minimal */}
                <header className="px-4 py-3 flex items-center gap-3 shrink-0 border-b border-slate-800/50">
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <Link
                        href="/"
                        prefetch={true}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg">
                            <Bot className="text-white" size={18} />
                        </div>
                        <span className="font-semibold text-white">Sparring Partner</span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                        {/* Welcome Message */}
                        {messages.length === 0 && (
                            <div className="text-center py-16">
                                <div className="inline-flex p-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-600/20 mb-6">
                                    <Bot className="text-white" size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    Meet your Sparring Partner
                                </h2>
                                <p className="text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
                                    I'm here to help you think through complex problems, brainstorm ideas,
                                    and push your thinking further. What's on your mind?
                                </p>

                                {/* Suggestion Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-xl mx-auto">
                                    {[
                                        { icon: <Zap size={18} />, title: "Break down a task", desc: "Tackle complexity" },
                                        { icon: <MessageSquare size={18} />, title: "Think through a problem", desc: "Analyze together" },
                                        { icon: <Sparkles size={18} />, title: "Generate ideas", desc: "Brainstorm" },
                                    ].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(suggestion.title)}
                                            className="p-4 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/30 hover:border-blue-500/30 rounded-xl text-left transition-all group"
                                        >
                                            <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                                                {suggestion.icon}
                                            </div>
                                            <p className="font-medium text-white text-sm">{suggestion.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{suggestion.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-md"
                                        : "bg-slate-800/50 text-slate-200 rounded-bl-md"
                                        }`}
                                >
                                    {msg.role === "ai" && (
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/30">
                                            <Bot size={14} className="text-blue-400" />
                                            <span className="text-xs font-medium text-blue-400">Sparring Partner</span>
                                        </div>
                                    )}
                                    {msg.role === "ai" ? (
                                        <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-strong:text-white prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-5 prose-ol:pl-5">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${thinkingMode !== "off"
                                    ? "bg-gradient-to-br from-purple-900/30 to-slate-800/50"
                                    : "bg-slate-800/50"
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {thinkingMode !== "off" ? (
                                            <>
                                                <Brain size={14} className="text-purple-400 animate-pulse" />
                                                <span className="text-xs font-medium text-purple-400">
                                                    Thinking{thinkingMode !== "dynamic" ? ` (${thinkingMode})` : ""}...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Bot size={14} className="text-blue-400" />
                                                <span className="text-xs font-medium text-blue-400">Sparring Partner</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-1.5">
                                        <span className={`w-2 h-2 rounded-full animate-bounce ${thinkingMode !== "off" ? "bg-purple-400" : "bg-blue-400"}`} />
                                        <span className={`w-2 h-2 rounded-full animate-bounce ${thinkingMode !== "off" ? "bg-purple-400" : "bg-blue-400"}`} style={{ animationDelay: "0.1s" }} />
                                        <span className={`w-2 h-2 rounded-full animate-bounce ${thinkingMode !== "off" ? "bg-purple-400" : "bg-blue-400"}`} style={{ animationDelay: "0.2s" }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Area - Clean Design */}
                <div className="p-4 shrink-0">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 focus-within:border-blue-500/50 transition-colors">
                            {/* File Previews */}
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {attachments.map((file, index) => (
                                        <div key={`${file.name}-${index}`} className="relative">
                                            <div className="relative bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
                                                {file.preview ? (
                                                    <img src={file.preview} alt={file.name} className="w-16 h-16 object-cover" />
                                                ) : (
                                                    <div className="w-16 h-16 flex flex-col items-center justify-center">
                                                        <FileText size={20} className="text-red-400" />
                                                        <span className="text-[8px] text-red-400 font-bold mt-0.5">PDF</span>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X size={8} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={attachments.length > 0
                                    ? "Describe what you'd like me to do with this file..."
                                    : "What's on your mind? Let's think through it together..."}
                                rows={1}
                                className="w-full bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed max-h-[200px]"
                            />

                            {/* Bottom Bar */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
                                <div className="flex items-center gap-2">
                                    {/* Attach Button */}
                                    <button
                                        onClick={() => document.getElementById('sparring-file-input')?.click()}
                                        disabled={attachments.length >= 3}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50"
                                        title="Attach file"
                                    >
                                        <Paperclip size={18} />
                                    </button>
                                    {attachments.length > 0 && (
                                        <span className="text-xs text-blue-400 font-medium">{attachments.length} file</span>
                                    )}

                                    {/* Thinking Mode Toggle */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowThinkingMenu(!showThinkingMenu)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${thinkingMode !== "off"
                                                ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                                                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                                                }`}
                                        >
                                            <Brain size={14} />
                                            {thinkingMode === "off" ? "Thinking Off" :
                                                thinkingMode === "dynamic" ? "Thinking" :
                                                    `Thinking: ${thinkingMode.charAt(0).toUpperCase() + thinkingMode.slice(1)}`}
                                            <ChevronDown size={12} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showThinkingMenu && (
                                            <div className="absolute bottom-full mb-2 left-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 min-w-[150px] z-50">
                                                {[
                                                    { value: "off", label: "Off", desc: "Fastest response" },
                                                    { value: "dynamic", label: "Dynamic", desc: "Auto-adjust" },
                                                    { value: "low", label: "Low", desc: "Quick thinking" },
                                                    { value: "medium", label: "Medium", desc: "Balanced" },
                                                    { value: "high", label: "High", desc: "Deep reasoning" },
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            setThinkingMode(option.value as ThinkingMode);
                                                            setShowThinkingMenu(false);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left hover:bg-slate-700/50 transition-colors ${thinkingMode === option.value ? "bg-purple-600/20" : ""
                                                            }`}
                                                    >
                                                        <span className={`text-sm font-medium ${thinkingMode === option.value ? "text-purple-400" : "text-white"}`}>
                                                            {option.label}
                                                        </span>
                                                        <p className="text-[10px] text-slate-500">{option.desc}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={(!input.trim() && attachments.length === 0) || isLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center gap-2 font-medium text-sm"
                                >
                                    <Send size={16} />
                                    Send
                                </button>
                            </div>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            id="sparring-file-input"
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            onChange={async (e) => {
                                if (!e.target.files) return;
                                const newAttachments: FileAttachment[] = [];
                                for (let i = 0; i < e.target.files.length && attachments.length + newAttachments.length < 3; i++) {
                                    const file = e.target.files[i];
                                    if (file.size > 10 * 1024 * 1024) continue;
                                    const reader = new FileReader();
                                    const result = await new Promise<string>((resolve) => {
                                        reader.onload = (ev) => resolve(ev.target?.result as string);
                                        reader.readAsDataURL(file);
                                    });
                                    newAttachments.push({
                                        data: result.split(',')[1],
                                        mimeType: file.type,
                                        name: file.name,
                                        size: file.size,
                                        preview: file.type.startsWith('image/') ? result : undefined,
                                    });
                                }
                                if (newAttachments.length > 0) {
                                    setAttachments([...attachments, ...newAttachments]);
                                }
                                e.target.value = '';
                            }}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
