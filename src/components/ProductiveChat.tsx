import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Send, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'PACE';
  text: string;
}

export default function ProductiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat-productive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          message: userMsg,
          userProfile: user,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'PACE', text: data.message }]);
      } else {
        toast.error("PACE is offline. Check connection.");
      }
    } catch (error) {
      console.error('Chat error', error);
      toast.error("Failed to reach PACE.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 left-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 z-40 font-semibold"
        >
          <MessageSquare size={20} />
          Talk to PACE
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-8 left-8 w-80 md:w-96 h-[500px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h3 className="font-bold text-white">PACE (Logic Bot)</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50 scrollbar-thin scrollbar-thumb-zinc-700">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 text-sm mt-4">
                PACE is online. State your objective or problem.
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
                  }`}
                >
                  <p className="font-bold text-[10px] mb-1 opacity-50 uppercase">
                    {msg.role}
                  </p>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 px-4 py-2 rounded-xl rounded-bl-none border border-zinc-700">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-zinc-900 border-t border-zinc-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your logic..."
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
