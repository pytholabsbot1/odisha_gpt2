import React, { useState, useEffect } from 'react';
import { CHAT_HINTS } from '../constants';

interface FloatingChatInputProps {
  onStartChat: (initialMessage?: string) => void;
}

const FloatingChatInput: React.FC<FloatingChatInputProps> = ({ onStartChat }) => {
  const [hintIndex, setHintIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Cycle through hints
  useEffect(() => {
    if (isFocused || inputValue) return;
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % CHAT_HINTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused, inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartChat(inputValue);
  };

  return (
    <div className="fixed bottom-8 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className={`w-full max-w-xl transition-all duration-500 pointer-events-auto ${isFocused ? 'transform -translate-y-4 scale-105' : ''}`}>
        <form 
          onSubmit={handleSubmit} 
          className="relative group bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] rounded-[2rem] p-2 flex items-center gap-2 transition-shadow hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]"
        >
          <div className="pl-4 flex-1 relative h-12 flex items-center">
            <input
              type="text"
              className="w-full h-full bg-transparent text-stone-900 placeholder-stone-400 focus:outline-none text-lg font-medium font-serif"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            
            {/* Minimal Animated Hint */}
            {!isFocused && !inputValue && (
              <div className="absolute inset-0 flex items-center pointer-events-none">
                 <span className="text-stone-400/80 text-lg font-serif italic animate-fade-in-up truncate">
                   {CHAT_HINTS[hintIndex]}
                 </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`
                h-12 w-12 rounded-full flex items-center justify-center text-white transition-all duration-300
                ${inputValue.trim() ? 'bg-orange-600 rotate-0 scale-100 shadow-lg' : 'bg-stone-900 -rotate-90 scale-90 opacity-80'}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </button>
        </form>
      </div>
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(5px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 4s infinite;
        }
      `}</style>
    </div>
  );
};

export default FloatingChatInput;