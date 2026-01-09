import React, { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_NEWS, DISTRICTS, CATEGORIES, APP_NAME } from './constants';
import { DistrictFilter, NewsArticle } from './types';
import NewsCard from './components/NewsCard';
import FloatingChatInput from './components/FloatingChatInput';
import ChatInterface from './components/ChatInterface';

const ITEMS_PER_PAGE = 6;

// -- Homepage Component --
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictFilter>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>(MOCK_NEWS);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Logic
  useEffect(() => {
    let result = MOCK_NEWS;
    
    if (selectedDistrict !== 'All') {
      result = result.filter(n => n.district === selectedDistrict);
    }
    
    if (selectedCategory !== 'All') {
      result = result.filter(n => n.category === selectedCategory);
    }

    setFilteredNews(result);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [selectedDistrict, selectedCategory]);

  const handleStartChat = (initialMessage?: string) => {
    navigate('/chat', { state: { initialMessage } });
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const currentNews = filteredNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900 pb-32 font-sans selection:bg-orange-100">
      
      {/* Minimal Header */}
      <header className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black font-serif tracking-tighter text-stone-900 mb-4">
            {APP_NAME}<span className="text-orange-600 text-4xl align-top">●</span>
          </h1>
          <p className="text-stone-500 font-medium text-lg md:text-xl tracking-tight max-w-lg mx-auto leading-relaxed">
            The minimal briefing for Odisha. Real-time district updates powered by intelligence.
          </p>

        {/* Minimal Nav Pills */}
        <div className="flex flex-col items-center gap-6 mt-12">
            {/* Districts */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
               {DISTRICTS.map(district => (
                <button
                  key={district}
                  onClick={() => setSelectedDistrict(district)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300
                    ${selectedDistrict === district 
                      ? 'bg-stone-900 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                >
                  {district}
                </button>
              ))}
            </div>
            
            {/* Categories (Subtle Text Links) */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-stone-400">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`hover:text-stone-900 transition-colors uppercase tracking-widest text-[11px] ${selectedCategory === cat ? 'text-orange-600 font-bold' : ''}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </header>

      {/* Main Content - Masonry Text Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {currentNews.length > 0 ? (
          <>
            {/* CSS Columns for Newspaper Masonry Effect */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {currentNews.map((article, index) => (
                <div 
                    key={article.id} 
                    className="fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NewsCard article={article} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16 fade-in">
                 <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-3 rounded-full border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                 </button>

                 <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-full text-sm font-bold transition-all
                            ${currentPage === page 
                                ? 'bg-stone-900 text-white shadow-md' 
                                : 'text-stone-400 hover:bg-stone-100'
                            }`}
                        >
                          {page}
                        </button>
                    ))}
                 </div>

                 <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-3 rounded-full border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                 </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
             <div className="text-4xl mb-4 text-stone-300 font-serif italic">Empty.</div>
             <p className="text-stone-500">No stories found for this selection.</p>
             <button 
                onClick={() => { setSelectedDistrict('All'); setSelectedCategory('All'); }}
                className="mt-6 px-6 py-2 border-b-2 border-stone-900 text-stone-900 text-sm font-bold hover:text-orange-600 hover:border-orange-600 transition-all"
             >
                View All
             </button>
          </div>
        )}
      </main>

      {/* Floating Chat Entry */}
      <FloatingChatInput onStartChat={handleStartChat} />
    </div>
  );
};

// -- Chat Page Wrapper --
const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { initialMessage?: string } | null;

    return (
        <ChatInterface 
            initialPrompt={state?.initialMessage} 
            onBack={() => navigate('/')} 
        />
    );
};


// -- App Router --
const App: React.FC = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </MemoryRouter>
  );
};

export default App;