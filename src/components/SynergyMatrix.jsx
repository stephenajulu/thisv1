import React, { useState, useMemo } from 'react';
import { database } from '../data/database';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  X, 
  Baby, 
  Sparkles, 
  Info, 
  Printer, 
  FlameKindling,
  UserCheck,
  ChevronRight,
  Bookmark
} from 'lucide-react';

export default function SynergyMatrix() {
  const [selectedCompounds, setSelectedCompounds] = useState([]);
  const [activeProfile, setActiveProfile] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Expose remedies list from database
  const remedies = useMemo(() => database.remedies || [], []);
  
  // Expose populations list
  const populations = useMemo(() => database.populations || [], []);

  // Filter out compounds already selected and match search query
  const filteredRemedies = useMemo(() => {
    if (!searchQuery.trim()) return remedies.slice(0, 5);
    const query = searchQuery.toLowerCase();
    return remedies.filter(r => 
      !selectedCompounds.some(selected => selected.id === r.id) &&
      (r.name.toLowerCase().includes(query) || 
       r.scientificName.toLowerCase().includes(query) ||
       r.category.toLowerCase().includes(query))
    );
  }, [remedies, selectedCompounds, searchQuery]);

  // Fast-tap common remedies presets
  const fastTapPresets = [
    { id: 'artemether-lumefantrine', label: 'ACT Antimalarial' },
    { id: 'oral-rehydration-salts', label: 'ORS Rehydration' },
    { id: 'neem-leaves', label: 'Neem Leaves' },
    { id: 'moringa-leaves', label: 'Moringa Leaves' },
    { id: 'aloe-vera', label: 'Aloe Vera' },
    { id: 'albendazole', label: 'Albendazole dewormer' }
  ];

  const toggleCompound = (compoundId) => {
    const comp = remedies.find(r => r.id === compoundId);
    if (!comp) return;

    if (selectedCompounds.some(c => c.id === compoundId)) {
      setSelectedCompounds(selectedCompounds.filter(c => c.id !== compoundId));
    } else {
      setSelectedCompounds([...selectedCompounds, comp]);
    }
  };

  const addCompound = (compound) => {
    if (!selectedCompounds.some(c => c.id === compound.id)) {
      setSelectedCompounds([...selectedCompounds, compound]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeCompound = (compoundId) => {
    setSelectedCompounds(selectedCompounds.filter(c => c.id !== compoundId));
  };

  const clearAll = () => {
    setSelectedCompounds([]);
    setActiveProfile('general');
  };

  // Dynamic Audit calculation engine
  const auditResults = useMemo(() => {
    const results = {
      contraindicated: [],
      caution: [],
      synergy: []
    };

    if (selectedCompounds.length === 0) return results;

    const selectedIds = selectedCompounds.map(c => c.id);
    const interactions = database.interactions || [];

    // 1. Audit Pairwise Interactions
    for (let i = 0; i < selectedIds.length; i++) {
      for (let j = i + 1; j < selectedIds.length; j++) {
        const idA = selectedIds[i];
        const idB = selectedIds[j];

        // Find matches in database
        const match = interactions.find(inter => 
          inter.compounds.includes(idA) && inter.compounds.includes(idB)
        );

        if (match) {
          const compA = remedies.find(r => r.id === idA)?.name || idA;
          const compB = remedies.find(r => r.id === idB)?.name || idB;
          const formattedMatch = {
            ...match,
            compNameA: compA,
            compNameB: compB
          };

          if (match.severity === 'contraindicated') {
            results.contraindicated.push(formattedMatch);
          } else if (match.severity === 'caution') {
            results.caution.push(formattedMatch);
          } else if (match.severity === 'synergy') {
            results.synergy.push(formattedMatch);
          }
        }
      }
    }

    // 2. Audit Patient Profile Demographic Cautions
    if (activeProfile !== 'general') {
      const activePop = populations.find(p => p.id === activeProfile);
      
      selectedCompounds.forEach(compound => {
        const cautionMatch = compound.demographicCautions?.find(
          caution => caution.populationId === activeProfile
        );

        if (cautionMatch) {
          const demographicCaution = {
            id: `dem-${compound.id}-${activeProfile}`,
            compNameA: compound.name,
            compNameB: activePop.name,
            title: cautionMatch.title || 'Demographic Caution',
            description: cautionMatch.message,
            gradeQuality: 'High', // Standard clinical warning quality
            clinicalAdvice: 'Examine alternative therapies or adjust dosages according to primary standard guides.',
            citation: 'WHO Bedside Outpost Advisory',
            severity: cautionMatch.type === 'danger' ? 'contraindicated' : 'caution'
          };

          if (demographicCaution.severity === 'contraindicated') {
            results.contraindicated.push(demographicCaution);
          } else {
            results.caution.push(demographicCaution);
          }
        }
      });
    }

    return results;
  }, [selectedCompounds, activeProfile, remedies, populations]);

  const hasAlerts = 
    auditResults.contraindicated.length > 0 || 
    auditResults.caution.length > 0 || 
    auditResults.synergy.length > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-1 sm:p-2">
      {/* Clinician Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 no-print">
        <div>
          <h2 className="text-xl font-black font-outfit text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-emerald-650 animate-pulse" />
            Compound Synergy & Interaction Explorer
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit multiple concurrent pharmaceuticals and traditional botanicals to resolve bedside toxicities.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Report
          </button>
          {selectedCompounds.length > 0 && (
            <button 
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Reset Engine
            </button>
          )}
        </div>
      </div>

      {/* Grid containing audit dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Selectors and Inputs */}
        <div className="lg:col-span-5 space-y-5 no-print">
          
          {/* Compound Selection Panel */}
          <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              1. Add Bedside Compounds
            </span>

            {/* Tokenized Search Box */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Query herb, drug, or category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="bg-transparent border-none outline-none text-xs w-full text-slate-700 font-bold placeholder-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {/* Dynamic Dropdown results */}
              {showDropdown && (searchQuery.trim() !== '' || filteredRemedies.length > 0) && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)} 
                  />
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-scale-up">
                    <div className="p-2 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Matches in Registry
                    </div>
                    {filteredRemedies.length > 0 ? (
                      filteredRemedies.map(rem => (
                        <button
                          key={rem.id}
                          onClick={() => addCompound(rem)}
                          className="w-full text-left p-3 hover:bg-slate-50 flex justify-between items-center transition-all cursor-pointer"
                        >
                          <div>
                            <strong className="text-xs text-slate-800 block">{rem.name}</strong>
                            <span className="text-[10px] text-slate-450 italic">{rem.scientificName}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            rem.category === 'pharmaceutical' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {rem.category}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No unselected compounds match query
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Fast-Tap selection list */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">
                Common Outpost Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {fastTapPresets.map(preset => {
                  const isChecked = selectedCompounds.some(c => c.id === preset.id);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => toggleCompound(preset.id)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isChecked 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${isChecked ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'}`} />
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Demographic Patient Profile Selector */}
          <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                2. Active Patient Profile
              </span>
              <UserCheck className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-2">
              <select
                value={activeProfile}
                onChange={(e) => setActiveProfile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="general">General Outpost Population</option>
                {populations.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} Profile
                  </option>
                ))}
              </select>
              
              {activeProfile !== 'general' && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] leading-relaxed text-slate-500 font-medium">
                  {populations.find(p => p.id === activeProfile)?.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output display and reports */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Active compounds banner for printing and visual reference */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl text-white space-y-3 relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
              <FlameKindling className="h-44 w-44" />
            </div>
            
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Active Audit Compounds
              </span>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 border border-slate-700 rounded-lg">
                Patient: {activeProfile === 'general' ? 'General' : populations.find(p => p.id === activeProfile)?.name}
              </span>
            </div>

            {selectedCompounds.length > 0 ? (
              <div className="flex flex-wrap gap-2 relative z-10">
                {selectedCompounds.map(comp => (
                  <div
                    key={comp.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-100 select-none animate-scale-up"
                  >
                    <span>{comp.name}</span>
                    <button 
                      onClick={() => removeCompound(comp.id)}
                      className="text-slate-400 hover:text-white transition-all no-print"
                    >
                      <X className="h-3.5 w-3.5 bg-slate-700/60 rounded-full p-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic relative z-10">
                No compounds selected. Add pharmaceuticals or botanicals to trigger the dynamic synergy audit engine.
              </p>
            )}
          </div>

          {/* Core calculated results list */}
          {selectedCompounds.length > 0 ? (
            <div className="space-y-4">
              
              {/* If no alerts are detected */}
              {!hasAlerts && (
                <div className="p-8 bg-emerald-50/30 border border-emerald-200/50 rounded-3xl text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-800 font-outfit">CLINICALLY CLEAR COMBINATION</h3>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1 leading-relaxed">
                      No active drug-drug, drug-herb, or demographic clearance warnings detected in the relational registry for these selected compounds.
                    </p>
                  </div>
                </div>
              )}

              {/* CONTRAINDICATED (RED CATEGORY) */}
              {auditResults.contraindicated.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block font-outfit">
                    🔴 CRITICAL CONTRAINDICATIONS ({auditResults.contraindicated.length})
                  </span>
                  
                  {auditResults.contraindicated.map((match, idx) => (
                    <div 
                      key={match.id || idx}
                      className="p-5 bg-rose-950/80 border border-rose-900 rounded-3xl space-y-3 shadow-md shadow-rose-950/5 relative overflow-hidden animate-pulse"
                    >
                      <div className="flex gap-3 items-start relative z-10 text-rose-100">
                        <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-widest text-rose-400 font-outfit">
                            {match.title}
                          </h4>
                          <span className="text-[10px] text-rose-300 font-bold block">
                            Intersection: {match.compNameA} + {match.compNameB}
                          </span>
                          <p className="text-[11px] leading-relaxed opacity-90 font-medium pt-1 text-slate-200">
                            {match.description}
                          </p>
                        </div>
                      </div>

                      {/* Mechanism and recommendations tray */}
                      <div className="p-3 bg-rose-950 border border-rose-900 rounded-2xl space-y-2 text-[11px] relative z-10">
                        <div className="flex justify-between items-center text-[9px] font-black text-rose-400 uppercase tracking-wider">
                          <span>Outpost Bedside Directive</span>
                          <span className="bg-rose-900 text-rose-100 px-2 py-0.5 rounded border border-rose-800">
                            GRADE Evidence: {match.gradeQuality}
                          </span>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-bold">
                          • <strong>Bedside Action:</strong> {match.clinicalAdvice}
                        </p>
                        <span className="text-[9px] text-rose-455 block border-t border-rose-900 pt-1.5 italic font-bold">
                          Source: {match.citation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CAUTION (AMBER CATEGORY) */}
              {auditResults.caution.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block font-outfit">
                    🟡 MODERATE CAUTIONS & INTERACTIONS ({auditResults.caution.length})
                  </span>
                  
                  {auditResults.caution.map((match, idx) => (
                    <div 
                      key={match.id || idx}
                      className="p-5 bg-white border border-amber-200 rounded-3xl space-y-3 shadow-xs relative overflow-hidden"
                    >
                      <div className="flex gap-3 items-start relative z-10 text-slate-700">
                        <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 font-outfit">
                            {match.title}
                          </h4>
                          <span className="text-[10px] text-slate-450 font-bold block">
                            Intersection: {match.compNameA} + {match.compNameB}
                          </span>
                          <p className="text-[11px] leading-relaxed text-slate-500 font-medium pt-1">
                            {match.description}
                          </p>
                        </div>
                      </div>

                      {/* Recommendations tray */}
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2 text-[11px] relative z-10 text-slate-750">
                        <div className="flex justify-between items-center text-[9px] font-black text-amber-700 uppercase tracking-wider">
                          <span>Outpost Bedside Directive</span>
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                            GRADE Evidence: {match.gradeQuality}
                          </span>
                        </div>
                        <p className="leading-relaxed font-bold">
                          • <strong>Bedside Action:</strong> {match.clinicalAdvice}
                        </p>
                        <span className="text-[9px] text-slate-450 block border-t border-amber-200/40 pt-1.5 italic font-bold">
                          Source: {match.citation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SYNERGY (GREEN CATEGORY) */}
              {auditResults.synergy.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block font-outfit">
                    ✨ THERAPEUTIC SYNERGIES ({auditResults.synergy.length})
                  </span>
                  
                  {auditResults.synergy.map((match, idx) => (
                    <div 
                      key={match.id || idx}
                      className="p-5 bg-white border border-emerald-250 rounded-3xl space-y-3 shadow-xs relative overflow-hidden"
                    >
                      {/* Decorative glowing green spot */}
                      <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex gap-3 items-start relative z-10 text-slate-700">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 font-outfit">
                            {match.title}
                          </h4>
                          <span className="text-[10px] text-slate-450 font-bold block">
                            Intersection: {match.compNameA} + {match.compNameB}
                          </span>
                          <p className="text-[11px] leading-relaxed text-slate-500 font-medium pt-1">
                            {match.description}
                          </p>
                        </div>
                      </div>

                      {/* Recommendations tray */}
                      <div className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-2 text-[11px] relative z-10 text-slate-750">
                        <div className="flex justify-between items-center text-[9px] font-black text-emerald-800 uppercase tracking-wider">
                          <span>Outpost Bedside Directive</span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                            GRADE Evidence: {match.gradeQuality}
                          </span>
                        </div>
                        <p className="leading-relaxed font-bold">
                          • <strong>Bedside Action:</strong> {match.clinicalAdvice}
                        </p>
                        <span className="text-[9px] text-slate-450 block border-t border-emerald-200/40 pt-1.5 italic font-bold">
                          Source: {match.citation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            /* Breathtaking empty state welcome dashboard */
            <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm relative overflow-hidden select-none">
              <div className="absolute -right-20 -top-20 h-48 w-48 bg-slate-50 rounded-full blur-2xl" />
              
              <div className="mx-auto h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 relative z-10 shadow-inner">
                <Bookmark className="h-8 w-8 text-slate-350" />
              </div>
              
              <div className="space-y-1 relative z-10 max-w-sm mx-auto">
                <h3 className="text-base font-extrabold text-slate-800 font-outfit tracking-tight">
                  Add Compounds to Start Bedside Auditing
                </h3>
                <p className="text-xs leading-relaxed text-slate-450 font-medium">
                  Search drugs and herbs or tap presets in the left panel to examine clearance blocks, gestational abortifacients, or beneficial recovery synergies.
                </p>
              </div>

              {/* Display a small clinical advice footer */}
              <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center relative z-10">
                <Info className="h-4 w-4 text-slate-300" />
                <span>Supports over 32 standard pharmaceuticals and traditional botanicals.</span>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Optimized black-and-white printing layout */}
      <div className="hidden print:block space-y-6 pt-10">
        <div className="border-b border-black pb-4 text-center">
          <h1 className="text-xl font-black uppercase font-outfit">Tropical Outpost Medical Registry Report</h1>
          <p className="text-xs">Tropical Health Information System (THIS) | Date Generated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase border-b pb-1">1. Audited Compounds</h3>
          <p className="text-xs font-mono">
            Compounds: {selectedCompounds.map(c => c.name).join(', ') || 'None selected'}
            <br />
            Demographic Profile Context: {activeProfile === 'general' ? 'General Population' : populations.find(p => p.id === activeProfile)?.name}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase border-b pb-1">2. Interaction and Synergy Audits</h3>
          {hasAlerts ? (
            <div className="space-y-4 divide-y divide-black/10">
              {[
                ...auditResults.contraindicated,
                ...auditResults.caution,
                ...auditResults.synergy
              ].map((match, idx) => (
                <div key={idx} className="pt-3 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>[{match.severity?.toUpperCase() || 'CONTRAINDICATED'}] {match.title}</span>
                    <span>GRADE Quality: {match.gradeQuality}</span>
                  </div>
                  <p className="italic">Compounds: {match.compNameA} + {match.compNameB}</p>
                  <p><strong>Pathological Description:</strong> {match.description}</p>
                  <p><strong>Outpost Directive:</strong> {match.clinicalAdvice}</p>
                  <p className="text-[10px] text-slate-500">Source: {match.citation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic">No active interactions or cautionary alerts detected for this selection.</p>
          )}
        </div>

        <div className="text-[10px] text-center pt-20 border-t border-black/10">
          This report is optimized for physical clinical record books. Check all dosage guidelines before administering treatments.
        </div>
      </div>
    </div>
  );
}
