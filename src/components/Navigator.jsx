import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity, Sprout, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { database } from '../data/database';
import { getLocalizedRemedy } from '../utils/regionalHelper';
import { useI18n } from '../utils/i18n';

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

const boostedConditionsByRegion = {
  lodwar: ['dehydration', 'malnutrition-sam', 'heat-stroke'],
  mombasa: ['lymphatic-filariasis', 'dengue', 'chikungunya'],
  kakamega: ['ascariasis', 'hookworm', 'leptospirosis'],
  nairobi: []
};

export default function Navigator({ 
  onNavigate, 
  selectedRegion,
  searchQuery: query,
  setSearchQuery: setQuery,
  activeTab,
  setActiveTab,
  visibleCount,
  setVisibleCount,
  scrollPosition,
  setScrollPosition
}) {
  const { t } = useI18n();
  const sentinelRef = useRef(null);
  const isFirstRender = useRef(true);
  const [isRestored, setIsRestored] = useState(scrollPosition === 0);

  // Restore scroll position on mount
  useEffect(() => {
    if (scrollPosition > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: 'instant' });
        setIsRestored(true);
      }, 80);
      return () => clearTimeout(timer);
    } else {
      setIsRestored(true);
    }
  }, []);

  // Save scroll position on scroll
  useEffect(() => {
    if (!isRestored) return;
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isRestored, setScrollPosition]);

  const cleanStr = (str) => (str || '').toLowerCase().trim();
  const searchTerms = cleanStr(query).split(' ').filter(Boolean);

  // Localize database remedies dynamically using regional county overrides
  const localizedRemedies = database.remedies.map(r => getLocalizedRemedy(r, selectedRegion));

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

  // Reset infinite scroll count on query search or tab toggle
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setVisibleCount(12);
  }, [query, activeTab]);

  // 1. Filter Conditions (handles both array of string and array of object symptoms schemas)
  const filteredConditions = database.conditions.filter(c => 
    matchesFuzzy(c.name) || 
    matchesFuzzy(c.scientificName) || 
    matchesFuzzy(c.category) || 
    matchesFuzzy(c.description) ||
    c.symptoms.some(sObj => {
      const sId = sObj.id || sObj;
      const symptomNode = database.symptoms.find(s => s.id === sId);
      return symptomNode && matchesFuzzy(symptomNode.name);
    })
  );

  // 2. Filter Remedies (uses localized name, details, and Swahili/tribal synonyms)
  const filteredRemedies = localizedRemedies.filter(r => 
    matchesFuzzy(r.name) || 
    matchesFuzzy(r.scientificName) || 
    matchesFuzzy(r.category) || 
    matchesFuzzy(r.description) || 
    r.activeConstituents.some(c => matchesFuzzy(c)) ||
    (r.synonyms && r.synonyms.some(s => matchesFuzzy(s)))
  );

  // 3. Filter Symptoms
  const filteredSymptoms = database.symptoms.filter(s => 
    matchesFuzzy(s.name) || 
    matchesFuzzy(s.description)
  );

  const totalResults = filteredConditions.length + filteredRemedies.length + filteredSymptoms.length;

  const isBoosted = (match) => {
    if (match.type !== 'condition') return false;
    const list = boostedConditionsByRegion[selectedRegion] || [];
    return list.includes(match.data.id);
  };

  // compile all unified matches based on the toggled category tab
  const allMatches = [];
  if (activeTab === 'all' || activeTab === 'conditions') {
    filteredConditions.forEach(c => allMatches.push({ type: 'condition', data: c }));
  }
  if (activeTab === 'all' || activeTab === 'remedies') {
    filteredRemedies.forEach(r => allMatches.push({ type: 'remedy', data: r }));
  }
  if (activeTab === 'all' || activeTab === 'symptoms') {
    filteredSymptoms.forEach(s => allMatches.push({ type: 'symptom', data: s }));
  }

  // Sort: Boosted/Endemic conditions bubble to the top of the list first, followed alphabetically
  allMatches.sort((a, b) => {
    const aBoosted = isBoosted(a);
    const bBoosted = isBoosted(b);
    if (aBoosted && !bBoosted) return -1;
    if (!aBoosted && bBoosted) return 1;
    return a.data.name.localeCompare(b.data.name);
  });

  // Extract the sliced visible subset
  const displayedMatches = allMatches.slice(0, visibleCount);

  // IntersectionObserver high-performance batch loader triggers on scroll sentinel
  useEffect(() => {
    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min(prev + 12, allMatches.length));
      }
    }, {
      rootMargin: '200px', // Load cards 200px early before the scroll hits the bottom!
    });

    observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [sentinelRef.current, allMatches.length]);

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
          placeholder="Search (e.g. malaria, scabies, neem, permethrin, rabies, ivermectin)..."
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
                ? 'bg-[hsl(var(--primary-green))] text-white border-[hsl(var(--primary-green))] shadow'
                : 'bg-white text-emerald-800 border-[hsl(var(--primary-green),0.1)] hover:bg-emerald-50'
            }`}
          >
            {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Results with Unified Infinite Scroll */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {displayedMatches.map(match => {
          if (match.type === 'condition') {
            const c = match.data;
            const boosted = isBoosted(match);
            return (
              <div 
                key={`cond-${c.id}`} 
                onClick={() => onNavigate('condition', c.id)}
                className={`glass-panel p-5 cursor-pointer flex flex-col justify-between transition-all group animate-scale-up border-l-4 hover:-translate-y-0.5 ${
                  boosted 
                    ? 'border-l-amber-600 bg-amber-50/10' 
                    : 'border-l-emerald-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {c.category}
                      </span>
                      {boosted && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-extrabold animate-pulse">
                          ★ {t('endemicBadge') || 'Endemic in Region'}
                        </span>
                      )}
                    </div>
                    <Activity className="h-4 w-4 text-emerald-700 animate-pulse" />
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
            );
          }

          if (match.type === 'remedy') {
            const r = match.data;
            
            const getAvailabilityBadge = (avail) => {
              switch (avail) {
                case 'abundant': return 'bg-emerald-50 text-emerald-700 border-emerald-250 font-bold';
                case 'scarce': return 'bg-rose-50 text-rose-700 border-rose-250 font-bold';
                case 'moderate':
                default: return 'bg-amber-50 text-amber-700 border-amber-250 font-bold';
              }
            };

            return (
              <div 
                key={`rem-${r.id}`} 
                onClick={() => onNavigate('remedy', r.id)}
                className="glass-panel p-5 cursor-pointer flex flex-col justify-between transition-all group animate-scale-up border-l-4 border-l-sky-500 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100">
                        {r.category === 'botanical' ? 'Botanical' : 'Pharmaceutical'}
                      </span>
                      {r.category === 'botanical' && (
                        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${getAvailabilityBadge(r.availability)}`}>
                          {r.availability}
                        </span>
                      )}
                    </div>
                    <Sprout className="h-4 w-4 text-sky-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-sky-600 transition-colors mb-1 font-outfit">
                    {r.name}
                  </h3>
                  {r.baselineName && r.baselineName !== r.name && (
                    <span className="text-[10px] text-slate-400 block mb-1.5 font-medium italic">
                      Baseline: {r.baselineName}
                    </span>
                  )}
                  <p className="text-xs italic text-slate-450 mb-3 block truncate">
                    {r.scientificName}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {r.description}
                  </p>
                  
                  {/* Dialect / Vernacular Plant Names Drawer (Low Clutter) */}
                  {r.synonyms && r.synonyms.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100/50 text-[10px] text-slate-400">
                      <strong className="text-slate-550 font-bold">{t('vernacularTitle') || 'Dialect / Vernacular Plant Names'}: </strong>
                      <span className="font-semibold italic text-sky-800">{r.synonyms.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100/50 mt-2">
                  <div className="flex flex-wrap gap-1">
                    {r.activeConstituents.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">
                        {item}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-sky-700 flex items-center gap-0.5 group-hover:gap-1 transition-all">
                    Details <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          }

          if (match.type === 'symptom') {
            const s = match.data;
            return (
              <div 
                key={`sym-${s.id}`}
                className="glass-panel p-5 flex flex-col justify-between transition-all group animate-scale-up border-l-4 border-l-amber-500"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100">
                      Symptom Node
                    </span>
                    <AlertCircle className="h-4 w-4 text-amber-500 group-hover:rotate-12 transition-transform" />
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
            );
          }

          return null;
        })}
      </div>

      {/* Infinite Scroll Loader Sentinel */}
      {visibleCount < allMatches.length && (
        <div 
          ref={sentinelRef} 
          className="w-full py-6 flex items-center justify-center gap-2.5 text-slate-500 border border-emerald-100/50 bg-emerald-50/20 rounded-2xl max-w-sm mx-auto shadow-inner animate-pulse my-4"
        >
          <Loader2 className="h-4 w-4 text-emerald-800 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-955">
            Scanning remaining databases...
          </span>
        </div>
      )}

      {/* Collaborative Contributions Banner */}
      <div className="glass-panel p-5 mt-8 bg-gradient-to-r from-emerald-50/20 to-sky-50/10 border border-emerald-100/60 flex flex-col md:flex-row items-center justify-between gap-4 animate-scale-up">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wide flex items-center gap-1.5 justify-center md:justify-start">
            <Sprout className="h-4 w-4 text-emerald-700 animate-pulse animate-spin-slow" />
            Contribute to the Medical Registry
          </h4>
          <p className="text-[11px] text-slate-500 max-w-2xl leading-relaxed">
            Are we missing an ethnobotanical remedy, an ICD-11 vector condition, or scientific outcome matrices? Help clinicians and rural outposts worldwide by contributing your empirical research to our peer-review repository.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.netlifyIdentity) {
              window.netlifyIdentity.open();
            } else {
              window.location.href = '/admin/';
            }
          }}
          className="px-4 py-2 bg-emerald-850 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 shrink-0 transition-all hover:scale-[1.03] cursor-pointer"
        >
          Join Peer-Review Board
        </button>
      </div>

      {/* Zero State */}
      {totalResults === 0 && (
        <div className="text-center py-12 glass-panel max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h4 className="font-bold text-lg text-slate-800">No results found</h4>
          <p className="text-xs text-slate-500 mt-1">
            We couldn't find matches for "{query}". Try searching "scabies", "neem seed oil", or "rabies".
          </p>
        </div>
      )}
    </div>
  );
}
