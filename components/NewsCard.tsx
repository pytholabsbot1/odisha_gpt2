import React from 'react';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  // Calculate a fake read time based on summary length
  const readTime = Math.max(1, Math.ceil(article.summary.split(' ').length / 30));

  return (
    <div className="group break-inside-avoid mb-6 bg-white p-8 border border-stone-200 hover:border-orange-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 rounded-xl relative overflow-hidden">
      
      {/* Decorative top accent on hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>

      {/* Meta Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded-sm">
          {article.district}
        </span>
        <span className="text-xs font-medium text-stone-400 font-sans">
          {article.timestamp}
        </span>
      </div>
      
      {/* Title */}
      <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-tight mb-4 group-hover:text-orange-900 transition-colors">
        {article.title}
      </h3>
      
      {/* Summary */}
      <p className="font-sans text-stone-600 leading-relaxed text-sm mb-6 line-clamp-4">
        {article.summary}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-auto">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 font-serif">
              {article.author.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-stone-900 uppercase tracking-wider">{article.author}</span>
              <span className="text-[9px] text-stone-400 font-medium">{readTime} min read</span>
            </div>
         </div>
         
         <button className="text-stone-300 group-hover:text-orange-500 transition-colors transform group-hover:translate-x-1 duration-300">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
           </svg>
         </button>
      </div>
    </div>
  );
};

export default NewsCard;