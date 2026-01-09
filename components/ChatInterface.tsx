import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatProject } from '../types';
import { streamGeminiResponse } from '../services/geminiService';
import { APP_NAME } from '../constants';

interface ChatInterfaceProps {
  initialPrompt?: string;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialPrompt, onBack }) => {
  const [projects, setProjects] = useState<ChatProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load projects
  useEffect(() => {
    const saved = localStorage.getItem('odishagpt-projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
    }
    
    if (initialPrompt || (saved && JSON.parse(saved).length === 0) || !saved) {
        createNewProject(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('odishagpt-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projects, currentProjectId, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const getCurrentProject = () => projects.find(p => p.id === currentProjectId);

  const createNewProject = (startPrompt?: string) => {
    const newProject: ChatProject = {
      id: Date.now().toString(),
      title: startPrompt ? (startPrompt.slice(0, 30) + (startPrompt.length > 30 ? '...' : '')) : 'New Conversation',
      updatedAt: Date.now(),
      messages: []
    };
    setProjects(prev => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    
    if (startPrompt) {
        setTimeout(() => handleSendMessage(startPrompt, newProject.id), 0);
        setInput('');
    }
  };

  const deleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProjectId === id) setCurrentProjectId(null);
  };

  const handleSendMessage = async (text: string, projectIdOverride?: string) => {
    const activeId = projectIdOverride || currentProjectId;
    if (!text.trim() || !activeId) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    
    setProjects(prev => prev.map(p => {
      if (p.id === activeId) {
        return { ...p, messages: [...p.messages, userMsg], updatedAt: Date.now() };
      }
      return p;
    }));
    
    setInput('');
    setIsLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: ChatMessage = { id: aiMsgId, role: 'model', text: '' };
    
    setProjects(prev => prev.map(p => {
        if (p.id === activeId) {
          return { ...p, messages: [...p.messages, initialAiMsg] };
        }
        return p;
    }));

    try {
      const currentProjectMessages = projects.find(p => p.id === activeId)?.messages || [];
      const historyWithUserMsg = [...currentProjectMessages, userMsg];

      const stream = streamGeminiResponse(historyWithUserMsg, text);
      let accumulatedText = "";

      for await (const chunk of stream) {
        accumulatedText += chunk.text;
        
        setProjects(prev => prev.map(p => {
            if (p.id === activeId) {
                const newMessages = p.messages.map(m => {
                    if (m.id === aiMsgId) {
                        const existingSources = m.sources || [];
                        const newSources = chunk.sources ? [...existingSources, ...chunk.sources] : existingSources;
                        const uniqueSources = Array.from(new Map(newSources.map(s => [s.uri, s])).values());
                        return { ...m, text: accumulatedText, sources: uniqueSources.length ? uniqueSources : undefined };
                    }
                    return m;
                });
                return { ...p, messages: newMessages };
            }
            return p;
        }));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!currentProjectId) {
        createNewProject(input);
    } else {
        handleSendMessage(input);
    }
  };

  const currentProject = getCurrentProject();

  return (
    <div className="flex h-screen bg-[#F8F7F4] overflow-hidden font-sans">
      {/* Minimal Sidebar - Desktop */}
      <div className={`hidden md:flex flex-col w-72 bg-[#F0EFEC] border-r border-stone-200 flex-shrink-0`}>
        <div className="p-6">
           <button onClick={onBack} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-8 font-medium text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back home
           </button>
           
           <button 
             onClick={() => createNewProject()} 
             className="w-full py-3 px-4 bg-white border border-stone-200 rounded-xl shadow-sm text-stone-900 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-md hover:border-orange-200 transition-all group"
           >
             <span className="w-5 h-5 rounded-full bg-stone-100 group-hover:bg-orange-100 text-stone-600 group-hover:text-orange-600 flex items-center justify-center transition-colors">+</span>
             New Chat
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 no-scrollbar">
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">History</p>
          {projects.sort((a,b) => b.updatedAt - a.updatedAt).map(project => (
            <div 
                key={project.id} 
                onClick={() => setCurrentProjectId(project.id)}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${currentProjectId === project.id ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:bg-white/50 hover:text-stone-900'}`}
            >
                <div className="truncate text-sm font-medium pr-6">{project.title}</div>
                <button 
                    onClick={(e) => deleteProject(e, project.id)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity p-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#F8F7F4]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-stone-100 z-20">
            <button onClick={onBack} className="p-2 -ml-2 text-stone-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <span className="font-serif font-bold text-lg text-stone-900">{APP_NAME}</span>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-stone-600">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
                <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
                <div className="relative flex flex-col w-4/5 max-w-xs bg-[#F0EFEC] shadow-2xl h-full p-4">
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="font-serif font-bold text-xl">Projects</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white rounded-full shadow-sm">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                     <button onClick={() => { createNewProject(); setIsSidebarOpen(false); }} className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold mb-6">
                        New Conversation
                    </button>
                    <div className="space-y-2 overflow-y-auto">
                        {projects.map(project => (
                            <div 
                                key={project.id} 
                                onClick={() => { setCurrentProjectId(project.id); setIsSidebarOpen(false); }}
                                className={`p-4 rounded-xl font-medium ${currentProjectId === project.id ? 'bg-white shadow-sm' : 'text-stone-500'}`}
                            >
                                {project.title}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-6 pb-40">
            {!currentProject ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] flex items-center justify-center mb-6">
                         <span className="text-4xl">👋</span>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Hello, Odisha.</h2>
                    <p className="text-stone-500 text-lg">Ask me about districts, news, or culture.</p>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto space-y-8">
                    {currentProject.messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`
                                    max-w-[85%] sm:max-w-[80%] p-6 text-[15px] sm:text-base leading-relaxed shadow-sm
                                    ${msg.role === 'user' 
                                        ? 'bg-stone-900 text-white rounded-[2rem] rounded-br-sm' 
                                        : 'bg-white text-stone-800 rounded-[2rem] rounded-bl-sm border border-stone-100'
                                    }
                                `}
                            >
                                {msg.role === 'model' && (
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">AI</div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">OdishaGPT</span>
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-stone-100/10 flex flex-wrap gap-2">
                                        {msg.sources.map((s, i) => (
                                            <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" 
                                               className={`text-xs px-2 py-1 rounded-md transition-colors truncate max-w-full
                                                 ${msg.role === 'user' ? 'bg-stone-800 text-stone-400 hover:text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}
                                               `}
                                            >
                                                🔗 {s.title || 'Source'}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-white px-6 py-4 rounded-[2rem] rounded-bl-sm shadow-sm border border-stone-100">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F8F7F4] via-[#F8F7F4]/90 to-transparent pt-20 pb-8 px-4 sm:px-6">
             <div className="max-w-3xl mx-auto">
                <form onSubmit={onSubmit} className="relative group">
                    <div className="absolute inset-0 bg-white/50 blur-xl rounded-full opacity-50 transition-opacity group-hover:opacity-100"></div>
                    <div className="relative flex items-end gap-2 bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-2 ring-1 ring-stone-100 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            className="flex-1 max-h-48 w-full bg-transparent border-none focus:ring-0 p-4 text-stone-900 placeholder-stone-400 resize-none overflow-hidden text-lg"
                            placeholder="Message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSubmit(e);
                                }
                            }}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            className="p-4 bg-stone-900 rounded-full text-white hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </form>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;