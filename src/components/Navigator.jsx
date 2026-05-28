import React, { useState } from 'react';
import { Search, Activity, Sprout, AlertCircle, ChevronRight } from 'lucide-react';
import { database } from '../data/database';

// Fast client-side Levenshtein Distance for fuzzy matching spelling errors
const getLevenshteinDistance = (a, b) => {
  const matrix = [];
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  for (let i = 0; i <= lenB; i++) matrix[i] = [i];
  for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[lenB][lenA];
};

export default function Navigator({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const cleanStr = (str) => (str || '').toLowerCase().trim();
  const searchTerms = cleanStr(query).split(' ').filter(Boolean);

  // Advanced fuzzy matching checks substrings or Levenshtein distance
  const matchesFuzzy = (targetText) => {
    if (!searchTerms.length) return true;
    const targetClean = cleanStr(targetText);
    const targetWords = targetClean.split(/[\s,.\-()]+/).filter(Boolean);

    return searchTerms.every(term => {
      // 1. Direct substring match (e.g. "neem" in "neem leaves")
      if (targetClean.includes(term)) return true;

      // 2. Fuzzy spelling distance check for words in target
      return targetWords.some(word => {
        if (word.length < 3) return false;
        
        // Calibrate threshold based on word length to prevent false-positives
        const maxDist = term.length >= 6 ? 2 : term.length >= 4 ? 1 : 0;
        const dist = getLevenshteinDistance(term, word);
        return dist <= maxDist;
      });
    });
  };

  // 1. Filter Conditions
  const filteredConditions = database.conditions.filter(c => 
    matchesFuzzy(c.name) || 
    matchesFuzzy(c.scientificName) || 
    matchesFuzzy(c.category) || 
    matchesFuzzy(c.description) ||
    c.symptoms.some(sId => matchesFuzzy(database.symptoms.find(s => s.id === sId)?.name))
  );

  // 2. Filter Remedies
  const filteredRemedies = database.remedies.filter(r => 
    matchesFuzzy(r.name) || 
    matchesFuzzy(r.scientificName) || 
    matchesFuzzy(r.category) || 
    matchesFuzzy(r.description) || 
    r.activeConstituents.some(c => matchesFuzzy(c))
  );

  // 3. Filter Symptoms
  const filteredSymptoms = database.symptoms.filter(s => 
    matchesFuzzy(s.name) || 
    matchesFuzzy(s.description)
  );

  const totalResults = filteredConditions.length + filteredRemedies.length + filteredSymptoms.length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Visual Welcome Hero */}
      <div className="text-center py-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--primary-green))] leading-tight">
          Empirical & Traditional Tropical Medicine Matrix
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto mt-2 text-sm md:text-base">
          Investigate botanical active compounds, modern pharmaceutical interventions, vector-borne clinical cycles, and evidence-graded health outcomes. Fully offline capable.
        </p>
      </div>

      {/* Dynamic Search Box */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-emerald-600" />
        </div>
        <input
          type="text"
          placeholder="Search (e.g. quinine, quiniformim, bilharza, hookworm, neem)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-[hsl(var(--primary-green),0.1)] rounded-xl shadow-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder-slate-400 font-medium text-sm md:text-base"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Toggles */}
      <div className="flex justify-center flex-wrap gap-2 max-w-xl mx-auto pt-2">
        {[
          { id: 'all', label: `All Entities (${query ? totalResults : database.conditions.length + database.remedies.length + database.symptoms.length})` },
          { id: 'conditions', label: `Conditions (${filteredConditions.length})`, icon: Activity },
          { id: 'remedies', label: `Remedies (${filteredRemedies.length})`, icon: Sprout },
          { id: 'symptoms', label: `Symptoms (${filteredSymptoms.length})`, icon: AlertCircle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border ${
              activeTab === tab.id
                ? 'bg-[hsl(var(--primary-green))] text-white border-[hsl(var(--primary-green))]'
                : 'bg-white text-emerald-800 border-[hsl(var(--primary-green),0.1)] hover:bg-emerald-50'
            }`}
          >
            {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {/* Conditions Section */}
        {(activeTab === 'all' || activeTab === 'conditions') && filteredConditions.map(c => (
          <div 
            key={c.id} 
            onClick={() => onNavigate('condition', c.id)}
            className="glass-panel p-5 cursor-pointer flex flex-col justify-between transition-all group animate-fade-in border-l-4 border-l-emerald-800 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {c.category}
                </span>
                <Activity className="h-4 w-4 text-emerald-700" />
              </div>
              <h3 className="text-lg font-bold group-hover:text-emerald-600 transition-colors mb-1">
                {c.name}
              </h3>
              <p className="text-xs italic text-slate-400 mb-3 block truncate">
                {c.scientificName}
              </p>
              <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                {c.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
              <span className="text-[10px] font-semibold text-slate-400">
                {c.symptoms.length} symptoms linked
              </span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5 group-hover:gap-1 transition-all">
                Details <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}

        {/* Remedies Section */}
        {(activeTab === 'all' || activeTab === 'remedies') && filteredRemedies.map(r => (
          <div 
            key={r.id} 
            onClick={() => onNavigate('remedy', r.id)}
            className="glass-panel p-5 cursor-pointer flex flex-col justify-between transition-all group animate-fade-in border-l-4 border-l-sky-500 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100">
                  {r.category === 'botanical' ? 'Botanical' : 'Pharmaceutical'}
                </span>
                <Sprout className="h-4 w-4 text-sky-500" />
              </div>
              <h3 className="text-lg font-bold group-hover:text-sky-600 transition-colors mb-1">
                {r.name}
              </h3>
              <p className="text-xs italic text-slate-400 mb-3 block truncate">
                {r.scientificName}
              </p>
              <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                {r.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
              <div className="flex flex-wrap gap-1">
                {r.activeConstituents.slice(0, 2).map((item, idx) => (
                  <span key={idx} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                    {item}
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-sky-700 flex items-center gap-0.5 group-hover:gap-1 transition-all">
                Details <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}

        {/* Symptoms Section */}
        {(activeTab === 'all' || activeTab === 'symptoms') && filteredSymptoms.map(s => (
          <div 
            key={s.id}
            className="glass-panel p-5 flex flex-col justify-between transition-all group animate-fade-in border-l-4 border-l-amber-500"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100">
                  Symptom Node
                </span>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {s.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                {s.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
              <span className="text-[10px] font-semibold text-slate-400">
                Relational entity
              </span>
              <span className="text-[10px] font-extrabold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                Primary Check
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Zero State */}
      {totalResults === 0 && (
        <div className="text-center py-12 glass-panel max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h4 className="font-bold text-lg text-slate-800">No results found</h4>
          <p className="text-xs text-slate-500 mt-1">
            We couldn't find matches for "{query}". Try searching "quiniformim", "bilharza", or "hookworm".
          </p>
        </div>
      )}
    </div>
  );
}
