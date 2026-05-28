import React, { useState } from 'react';
import { Filter, Star, Info, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { database } from '../data/database';

export default function EvidenceMatrix({ onNavigate }) {
  const [qualityFilter, setQualityFilter] = useState('all');
  const [strengthFilter, setStrengthFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const getRemedyName = (id) => database.remedies.find(r => r.id === id)?.name || id;
  const getRemedyType = (id) => database.remedies.find(r => r.id === id)?.category || 'botanical';
  const getConditionName = (id) => database.conditions.find(c => c.id === id)?.name || id;
  const getSymptomName = (id) => database.symptoms.find(s => s.id === id)?.name || id;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter matrix using GRADE framework parameters
  const filteredMatrix = database.outcomesMatrix.filter(row => {
    const remedyType = getRemedyType(row.remedyId);
    
    // Quality Filter
    const matchesQuality = qualityFilter === 'all' || row.gradeQuality === qualityFilter;

    // Strength Filter
    const matchesStrength = strengthFilter === 'all' || row.recommendationStrength === strengthFilter;
    
    // Type Filter
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'traditional' && remedyType === 'botanical') || 
      (typeFilter === 'pharmaceutical' && remedyType === 'pharmaceutical');

    return matchesQuality && matchesStrength && matchesType;
  });

  const getQualityBadgeClass = (quality) => {
    switch (quality) {
      case 'High': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Moderate': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Low': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getStrengthBadgeClass = (strength) => {
    switch (strength) {
      case 'Strong For': return 'bg-emerald-600 text-white border-emerald-700';
      case 'Conditional For': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Conditional Against': return 'bg-amber-50 text-amber-700 border-amber-300';
      default: return 'bg-rose-600 text-white border-rose-700';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header and Filter Controls */}
      <div className="glass-panel p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-700" />
            Tropical Evidence Matrix (WHO GRADE Standards)
          </h2>
          <p className="text-xs text-slate-500">
            Adopted the GRADE framework to evaluate treatment recommendations. Quality tiers range from High to Very Low; Strength metrics guide clinical implementation.
          </p>
        </div>

        {/* Matrix Filters */}
        <div className="flex flex-wrap gap-2 text-xs">
          {/* Type Toggle */}
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg font-bold px-2 py-1.5 outline-none focus:border-emerald-500"
          >
            <option value="all">All Remedy Types</option>
            <option value="traditional">Traditional Botanicals</option>
            <option value="pharmaceutical">Modern Pharmaceuticals</option>
          </select>

          {/* Quality Toggle */}
          <select 
            value={qualityFilter} 
            onChange={(e) => setQualityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg font-bold px-2 py-1.5 outline-none focus:border-emerald-500"
          >
            <option value="all">All Evidence Qualities</option>
            <option value="High">GRADE: High</option>
            <option value="Moderate">GRADE: Moderate</option>
            <option value="Low">GRADE: Low</option>
            <option value="Very Low">GRADE: Very Low</option>
          </select>

          {/* Strength Toggle */}
          <select 
            value={strengthFilter} 
            onChange={(e) => setStrengthFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg font-bold px-2 py-1.5 outline-none focus:border-emerald-500"
          >
            <option value="all">All Recommendation Strengths</option>
            <option value="Strong For">Strong Recommendation For</option>
            <option value="Conditional For">Conditional Recommendation For</option>
            <option value="Conditional Against">Conditional Recommendation Against</option>
            <option value="Strong Against">Strong Recommendation Against</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      <div className="glass-panel overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 bg-emerald-950/5 p-4 border-b border-slate-200 text-xs font-bold text-emerald-900">
          <div className="col-span-3">Intervention / Remedy</div>
          <div className="col-span-3">Target Condition / Symptom</div>
          <div className="col-span-2 text-center">GRADE Quality</div>
          <div className="col-span-2 text-center">Recommendation Strength</div>
          <div className="col-span-2 text-center">Traditional Alignment</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {filteredMatrix.map(row => {
            const remedyType = getRemedyType(row.remedyId);
            const isExpanded = expandedId === row.id;

            return (
              <div 
                key={row.id} 
                className={`transition-colors duration-200 ${isExpanded ? 'bg-emerald-50/20' : 'hover:bg-slate-50/50'}`}
              >
                {/* Visual Row */}
                <div 
                  onClick={() => toggleExpand(row.id)}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-4 items-center cursor-pointer text-sm"
                >
                  {/* Remedy Cell */}
                  <div className="col-span-3 font-semibold text-slate-800 flex flex-col">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('remedy', row.remedyId);
                      }}
                      className="hover:underline hover:text-emerald-700 cursor-pointer text-xs md:text-sm"
                    >
                      {getRemedyName(row.remedyId)}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize font-medium mt-0.5">
                      {remedyType === 'botanical' ? 'Traditional Plant' : 'Modern Synthesis'}
                    </span>
                  </div>

                  {/* Outcome target */}
                  <div className="col-span-3 flex flex-col lg:block">
                    <span className="lg:hidden text-[9px] uppercase font-bold text-slate-400 mb-0.5">Indication:</span>
                    <span className="font-medium text-slate-700 text-xs md:text-sm">
                      {getSymptomName(row.targetSymptomId)}
                    </span>
                    <span className="text-xs text-slate-400 block lg:inline lg:before:content-['·'] lg:before:mx-1">
                      {getConditionName(row.conditionId)}
                    </span>
                  </div>

                  {/* GRADE Quality */}
                  <div className="col-span-2 flex lg:justify-center items-center gap-2">
                    <span className="lg:hidden text-[9px] uppercase font-bold text-slate-400">Quality:</span>
                    <span 
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getQualityBadgeClass(row.gradeQuality)}`}
                    >
                      {row.gradeQuality}
                    </span>
                  </div>

                  {/* Recommendation Strength */}
                  <div className="col-span-2 flex lg:justify-center items-center gap-2">
                    <span className="lg:hidden text-[9px] uppercase font-bold text-slate-400">Strength:</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStrengthBadgeClass(row.recommendationStrength)}`}>
                      {row.recommendationStrength}
                    </span>
                  </div>

                  {/* Traditional Alignment */}
                  <div className="col-span-2 flex lg:justify-center items-center gap-2">
                    <span className="lg:hidden text-[9px] uppercase font-bold text-slate-400">Alignment:</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600`}>
                      {row.traditionalAlignment}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-5 bg-emerald-50/10 border-t border-slate-100 flex flex-col md:flex-row gap-6 animate-fade-in">
                    {/* Detailed Summary */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                        <Info className="h-4 w-4" />
                        <span>HUMAN CLINICAL EFFICACY RESEARCH SUMMARY</span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                        {row.clinicalSummary}
                      </p>
                    </div>

                    {/* Citations Box */}
                    <div className="w-full md:w-80 bg-white p-4 border border-[hsl(var(--primary-green),0.06)] rounded-xl flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700 mb-2">
                          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                          <span>PRIMARY REFERENCE SOURCE</span>
                        </div>
                        <p className="text-xs text-slate-500 italic leading-relaxed">
                          "{row.citation}"
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Ref ID: {row.id}</span>
                        <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                          <CheckCircle className="h-3 w-3" /> GRADE Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredMatrix.length === 0 && (
          <div className="text-center py-12">
            <Info className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">No outcomes match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
