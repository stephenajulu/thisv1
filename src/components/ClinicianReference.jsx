import React, { useState } from 'react';
import { 
  Stethoscope, 
  CheckSquare, 
  Plus, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  ShieldCheck, 
  Printer, 
  Activity, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { database } from '../data/database';

export default function ClinicianReference() {
  const [selectedSymptomIds, setSelectedSymptomIds] = useState([]);

  const toggleSymptom = (sId) => {
    setSelectedSymptomIds(prev => 
      prev.includes(sId) ? prev.filter(id => id !== sId) : [...prev, sId]
    );
  };

  // Dynamic diagnostic symptom matching index
  const evaluateSymptoms = () => {
    if (selectedSymptomIds.length === 0) return [];

    const results = database.conditions.map(cond => {
      const conditionSymptoms = cond.symptoms || [];
      const matchedSymptoms = conditionSymptoms.filter(sId => selectedSymptomIds.includes(sId));
      const matchCount = matchedSymptoms.length;
      const totalSymptomCount = conditionSymptoms.length;
      const matchPct = totalSymptomCount > 0 ? Math.round((matchCount / totalSymptomCount) * 100) : 0;

      return {
        ...cond,
        matchCount,
        matchPct,
        matchedSymptoms
      };
    })
    .filter(c => c.matchCount > 0)
    .sort((a, b) => b.matchPct - a.matchPct || b.matchCount - a.matchCount);

    return results;
  };

  const triageResults = evaluateSymptoms();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in space-y-6 clinician-mode">
      {/* Clinician Title Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-700 bg-emerald-950/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
            <Stethoscope className="h-5.5 w-5.5 text-emerald-800" />
            Rural Clinician Quick-Reference Helper
          </h2>
          <p className="text-xs text-slate-500">
            State-of-the-art condensed reference tool for rural health outposts. Designed for fast diagnostic triage, rehydration protocols, and emergency dosage tables.
          </p>
        </div>
        
        {/* Printable button */}
        <button
          onClick={handlePrint}
          className="no-print px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all self-stretch sm:self-auto justify-center cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Print Reference Sheets
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic Symptom Triage Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 space-y-4 bg-white shadow-sm border border-slate-100">
            <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckSquare className="h-4.5 w-4.5 text-emerald-750" />
              Symptom Triage Check
            </h3>
            
            {/* Dynamic Symptoms Checklist from Database */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {database.symptoms.map(sym => {
                const isChecked = selectedSymptomIds.includes(sym.id);
                return (
                  <label 
                    key={sym.id}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-650'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => toggleSymptom(sym.id)} 
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span>{sym.name}</span>
                      <span className="text-[9px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                        {sym.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Diagnostic Triage Output List */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-800" />
                Differential Diagnostic Triage:
              </h4>

              {triageResults.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-[9px] text-slate-450 italic block">
                    Listed in order of matching symptom probability and overlap:
                  </span>
                  
                  {triageResults.map(res => (
                    <div 
                      key={res.id}
                      className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                        res.matchPct >= 60 
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 shadow-sm' 
                          : 'bg-slate-50 border-slate-150 text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-sm text-slate-850">{res.name}</h5>
                            {res.icd11 && (
                              <span className="text-[8px] bg-blue-50 text-blue-800 border border-blue-150 px-1.5 py-0.2 rounded font-black tracking-wider uppercase">
                                ICD-11: {res.icd11}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 italic block mt-0.5">{res.scientificName}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          res.matchPct >= 66
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {res.matchPct}% Match
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-1">
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> Outpost Clinical Directive:
                        </span>
                        <p className="text-xs text-slate-655 leading-relaxed font-bold">
                          {res.triageAdvisory}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Select clinical symptoms above to generate real-time diagnostic triage advice.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rehydration & Recipe Guidelines Column */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* WHO ORS Recipe Card */}
          <div className="glass-panel p-5 space-y-4 bg-white shadow-sm border border-slate-100">
            <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Droplets className="h-4.5 w-4.5 text-emerald-750" />
              Standard WHO ORS Formulation
            </h3>
            
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                  CLINICAL PREPARATION
                </span>
                <p className="text-xs text-slate-655 leading-relaxed font-bold">
                  Dissolve <strong>1 standard ORS packet</strong> in exactly <strong>1 Liter of clean drinking water</strong> (boiled or filtered). Stir until completely clear. Never mix with juice, soda, or commercial formula.
                </p>
              </div>

              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                  TRADITIONAL / HOUSEHOLD ALTERNATIVE (Emergency only)
                </span>
                <p className="text-xs text-slate-655 leading-relaxed font-bold">
                  If commercial clinical sachets are unavailable, dissolve:
                  <br />
                  • <strong>6 level teaspoons of sugar</strong>
                  <br />
                  • <strong>0.5 level teaspoon of salt</strong>
                  <br />
                  In exactly <strong>1 Liter of clean drinking water</strong>. Stir until completely dissolved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Climate Risk Vector Guidelines */}
      <div className="glass-panel p-5 space-y-4 bg-white shadow-sm border border-slate-100">
        <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <CloudRain className="h-4.5 w-4.5 text-emerald-750" />
          Climate Vector Threat Triage Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <CloudRain className="h-4 w-4 text-sky-500" />
              Heavy Monsoon Seasons
            </div>
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              Creates massive standing water pools. High breeding potential for <strong>Anopheles mosquito larvae (Malaria)</strong>. Proactive mosquito net distribution is critical.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <Thermometer className="h-4 w-4 text-amber-500" />
              High Humidity Heatwaves
            </div>
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              High dehydration risk. Accelerates biting frequency and lifecycle replication for <strong>Aedes mosquitoes (Dengue)</strong>. Standardize hydration campaigns at field outposts.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <Plus className="h-4 w-4 text-emerald-600" />
              Severe Flooding Events
            </div>
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              Causes surface waste/sewage to overflow into shallow wells, multiplying <strong>Vibrio cholerae (Cholera)</strong> outbreaks. Distribute chlorine tablets immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
