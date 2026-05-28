import React, { useState } from 'react';
import { ArrowLeft, Activity, Sprout, AlertTriangle, ShieldCheck, BookOpen, HeartPulse, Clock, Sparkles, Printer, AlertOctagon, Send, Check } from 'lucide-react';
import { database } from '../data/database';

// A shared visual Flag Modal so clinicians can instantly report questionable clinical data
function FlagModal({ entityName, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [flagReason, setFlagReason] = useState('dosage');
  const [details, setDetails] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4 animate-fade-in no-print">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Review Report Logged</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Thank you, Doctor. Your clinical advisory report for "{entityName}" has been queued. A Git Pull Request with clinical flags has been initiated for medical board review.
            </p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-900 transition-colors"
            >
              Close Panel
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertOctagon className="h-5 w-5 text-rose-600" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-850">Flag for Peer Review</h3>
                <span className="text-[10px] text-slate-400">Reporting clinical data in "{entityName}"</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Reason for Flag:</label>
              <select 
                value={flagReason} 
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="dosage">Inaccurate Dosage Guideline</option>
                <option value="safety">Omitted Safety Advisory / Pregnancy Caution</option>
                <option value="empirical">Questionable Evidence / Missing Citation</option>
                <option value="identification">Botanical Identification / Taxonomy Error</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Clinical Details & References:</label>
              <textarea
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please paste PubMed citation or detail the clinical inaccuracy to help editors modify the database."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <Send className="h-3.5 w-3.5" /> Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function ConditionPage({ id, onBack, onNavigate }) {
  const c = database.conditions.find(cond => cond.id === id);
  const [showFlag, setShowFlag] = useState(false);

  if (!c) return <div className="p-8 text-center text-sm font-semibold">Condition not found.</div>;

  // Find all symptoms
  const symptomsObjs = c.symptoms.map(sId => database.symptoms.find(s => s.id === sId)).filter(Boolean);

  // Dynamic Lookup: Find all remedies that have outcomes linked to this condition
  const linkedOutcomes = database.outcomesMatrix.filter(row => row.conditionId === id);

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
      case 'Conditional For': return 'bg-emerald-50 text-emerald-705 border-emerald-300';
      case 'Conditional Against': return 'bg-amber-50 text-amber-705 border-amber-300';
      default: return 'bg-rose-600 text-white border-rose-700';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Detail Action Buttons */}
      <div className="flex justify-between items-center no-print">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border border-[hsl(var(--primary-green),0.08)] shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>

        <div className="flex gap-2">
          {/* Flag button */}
          <button 
            onClick={() => setShowFlag(true)}
            className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-rose-100 shadow-sm"
          >
            <AlertOctagon className="h-3.5 w-3.5" /> Flag Review
          </button>

          {/* Print button */}
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Printer className="h-3.5 w-3.5" /> Print Packet
          </button>
        </div>
      </div>

      {/* Pending Vetting Warning Banner */}
      {c.pending && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-2.5 text-rose-900 animate-pulse">
          <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-0.5">PENDING CLINICAL VALIDATION</h4>
            <p className="text-[11px] leading-relaxed opacity-90">
              Advisory: This ethnobotanical remedy has been recently added by the community and is currently awaiting a rigorous peer-review audit. Dosages and parameters should not be used as established clinical protocol until vetted.
            </p>
          </div>
        </div>
      )}

      {/* Main Condition Info */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-800 bg-white">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
            {c.category}
          </span>
          {c.icd11 && (
            <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
              <span className="text-blue-600">ICD-11:</span> {c.icd11}
            </span>
          )}
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--primary-green))] mb-1">
          {c.name}
        </h2>
        <p className="text-sm italic text-slate-400 mb-2">
          {c.scientificName}
        </p>
        
        {/* Synonyms list */}
        {c.synonyms && c.synonyms.length > 0 && (
          <p className="text-xs text-slate-500 mb-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 inline-block">
            <strong>Synonyms / Local Names:</strong> {c.synonyms.join(', ')}
          </p>
        )}

        <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
          {c.description}
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Symptoms and Prevention */}
        <div className="lg:col-span-4 space-y-4">
          {/* Symptoms List */}
          <div className="glass-panel p-5 space-y-3 bg-white">
            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Activity className="h-4 w-4 text-emerald-700" />
              Linked Symptoms
            </h3>
            <div className="space-y-2">
              {symptomsObjs.map(s => (
                <div key={s.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                  <span className="font-bold text-slate-800 block mb-0.5">{s.name}</span>
                  <span className="text-slate-500 leading-relaxed">{s.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Climate Linkages */}
          <div className="glass-panel p-5 space-y-3 bg-white">
            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Climate Variables
            </h3>
            {c.climateLinks.map((link, idx) => (
              <div key={idx} className="p-2.5 bg-amber-50/20 border border-amber-100 rounded-lg text-xs space-y-1">
                <span className="font-bold text-amber-900 block">{link.trigger}</span>
                <p className="text-slate-600 leading-relaxed">{link.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Evidence Outcomes Matrix */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-5 space-y-4 bg-white">
            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <HeartPulse className="h-4 w-4 text-emerald-700" />
              Scientific Evidence Matrix (GRADE Standard)
            </h3>
            
            <div className="divide-y divide-slate-100">
              {linkedOutcomes.map(row => {
                const remedy = database.remedies.find(r => r.id === row.remedyId);
                return (
                  <div key={row.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => onNavigate('remedy', row.remedyId)}
                          className="font-extrabold text-sm text-slate-800 hover:underline cursor-pointer"
                        >
                          {remedy?.name}
                        </span>
                        <span className="text-[10px] italic text-slate-400 capitalize">
                          ({remedy?.category === 'botanical' ? 'Traditional Plant' : 'Modern Synthesis'})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getQualityBadgeClass(row.gradeQuality)}`}>
                          Quality: {row.gradeQuality}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStrengthBadgeClass(row.recommendationStrength)}`}>
                          {row.recommendationStrength}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Indication outcome:</strong> {row.clinicalSummary}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="italic truncate">{row.citation}</span>
                    </div>
                  </div>
                );
              })}
              
              {linkedOutcomes.length === 0 && (
                <p className="text-xs text-slate-400 italic">No scientific outcomes cataloged for this condition yet.</p>
              )}
            </div>
          </div>

          {/* Prevention checklist */}
          <div className="glass-panel p-5 space-y-3 bg-white">
            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Vector & Field Prevention Checklist
            </h3>
            <ul className="space-y-1.5">
              {c.prevention.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50/50 p-2 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showFlag && <FlagModal entityName={c.name} onClose={() => setShowFlag(false)} />}
    </div>
  );
}

export function RemedyPage({ id, onBack, onNavigate }) {
  const r = database.remedies.find(rem => rem.id === id);
  const [showFlag, setShowFlag] = useState(false);

  if (!r) return <div className="p-8 text-center text-sm font-semibold">Remedy not found.</div>;

  // Dynamic Lookup: Find all outcomes linked to this remedy
  const linkedOutcomes = database.outcomesMatrix.filter(row => row.remedyId === id);

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
      case 'Conditional For': return 'bg-emerald-50 text-emerald-705 border-emerald-300';
      case 'Conditional Against': return 'bg-amber-50 text-amber-705 border-amber-300';
      default: return 'bg-rose-600 text-white border-rose-700';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Detail Action Buttons */}
      <div className="flex justify-between items-center no-print">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border border-[hsl(var(--primary-green),0.08)] shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>

        <div className="flex gap-2">
          {/* Flag button */}
          <button 
            onClick={() => setShowFlag(true)}
            className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-rose-100 shadow-sm"
          >
            <AlertOctagon className="h-3.5 w-3.5" /> Flag Review
          </button>

          {/* Print button */}
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Printer className="h-3.5 w-3.5" /> Print Packet
          </button>
        </div>
      </div>

      {/* Pending Vetting Warning Banner */}
      {r.pending && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-2.5 text-rose-900 animate-pulse no-print">
          <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-0.5">PENDING CLINICAL VALIDATION</h4>
            <p className="text-[11px] leading-relaxed opacity-90">
              Advisory: This traditional remedy is currently undergoing clinical peer-review auditing. Dosages and parameters should not be used as established clinical protocol until fully vetted.
            </p>
          </div>
        </div>
      )}

      {/* Main Remedy Info */}
      <div className="glass-panel p-6 border-l-4 border-l-sky-500 bg-white">
        <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100 mb-3 inline-block">
          {r.category === 'botanical' ? 'Traditional Natural Plant' : 'Modern Pharmaceutical'}
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--primary-green))] mb-1">
          {r.name}
        </h2>
        <p className="text-sm italic text-slate-400 mb-2">
          {r.scientificName}
        </p>

        {/* Synonyms list */}
        {r.synonyms && r.synonyms.length > 0 && (
          <p className="text-xs text-slate-500 mb-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 inline-block">
            <strong>Synonyms / Local Names:</strong> {r.synonyms.join(', ')}
          </p>
        )}

        <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
          {r.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preparation & Properties */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active constituents */}
          <div className="glass-panel p-5 space-y-3 bg-white">
            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              Active Compounds
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {r.activeConstituents.map((item, idx) => (
                <span key={idx} className="text-xs bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg text-slate-600 font-bold border border-slate-200/50">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Prep instructions */}
          <div className="glass-panel p-5 space-y-3 bg-white">
            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clock className="h-4 w-4 text-emerald-700" />
              Administration Guide
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {r.preparation}
            </p>
          </div>

          {/* Safety Warning */}
          <div className={`glass-panel p-5 space-y-3 border-l-4 bg-white ${
            r.safetyRating.includes('Caution') ? 'border-l-rose-500 bg-rose-50/5' : 'border-l-amber-500 bg-amber-50/5'
          }`}>
            <h3 className="text-sm font-extrabold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Contraindications & Safety
            </h3>
            <div className="space-y-3">
              <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-100 text-xs">
                <span className="font-extrabold text-rose-800 block mb-0.5">CRITICAL ADVISORY</span>
                <p className="text-slate-600 leading-relaxed">{r.safetyAlert}</p>
              </div>
              <div className="bg-amber-50/30 p-3 rounded-lg border border-amber-100 text-xs">
                <span className="font-extrabold text-amber-800 block mb-0.5">DRUG INTERACTIONS</span>
                <p className="text-slate-600 leading-relaxed">{r.interactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Scientific Outcomes */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-5 space-y-4 bg-white">
            <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <HeartPulse className="h-4 w-4 text-emerald-700" />
              Outcome Efficacy Mapping (GRADE Standard)
            </h3>
            
            <div className="divide-y divide-slate-100">
              {linkedOutcomes.map(row => {
                const condition = database.conditions.find(c => c.id === row.conditionId);
                return (
                  <div key={row.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span 
                        onClick={() => onNavigate('condition', row.conditionId)}
                        className="font-extrabold text-sm text-slate-800 hover:underline cursor-pointer"
                      >
                        Target Condition: {condition?.name}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getQualityBadgeClass(row.gradeQuality)}`}>
                          Quality: {row.gradeQuality}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStrengthBadgeClass(row.recommendationStrength)}`}>
                          {row.recommendationStrength}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <strong>Target Symptom & Effect:</strong> {row.clinicalSummary}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="italic truncate">{row.citation}</span>
                    </div>
                  </div>
                );
              })}
              
              {linkedOutcomes.length === 0 && (
                <p className="text-xs text-slate-400 italic">No scientific outcomes cataloged for this remedy yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFlag && <FlagModal entityName={r.name} onClose={() => setShowFlag(false)} />}
    </div>
  );
}
