import React, { useState, useEffect, useRef } from 'react';
import { useEnergyStore } from '@/store/useEnergyStore';
import { useUserStore } from '@/store/useUserStore';
import BreathingModal from './BreathingModal';
import { Wind, LogOut, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function BurnoutView() {
  const setMode = useEnergyStore((state) => state.setMode);
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Mock response logic for demo
  const mockResponse = async (selection?: string) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let reply = "";
    let nextOptions: string[] = [];

    if (!selection) {
      // Initial greeting
      reply = "hey. tough day? i'm here. no pressure.";
      nextOptions = ["yeah, exhausted", "just overwhelmed", "need a distraction"];
    } else if (selection === "yeah, exhausted") {
      reply = "i get it. let's just exist for a bit. want to try a breathing exercise or just vent?";
      nextOptions = ["breathing sounds good", "just venting", "silence please"];
    } else if (selection === "just overwhelmed") {
      reply = "too much noise, right? let's quiet things down. deep breath.";
      nextOptions = ["okay", "it's just too much"];
    } else if (selection === "need a distraction") {
      reply = "fair enough. did you know otters hold hands when they sleep? cute, right?";
      nextOptions = ["that is cute", "tell me another"];
    } else {
      // Generic fallback
      reply = "i hear you. take your time. i'm not going anywhere.";
      nextOptions = ["thanks", "i'm tired"];
    }

    setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    setOptions(nextOptions);
    setLoading(false);
  };

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      mockResponse();
    }
  }, []);

  const handleOptionClick = (option: string) => {
    setMessages((prev) => [...prev, { role: 'user', text: option }]);
    setOptions([]); // Hide options while loading
    mockResponse(option);
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-screen max-h-[800px] flex flex-col p-4 md:p-6 animate-in fade-in zoom-in duration-1000">
      {showBreathing && <BreathingModal onClose={() => setShowBreathing(false)} />}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
            <MessageSquare size={24} />
          </div>
          <h1 className="text-2xl font-medium text-zinc-400">
            decompression
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowBreathing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-900/30 text-teal-200 hover:bg-teal-900/50 transition-colors text-sm border border-teal-800/50"
          >
            <Wind size={16} />
            <span>breathe</span>
          </button>
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-300 transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>exit</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 rounded-2xl text-lg shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-900/30 text-blue-100 rounded-br-sm border border-blue-800/30'
                  : 'bg-zinc-800/50 text-zinc-300 rounded-bl-sm border border-zinc-700/30'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/50 px-5 py-3 rounded-2xl rounded-bl-sm border border-zinc-700/30">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Options) */}
      <div className="flex flex-wrap gap-3 justify-center min-h-[80px]">
        {!loading && options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionClick(option)}
            className="px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all transform hover:scale-105 shadow-lg border border-zinc-700/50"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
