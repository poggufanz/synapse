"use client";

import { useState } from "react";
import { Lightbulb, Plus, X, Save, Lock } from "lucide-react";
import { toast } from "sonner";

export default function IdeaVault() {
    const [isOpen, setIsOpen] = useState(false);
    const [idea, setIdea] = useState("");
    const [ideas, setIdeas] = useState<string[]>([]);

    const handleSave = () => {
        if (!idea.trim()) return;
        setIdeas((prev) => [idea, ...prev]);
        setIdea("");
        toast.success("Idea locked in the vault! 🔒");
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 p-4 rounded-full shadow-lg hover:shadow-yellow-200 transition-all hover:scale-110 z-40 group border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
            >
                <Lightbulb size={32} className="drop-shadow-glow" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl border border-white/50">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-100 rounded-2xl">
                                    <Lightbulb className="text-yellow-600 drop-shadow-glow" size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800">Idea Vault</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                placeholder="Quick thought? Catch it here before it flies away..."
                                className="w-full h-32 input-soft p-4 text-lg font-medium placeholder-slate-400 resize-none"
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                disabled={!idea.trim()}
                                className="w-full btn-clay btn-clay-blue py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock size={20} />
                                Save for Later
                            </button>
                        </div>

                        {ideas.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Vaulted Ideas</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {ideas.map((item, idx) => (
                                        <div key={idx} className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 font-medium border border-slate-100">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
