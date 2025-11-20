"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock, Lightbulb, X } from "lucide-react";

interface VaultItem {
    id: string;
    text: string;
    timestamp: Date;
}

export default function IdeaVault() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVaultOpen, setIsVaultOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);

    const handleSaveIdea = () => {
        if (!inputText.trim()) return;

        const newItem: VaultItem = {
            id: Date.now().toString(),
            text: inputText,
            timestamp: new Date(),
        };

        setVaultItems((prev) => [newItem, ...prev]);
        setInputText("");
        setIsModalOpen(false);

        // Show toast notification
        toast.success("Idea secured in the Vault. Focus restored. 🔒");
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center z-40"
                title="Idea Vault"
            >
                <Lightbulb size={28} />
            </button>

            {/* Main Modal */}
            {isModalOpen && !isVaultOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-2">Catch that thought! 💭</h2>
                        <p className="text-slate-400 text-sm mb-6">Don't let it distract you. Write it down and let it go.</p>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="What's the distraction? Write it down and let it go."
                            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors resize-none mb-4"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveIdea}
                                disabled={!inputText.trim()}
                                className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <Lock size={18} /> Lock it away
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {vaultItems.length > 0 && (
                            <button
                                onClick={() => setIsVaultOpen(true)}
                                className="w-full mt-4 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                            >
                                Open Vault ({vaultItems.length} {vaultItems.length === 1 ? "item" : "items"})
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Vault List View */}
            {isVaultOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Your Idea Vault 🗄️</h2>
                            <button
                                onClick={() => setIsVaultOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {vaultItems.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No ideas stored yet.</p>
                            ) : (
                                vaultItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-yellow-500/30 transition-colors"
                                    >
                                        <p className="text-white mb-2">{item.text}</p>
                                        <p className="text-slate-500 text-xs">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setIsVaultOpen(false)}
                            className="mt-6 w-full bg-slate-700/50 hover:bg-slate-700 text-white py-3 rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
