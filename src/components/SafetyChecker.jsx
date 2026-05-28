import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertOctagon, Heart, Users, RefreshCw } from 'lucide-react';
import { database } from '../data/database';
import { getLocalizedRemedy } from '../utils/regionalHelper';

export default function SafetyChecker({ selectedRegion }) {
  const [selectedPopulation, setSelectedPopulation] = useState('none');
  const [selectedRemedy, setSelectedRemedy] = useState('none');

  const populationObj = database.populations.find(p => p.id === selectedPopulation);
  const baseRemedyObj = database.remedies.find(r => r.id === selectedRemedy);
  const remedyObj = getLocalizedRemedy(baseRemedyObj, selectedRegion);

  // Relational safety caution lookup (No hardcoding)
  const getCustomIntersectionAlert = () => {
    if (!remedyObj || !remedyObj.demographicCautions) return null;
    const caution = remedyObj.demographicCautions.find(c => c.populationId === selectedPopulation);
    if (!caution) return null;
    return {
      type: caution.type,
      title: caution.title,
      message: caution.message
    };
  };

  const intersectionAlert = getCustomIntersectionAlert();

  const handleReset = () => {
    setSelectedPopulation('none');
    setSelectedRemedy('none');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Visual Header */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          Interactive Botanical & Clinical Safety Checker
        </h2>
        <p className="text-xs text-slate-500">
          Cross-reference natural herbal remedies and pharmaceutical compounds against specific vulnerable patient demographics to prevent toxicity and negative drug-herb interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Selectors */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1">
              <Users className="h-4 w-4" />
              1. Vulnerable Demographic
            </h3>
            <select
              value={selectedPopulation}
              onChange={(e) => setSelectedPopulation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="none">-- Select Target Group --</option>
              {database.populations.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1 pt-2">
              <Heart className="h-4 w-4" />
              2. Remedy or Botanical
            </h3>
            <select
              value={selectedRemedy}
              onChange={(e) => setSelectedRemedy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="none">-- Select Treatment --</option>
              {database.remedies.map(r => {
                const locR = getLocalizedRemedy(r, selectedRegion);
                return (
                  <option key={r.id} value={r.id}>{locR.name} ({r.scientificName.split(' ')[0]})</option>
                );
              })}
            </select>

            {(selectedPopulation !== 'none' || selectedRemedy !== 'none') && (
              <button 
                onClick={handleReset}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors mt-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Checker
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Warning Banners */}
        <div className="lg:col-span-8 space-y-4">
          {/* Zero Selection State */}
          {selectedPopulation === 'none' && selectedRemedy === 'none' && (
            <div className="glass-panel p-10 text-center flex flex-col items-center justify-center h-full min-h-[220px]">
              <ShieldAlert className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-600 text-sm">Select parameters to check safety</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Select a vulnerable population group and a remedy on the left to compute instant warnings and drug-herb interactions.
              </p>
            </div>
          )}

          {/* Core Intersection Alert (Primary warning) */}
          {intersectionAlert && (
            <div className={`p-5 rounded-xl border flex gap-3 animate-fade-in ${
              intersectionAlert.type === 'danger' 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : intersectionAlert.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              {intersectionAlert.type === 'danger' ? (
                <AlertOctagon className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wide mb-1">
                  {intersectionAlert.title}
                </h4>
                <p className="text-xs leading-relaxed">
                  {intersectionAlert.message}
                </p>
              </div>
            </div>
          )}

          {/* Demographic Alerts (Vulnerable Group overview) */}
          {populationObj && (
            <div className="glass-panel p-5 space-y-3 animate-fade-in">
              <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                Demographic Profile: <span className="text-emerald-800">{populationObj.name}</span>
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {populationObj.description}
              </p>
              
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-700 block">
                  CRITICAL CLINICAL ADVISORIES:
                </span>
                <ul className="space-y-1.5">
                  {populationObj.criticalAlerts.map((alert, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Remedy Safety Details */}
          {remedyObj && (
            <div className="glass-panel p-5 space-y-3 animate-fade-in">
              <h4 className="font-bold text-sm text-emerald-950 flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Remedy Specs: <span className="text-sky-800">{remedyObj.name}</span></span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  remedyObj.safetyRating.includes('High Caution') ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                  remedyObj.safetyRating.includes('Moderate') ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                  'bg-emerald-50 text-emerald-800 border border-emerald-100'
                }`}>
                  Safety: {remedyObj.safetyRating}
                </span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Contraindications */}
                <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-100 space-y-1">
                  <span className="text-[9px] uppercase font-black text-rose-800 tracking-wider block">
                    CONTRAINDICATIONS & SAFETY ALERTS:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {remedyObj.safetyAlert}
                  </p>
                </div>

                {/* Drug interactions */}
                <div className="bg-amber-50/30 p-3 rounded-lg border border-amber-100 space-y-1">
                  <span className="text-[9px] uppercase font-black text-amber-800 tracking-wider block">
                    KNOWN DRUG INTERACTIONS:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {remedyObj.interactions}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
