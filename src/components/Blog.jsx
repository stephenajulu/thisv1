import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, User, Calendar, Clock, Layers, ShieldCheck, Heart } from 'lucide-react';
import { blogPosts } from '../data/collections/blog/blog-posts';
import { database } from '../data/database';

export default function Blog({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(blogPosts[0]?.id || null);

  const activePost = blogPosts.find(p => p.id === selectedPostId);

  const filteredPosts = blogPosts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      {/* Blog header */}
      <div className="glass-panel p-6 bg-white border-l-4 border-l-sky-600 shadow-sm no-print">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
          <BookOpen className="h-5.5 w-5.5 text-sky-600 animate-pulse" />
          THIS Clinical Blog & Interlinked Registry
        </h2>
        <p className="text-xs text-slate-500">
          Read peer-reviewed clinical articles, outbreak prevention guidelines, and traditional ethnopharmacology case reviews dynamically linked to our clinical registry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Article List */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="glass-panel p-4 bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredPosts.map(post => (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    selectedPostId === post.id
                      ? 'bg-sky-50/50 border-sky-400 text-sky-950 font-bold shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-black line-clamp-2 leading-snug">{post.title}</span>
                  <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 font-medium">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-[9px] text-slate-450 font-bold mt-1 pt-1.5 border-t border-slate-100/50">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                  </div>
                </button>
              ))}

              {filteredPosts.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-6 italic">No articles found matching search query.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Active Article & Relational Sidebar */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {activePost ? (
            <>
              {/* Article Viewport */}
              <div className="md:col-span-8 glass-panel p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3.5 space-y-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 leading-snug">{activePost.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-450 font-bold">
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-sky-600" /> {activePost.author}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {activePost.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {activePost.readTime}</span>
                  </div>
                </div>

                {/* Body Text */}
                <div className="text-xs text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                  {activePost.body}
                </div>
              </div>

              {/* Mapped Connections Sidebar */}
              <div className="md:col-span-4 space-y-4 no-print">
                {/* Linked Diseases */}
                <div className="glass-panel p-4 bg-white border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 pb-1.5">
                    <Layers className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
                    Linked Conditions
                  </h4>
                  
                  <div className="space-y-2">
                    {activePost.linkedConditions.map(cId => {
                      const cond = database.conditions.find(c => c.id === cId);
                      if (!cond) return null;
                      return (
                        <div 
                          key={cId}
                          onClick={() => onNavigate('condition', cId)}
                          className="p-2.5 rounded-lg border border-slate-150 bg-slate-50 hover:bg-sky-50/30 hover:border-sky-300 transition-all cursor-pointer group space-y-1"
                        >
                          <span className="text-xs font-black text-slate-850 flex items-center justify-between">
                            <span>{cond.name}</span>
                            <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <span className="text-[9px] text-slate-400 italic block">{cond.scientificName}</span>
                          {cond.icd11 && (
                            <span className="inline-block text-[8px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded font-mono font-bold mt-1">ICD-11: {cond.icd11}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Linked Remedies */}
                <div className="glass-panel p-4 bg-white border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 pb-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                    Linked Treatments
                  </h4>
                  
                  <div className="space-y-2">
                    {activePost.linkedRemedies.map(rId => {
                      const rem = database.remedies.find(r => r.id === rId);
                      if (!rem) return null;
                      return (
                        <div 
                          key={rId}
                          onClick={() => onNavigate('remedy', rId)}
                          className="p-2.5 rounded-lg border border-slate-150 bg-slate-50 hover:bg-rose-50/20 hover:border-rose-300 transition-all cursor-pointer group space-y-1"
                        >
                          <span className="text-xs font-black text-slate-850 flex items-center justify-between">
                            <span>{rem.name}</span>
                            <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <span className="text-[9px] text-slate-400 italic block">{rem.scientificName}</span>
                          <span className={`inline-block text-[8px] px-1.5 py-0.2 rounded font-extrabold uppercase mt-1 ${
                            rem.category === 'botanical' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                          }`}>{rem.category}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-12 glass-panel p-10 text-center flex flex-col items-center justify-center min-h-[250px] bg-white">
              <BookOpen className="h-10 w-10 text-slate-350 mb-2" />
              <h4 className="font-bold text-slate-650">Select an article to begin reading</h4>
              <p className="text-xs text-slate-405 mt-1">Select an article from the left drawer to browse dynamic medical links.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
