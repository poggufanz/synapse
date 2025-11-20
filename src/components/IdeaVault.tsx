import React, { useState } from 'react';
import { toast } from 'sonner';
import { Lightbulb, Lock, X } from 'lucide-react';

export default function IdeaVault() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [vaultItems, setVaultItems] = useState<string[]>([]);
  const [viewVault, setViewVault] = useState(false);

  const handleLockAway = () => {
    if (!input.trim()) return;
    
    setVaultItems((prev) => [...prev, input]);
    setInput('');
    setIsOpen(false);
    toast.success('Idea secured in the Vault. Focus restored. 🔒');
  };

  const toggleVaultView = () => {
    setViewVault(!viewVault);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-40 group"
        title="Idea Vault"
      >
        <Lightbulb size={28} className="group-hover:animate-pulse" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900/80 border border-zinc-700/50 p-8 rounded-3xl shadow-2xl w-full max-w-md backdrop-blur-md relative">
            
            {/* Close Button */}
            <button 
              onClick={() => { setIsOpen(false); setViewVault(false); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {!viewVault ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500">
                    <Lightbulb size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Catch that thought!</h2>
                <p className="text-zinc-400 text-center mb-6 text-sm">
                  What's the distraction? Write it down and let it go.
                </p>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="I need to buy cat food..."
                  className="w-full h-32 bg-zinc-950/50 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50 transition-colors mb-6 resize-none"
                  autoFocus
                />

                <button
                  onClick={handleLockAway}
                  disabled={!input.trim()}
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg shadow-yellow-900/20 mb-4 flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  <span>Lock it away</span>
                </button>

                <div className="text-center">
                  <button
                    onClick={toggleVaultView}
                    className="text-xs text-zinc-500 hover:text-yellow-400 underline transition-colors"
                  >
                    Open Vault ({vaultItems.length})
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-yellow-500 mb-6 text-center flex items-center justify-center gap-2">
                  <Lock size={20} />
                  Your Vault
                </h2>
                
                <div className="max-h-60 overflow-y-auto space-y-3 mb-6 pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                  {vaultItems.length === 0 ? (
                    <p className="text-center text-zinc-600 py-8">The vault is empty. Good focus!</p>
                  ) : (
                    vaultItems.map((item, idx) => (
                      <div key={idx} className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 text-zinc-300 text-sm">
                        {item}
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={toggleVaultView}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
                >
                  Back to Capture
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
