import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Sprout, AlertTriangle, ShieldCheck, BookOpen, HeartPulse, Clock, Sparkles, Printer, AlertOctagon, Send, Check, WifiOff, AlertCircle, MapPin, Calendar, ClipboardList, Eye } from 'lucide-react';
import { database } from '../data/database';
import { getLocalizedRemedy, getLocalizedCondition } from '../utils/regionalHelper';

// Helper to sync pending flags to the backend API when online
export async function syncPendingFlags() {
  if (!navigator.onLine) return;
  const pendingStr = localStorage.getItem('pendingClinicalFlags');
  if (!pendingStr) return;
  try {
    const pending = JSON.parse(pendingStr);
    if (!Array.isArray(pending) || pending.length === 0) return;
    
    console.log(`Syncing ${pending.length} pending clinical flags...`);
    const remaining = [];
    
    for (const flag of pending) {
      try {
        const res = await fetch('/.netlify/functions/create-clinical-flag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flag),
        });
        if (!res.ok) {
          console.error('Failed to sync flag:', await res.text());
          remaining.push(flag); // keep failed ones to retry later
        }
      } catch (e) {
        console.error('Network error during flag sync:', e);
        remaining.push(flag);
      }
    }
    
    if (remaining.length > 0) {
      localStorage.setItem('pendingClinicalFlags', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('pendingClinicalFlags');
      console.log('All pending clinical flags synced successfully!');
    }
  } catch (e) {
    console.error('Error parsing pending flags:', e);
  }
}

// Register online event listener once in client environment
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingFlags();
  });
  // Auto-sync after app initialization has settled
  setTimeout(syncPendingFlags, 3500);
}

// A shared visual Flag Modal so clinicians can instantly report questionable clinical data
function FlagModal({ entityName, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'offline_queued' | 'error'
  const [flagReason, setFlagReason] = useState('dosage');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState(() => {
    const userStr = localStorage.getItem('gotrue.user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        return userObj?.email || '';
      } catch (e) {}
    }
    return '';
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    const payload = {
      entityName,
      flagReason,
      details,
      userEmail: email.trim() || 'Anonymous Clinician'
    };

    // If offline, queue local storage immediately
    if (!navigator.onLine) {
      try {
        const pendingStr = localStorage.getItem('pendingClinicalFlags') || '[]';
        const pending = JSON.parse(pendingStr);
        pending.push(payload);
        localStorage.setItem('pendingClinicalFlags', JSON.stringify(pending));
        setStatus('offline_queued');
        setSubmitted(true);
      } catch (err) {
        console.error('Failed to queue report locally:', err);
        setErrorMessage('Failed to queue report locally. Storage limits exceeded.');
        setStatus('error');
      }
      return;
    }

    // Attempt online post
    try {
      const res = await fetch('/.netlify/functions/create-clinical-flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('success');
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || 'Failed to submit report to medical board. Please try again.');
        setStatus('error');
      }
    } catch (err) {
      console.error('Network error during flag submission:', err);
      // Fallback to offline local storage
      try {
        const pendingStr = localStorage.getItem('pendingClinicalFlags') || '[]';
        const pending = JSON.parse(pendingStr);
        pending.push(payload);
        localStorage.setItem('pendingClinicalFlags', JSON.stringify(pending));
        setStatus('offline_queued');
        setSubmitted(true);
      } catch (e) {
        setErrorMessage('Network connection lost, and could not queue report locally.');
        setStatus('error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4 animate-fade-in no-print">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        {submitted ? (
          <div className="text-center py-6 space-y-3">
            {status === 'success' ? (
              <>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Review Report Logged</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Thank you, Doctor. Your clinical advisory report for "{entityName}" has been securely dispatched. An open GitHub issue has been logged, and real-time alerts have been routed to the medical review board via Slack/Discord.
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <WifiOff className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-855">Report Queued Offline</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-medium">
                  You are currently offline in the field. Your clinical advisory report for "{entityName}" has been safely queued in local storage.
                </p>
                <p className="text-[10px] text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100 leading-normal max-w-xs mx-auto">
                  The PWA will automatically sync and submit this report to the medical board the moment your device reconnects to cell service/WiFi.
                </p>
              </>
            )}
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
              <AlertOctagon className="h-5 w-5 text-rose-600 animate-pulse" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-855">Flag for Peer Review</h3>
                <span className="text-[10px] text-slate-400">Reporting clinical data in "{entityName}"</span>
              </div>
            </div>

            {!isOnline && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2.5 flex items-center gap-2 text-[10px] font-semibold leading-normal animate-pulse">
                <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Device is currently offline. Your report will be safely stored in the offline queue and synced once online.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-lg p-2.5 flex items-center gap-2 text-[10px] font-bold leading-normal">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Reason for Flag:</label>
              <select 
                value={flagReason} 
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                <option value="dosage">Inaccurate Dosage Guideline</option>
                <option value="safety">Omitted Safety Advisory / Pregnancy Caution</option>
                <option value="empirical">Questionable Evidence / Missing Citation</option>
                <option value="identification">Botanical Identification / Taxonomy Error</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Clinician Contact Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
              />
              <span className="text-[9px] text-slate-400 block mt-0.5 leading-normal">
                Optional. Helps the medical review board contact you if further evidence is required.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Clinical Details & References:</label>
              <textarea
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please paste PubMed citation or detail the clinical inaccuracy to help editors modify the database."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-slate-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
              <button 
                type="button" 
                onClick={onClose}
                disabled={status === 'submitting'}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={status === 'submitting'}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// A shared visual Improve Modal so clinicians can submit changes or launch the visual CMS manager
function ImproveModal({ entityName, onClose }) {
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('gotrue.user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {}
    }
    return null;
  });

  const handleLogin = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.open();
      // Listen to login event to update state
      window.netlifyIdentity.on('login', (loggedInUser) => {
        setUser(loggedInUser);
        window.netlifyIdentity.close();
      });
    } else {
      window.location.href = '/admin/';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4 animate-fade-in no-print">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sprout className="h-5 w-5 text-emerald-800 animate-pulse animate-spin-slow" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-855 font-outfit">Improve Clinical Database</h3>
            <span className="text-[10px] text-slate-450">Contributing scientific edits to "{entityName}"</span>
          </div>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
              <span className="font-bold block">✓ Authenticated Editor</span>
              <p className="opacity-90 leading-relaxed">
                Logged in as: <strong className="font-bold text-slate-800">{user.email}</strong>
              </p>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              As an authorized medical board peer-reviewer, you can click below to load the visual back-office manager. Select this collection entry to easily type your scientific improvements. Once committed, our Git Gateway will automatically push the changes to PWA databases worldwide!
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <a 
                href="/admin/"
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                Launch Visual CMS Manager
              </a>
              <button 
                onClick={onClose}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              THIS is a collaborative, clinical-grade registry. To prevent medical vandalism and maintain scientific accuracy (GRADE standards), database edits are restricted to authorized clinicians, botanists, and medical researchers.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-slate-600 leading-relaxed font-medium">
              <strong>Registration Protocol:</strong> Registering requires an invitation from a SuperAdmin. If you are an active practitioner, you can register or log in using Netlify Identity below.
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleLogin}
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all"
              >
                Login / Sign Up as Editor
              </button>
              
              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-2">
                <span className="text-[10px] text-slate-505 font-medium block leading-normal">
                  Want to submit a correction immediately without an account?
                </span>
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      const flagBtn = document.querySelector('[data-flag-trigger="true"]');
                      if (flagBtn) flagBtn.click();
                    }, 100);
                  }}
                  className="px-4 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-extrabold shadow-sm transition-all"
                >
                  ⚠️ Submit Quick Bedside Flag
                </button>
              </div>

              <button 
                type="button"
                onClick={onClose}
                className="mt-2 py-1.5 bg-slate-105 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConditionPage({ id, onBack, onNavigate, selectedRegion }) {
  const baseCondition = database.conditions.find(cond => cond.id === id);
  const c = getLocalizedCondition(baseCondition, selectedRegion);
  const [showFlag, setShowFlag] = useState(false);
  const [showImprove, setShowImprove] = useState(false);

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
          {/* Improve Database button */}
          <button 
            onClick={() => setShowImprove(true)}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-100 shadow-sm"
          >
            <Sprout className="h-3.5 w-3.5 text-emerald-600" /> Improve Entry
          </button>

          {/* Flag button */}
          <button 
            onClick={() => setShowFlag(true)}
            data-flag-trigger="true"
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
                const baseRemedy = database.remedies.find(r => r.id === row.remedyId);
                const remedy = getLocalizedRemedy(baseRemedy, selectedRegion);
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
      {showImprove && <ImproveModal entityName={c.name} onClose={() => setShowImprove(false)} />}
    </div>
  );
}

export function RemedyPage({ id, onBack, onNavigate, selectedRegion }) {
  const baseRemedy = database.remedies.find(rem => rem.id === id);
  const r = getLocalizedRemedy(baseRemedy, selectedRegion);
  const [showFlag, setShowFlag] = useState(false);
  const [showImprove, setShowImprove] = useState(false);
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState('evidence'); // 'evidence' or 'processing'
  
  // Extraction recipe states
  const [recipeMethod, setRecipeMethod] = useState('decoction'); // 'decoction', 'powdering', 'maceration'
  const [checkedSteps, setCheckedSteps] = useState({
    decoction: [],
    powdering: [],
    maceration: []
  });

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

  // Recipe Step toggling
  const toggleRecipeStep = (method, index) => {
    const list = checkedSteps[method];
    if (list.includes(index)) {
      setCheckedSteps({
        ...checkedSteps,
        [method]: list.filter(i => i !== index)
      });
    } else {
      setCheckedSteps({
        ...checkedSteps,
        [method]: [...list, index]
      });
    }
  };

  // Taxonomic SVG Leaf Renderer
  const renderTaxonomicWireframe = () => {
    switch (r.id) {
      case 'moringa-leaves':
      case 'moringa-seeds':
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto text-emerald-600 animate-scale-up" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M100 180 V40" strokeWidth="3" className="stroke-emerald-800" />
            <path d="M100 140 C80 140 60 130 50 120 C60 110 80 120 100 130" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 140 C120 140 140 130 150 120 C140 110 120 120 100 130" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 100 C80 100 60 90 40 80 C60 70 80 80 100 90" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 100 C120 100 140 90 160 80 C140 70 120 80 100 90" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 60 C85 60 70 50 55 40 C70 30 85 40 100 50" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 60 C115 60 130 50 145 40 C130 30 115 40 100 50" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 40 C100 20 90 10 100 10 C110 10 100 20 100 40" fill="currentColor" fillOpacity="0.25" />
          </svg>
        );
      case 'neem-leaves':
      case 'neem-seed-oil':
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto text-emerald-600 animate-scale-up" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M100 180 V40" strokeWidth="3" className="stroke-emerald-800" />
            <path d="M100 130 C75 140 50 110 30 100 C50 95 75 110 100 115" fill="currentColor" fillOpacity="0.15" className="stroke-emerald-700" />
            <path d="M30 100 Q45 105 50 110 Q65 115 70 120 Q85 125 100 130" strokeWidth="1" className="stroke-emerald-800/40" />
            <path d="M100 130 C125 140 150 110 170 100 C150 95 125 110 100 115" fill="currentColor" fillOpacity="0.15" className="stroke-emerald-700" />
            <path d="M170 100 Q155 105 150 110 Q135 115 130 120 Q115 125 100 130" strokeWidth="1" className="stroke-emerald-800/40" />
            <path d="M100 85 C80 95 60 70 40 60 C60 55 80 70 100 75" fill="currentColor" fillOpacity="0.15" className="stroke-emerald-700" />
            <path d="M100 85 C120 95 140 70 160 60 C140 55 120 70 100 75" fill="currentColor" fillOpacity="0.15" className="stroke-emerald-700" />
            <path d="M100 40 C90 30 95 10 100 5 C105 10 110 30 100 40" fill="currentColor" fillOpacity="0.25" className="stroke-emerald-700" />
          </svg>
        );
      case 'aloe-vera':
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto text-emerald-600 animate-scale-up" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M100 180 Q100 160 100 150" strokeWidth="4" className="stroke-emerald-800" />
            <path d="M100 160 C70 150 40 100 30 40 C45 80 70 120 100 150" fill="currentColor" fillOpacity="0.15" />
            <path d="M30 40 L35 48 M42 60 L46 66 M55 82 L58 87" strokeWidth="1.5" className="stroke-lime-500" />
            <path d="M100 160 C130 150 160 100 170 40 C155 80 130 120 100 150" fill="currentColor" fillOpacity="0.15" />
            <path d="M170 40 L165 48 M158 60 L154 66 M145 82 L142 87" strokeWidth="1.5" className="stroke-lime-500" />
            <path d="M100 160 C90 120 90 60 100 10 C110 60 110 120 100 160" fill="currentColor" fillOpacity="0.25" />
            <path d="M90 60 L93 63 M110 70 L107 73" strokeWidth="1.5" className="stroke-lime-500" />
          </svg>
        );
      case 'guava-leaves':
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto text-emerald-600 animate-scale-up" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M100 180 C40 150 30 70 100 15 C170 70 160 150 100 180" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 180 V15" strokeWidth="3" className="stroke-emerald-800" />
            <path d="M100 150 Q75 140 50 140" />
            <path d="M100 150 Q125 140 150 140" />
            <path d="M100 120 Q70 110 40 110" />
            <path d="M100 120 Q130 110 160 110" />
            <path d="M100 90 Q65 80 35 80" />
            <path d="M100 90 Q135 80 165 80" />
            <path d="M100 60 Q70 50 45 50" />
            <path d="M100 60 Q130 50 155 50" />
          </svg>
        );
      case 'papaya-leaf-extract':
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto text-emerald-600 animate-scale-up" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M100 185 V120" strokeWidth="3" className="stroke-emerald-800" />
            <path d="M100 120 L100 15 L70 55 L35 30 L55 80 L15 85 L65 110 L25 140 L100 120 L175 140 L135 110 L185 85 L145 80 L165 30 L130 55 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 120 L55 80" strokeWidth="2" />
            <path d="M100 120 L145 80" strokeWidth="2" />
            <path d="M100 120 L70 55" strokeWidth="2" />
            <path d="M100 120 L130 55" strokeWidth="2" />
            <path d="M100 120 L65 110" />
            <path d="M100 120 L135 110" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto text-emerald-600 animate-scale-up" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M100 180 C60 140 50 80 100 25 C150 80 140 140 100 180" fill="currentColor" fillOpacity="0.15" />
            <path d="M100 180 V25" strokeWidth="3" className="stroke-emerald-800" />
            <path d="M100 140 C75 130 65 120 60 115" />
            <path d="M100 140 C125 130 135 120 140 115" />
            <path d="M100 100 C75 90 60 80 55 75" />
            <path d="M100 100 C125 90 140 80 145 75" />
            <path d="M100 60 C80 50 70 40 65 35" />
            <path d="M100 60 C120 50 130 40 135 35" />
          </svg>
        );
    }
  };

  // County Seasonal Yields Matrix (index 0 = Jan, 11 = Dec)
  const countyHarvestSeasons = {
    nairobi: {
      peak: [0, 1, 2], // Jan, Feb, Mar
      good: [6, 7, 11], // Jul, Aug, Dec
      safeTip: "Highland climate requires storing dried leaves in air-tight glass jars to prevent damp mountain mist rehydration and mold decay."
    },
    mombasa: {
      peak: [4, 5, 6], // May, Jun, Jul
      good: [3, 7, 8], // Apr, Aug, Sep
      safeTip: "Humid coastal air severely degrades stored botanicals. Ensure desiccants (sterile silica or clean dry rice sacks) are placed inside containers."
    },
    lodwar: {
      peak: [9, 10, 11], // Oct, Nov, Dec
      good: [0, 8], // Jan, Sep
      safeTip: "Extreme arid heat evaporates active botanical oils rapidly. Store preparations in dark, cool subterranean clay jars away from active sunlight."
    },
    kakamega: {
      peak: [6, 7, 8], // Jul, Aug, Sep
      good: [5, 9], // Jun, Oct
      safeTip: "Western rainfalls cause high relative humidity. Never store botanicals until they are 100% crisp-dry, and inspect weekly for mold patches."
    }
  };

  const getActiveRegionKey = () => {
    if (['mombasa', 'lodwar', 'kakamega'].includes(selectedRegion)) return selectedRegion;
    return 'nairobi'; // Default Highlands nairobi
  };

  const activeSeason = countyHarvestSeasons[getActiveRegionKey()];
  const currentMonthIdx = new Date().getMonth();
  const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Extraction Recipes checklist templates
  const recipesList = {
    decoction: {
      title: "1. Aqueous Decoction (Boiled Tea)",
      time: "15-20 mins",
      steps: [
        "Collect 10-15 mature, disease-free fresh leaves. Wash under clean running water to remove insects and dust.",
        "Bring 500 mL of clarified water to a rolling boil (100°C) in a covered clay, glass, or stainless steel vessel.",
        "Add the crushed leaves, immediately cover with a tight-fitting lid to trap volatile therapeutic essential oils, and boil gently for exactly 15 minutes.",
        "Remove from heat and let cool to room temperature with the lid still sealed. Filter through autoclaved clean cotton gauze into sterile containers."
      ]
    },
    powdering: {
      title: "2. Solar Drying & Pulverizing",
      time: "3-5 days",
      steps: [
        "Harvest clean leaves or seeds during peak county seasonal indices to ensure high active compound concentrations.",
        "Spread leaves evenly on sterile, clean drying mats in a well-ventilated, shaded environment. Do NOT expose to direct solar noon rays, as UV radiation degrades chlorophyll and monoterpenes.",
        "Let dry for 3 to 5 days until leaflets are completely brittle and snap crisp to the touch.",
        "Pulverize using a sterilized dry mortar and pestle. Store the resulting fine green powder in hermetically sealed amber glass jars away from moisture."
      ]
    },
    maceration: {
      title: "3. Cold Maceration (Tinctures)",
      time: "7-14 days",
      steps: [
        "Finely crush 50g of dried leaf powder or crushed seeds into a sterilized amber glass bottle.",
        "Pour in 250 mL of high-proof sterile alcohol or local food-grade spirits, completely submerging the plant powder.",
        "Seal tightly and store in a completely dark, cool cupboard for 7 to 14 days. Agitate the bottle vigorously for 1 minute daily.",
        "Decant the supernatant liquid, filter through autoclaved gauze or unbleached filter paper, and store in clean dropper bottles away from light."
      ]
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Detail Action Buttons */}
      <div className="flex justify-between items-center no-print">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border border-[hsl(var(--primary-green),0.08)] shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>

        <div className="flex gap-2">
          {/* Improve Database button */}
          <button 
            onClick={() => setShowImprove(true)}
            className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-100 shadow-sm cursor-pointer"
          >
            <Sprout className="h-3.5 w-3.5 text-emerald-600" /> Improve Entry
          </button>

          {/* Flag button */}
          <button 
            onClick={() => setShowFlag(true)}
            data-flag-trigger="true"
            className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-rose-100 shadow-sm cursor-pointer"
          >
            <AlertOctagon className="h-3.5 w-3.5" /> Flag Review
          </button>

          {/* Print button */}
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
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
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100 inline-block font-outfit">
            {r.category === 'botanical' ? 'Traditional Natural Plant' : 'Modern Pharmaceutical'}
          </span>
          {r.category === 'botanical' && (
            <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded border font-outfit ${
              r.availability === 'abundant' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              r.availability === 'scarce' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              Availability: {r.availability}
            </span>
          )}
        </div>
        
        <h2 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--primary-green))] mb-1 font-outfit flex items-center gap-2">
          {r.name}
          {selectedRegion && selectedRegion !== 'nairobi' && (
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 animate-pulse">
              {selectedRegion} context
            </span>
          )}
        </h2>
        {r.baselineName && r.baselineName !== r.name && (
          <span className="text-xs text-slate-400 block mb-2 font-bold italic font-outfit">
            English Botanical Baseline: {r.baselineName}
          </span>
        )}
        <p className="text-sm italic text-slate-400 mb-2">
          {r.scientificName}
        </p>

        {/* Synonyms list */}
        {r.synonyms && r.synonyms.length > 0 && (
          <p className="text-xs text-slate-500 mb-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 inline-block font-semibold">
            <strong>Synonyms / Local Names:</strong> {r.synonyms.join(', ')}
          </p>
        )}

        <p className="text-sm text-slate-650 leading-relaxed max-w-4xl font-medium">
          {r.description}
        </p>
      </div>

      {/* Dual Tab Navigation Selection Controls */}
      {r.category === 'botanical' && (
        <div className="flex border-b border-slate-200 gap-2 no-print">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-[hsl(var(--primary-green))] text-[hsl(var(--primary-green))] font-black'
                : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Clinical Evidence (GRADE)
          </button>
          
          <button
            onClick={() => setActiveTab('processing')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'processing'
                ? 'border-[hsl(var(--primary-green))] text-[hsl(var(--primary-green))] font-black'
                : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Field Prep & Processing
          </button>
        </div>
      )}

      {/* Dynamic Tab view rendering */}
      {(activeTab === 'evidence' || r.category === 'pharmaceutical') ? (
        /* ==================== TAB 1: CLINICAL EVIDENCE VIEW ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Preparation & Properties */}
          <div className="lg:col-span-4 space-y-4">
            {/* Local Ecological Advisory Card */}
            {r.ecologicalAdvisory && (
              <div className="glass-panel p-5 space-y-3 border-l-4 border-l-emerald-600 bg-emerald-50/10 no-print">
                <h3 className="text-sm font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 pb-2 font-outfit">
                  <MapPin className="h-4 w-4 text-emerald-600 animate-bounce" />
                  Local Ecological Advisory
                </h3>
                <p className="text-xs text-slate-655 leading-relaxed font-semibold bg-emerald-50/30 p-3 rounded-lg border border-emerald-150">
                  {r.ecologicalAdvisory}
                </p>
              </div>
            )}
            
            {/* Active constituents */}
            <div className="glass-panel p-5 space-y-3 bg-white">
              <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 font-outfit">
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
              <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 font-outfit">
                <Clock className="h-4 w-4 text-emerald-700" />
                Administration Guide
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                {r.preparation}
              </p>
            </div>

            {/* Safety Warning */}
            <div className={`glass-panel p-5 space-y-3 border-l-4 bg-white ${
              r.safetyRating.includes('Caution') ? 'border-l-rose-500 bg-rose-50/5' : 'border-l-amber-500 bg-amber-50/5'
            }`}>
              <h3 className="text-sm font-extrabold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 font-outfit">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Contraindications & Safety
              </h3>
              <div className="space-y-3">
                <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-100 text-xs">
                  <span className="font-extrabold text-rose-800 block mb-0.5 uppercase tracking-wide text-[9px]">CRITICAL ADVISORY</span>
                  <p className="text-slate-600 leading-relaxed font-semibold">{r.safetyAlert}</p>
                </div>
                <div className="bg-amber-50/30 p-3 rounded-lg border border-amber-100 text-xs">
                  <span className="font-extrabold text-amber-800 block mb-0.5 uppercase tracking-wide text-[9px]">DRUG INTERACTIONS</span>
                  <p className="text-slate-600 leading-relaxed font-semibold">{r.interactions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Scientific Outcomes */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-panel p-5 space-y-4 bg-white">
              <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 font-outfit">
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

                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 font-medium">
                        <strong>Target Symptom & Effect:</strong> {row.clinicalSummary}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <BookOpen className="h-3 w-3 shrink-0" />
                        <span className="italic truncate font-bold">{row.citation}</span>
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
      ) : (
        /* ==================== TAB 2: FIELD PREPARATION & PROCESSING VIEW ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: Leaf Taxonomy SVGs and Seasonal Calendars */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Taxonomic Anatomy Line-Art Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">
                Taxonomic Leaf Wireframe & Venation
              </span>
              
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center">
                {renderTaxonomicWireframe()}
              </div>

              <div className="text-left space-y-1 mt-3">
                <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block">Taxonomic Identification</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Serrated leaflets or pinnate venations help identify the true botanical species under remote field operations. Avoid collecting smooth-margined lookalikes which represent toxic clearance strains.
                </p>
              </div>
            </div>

            {/* Context-Aware Harvester Dial */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Seasonal Harvest Yield Calendar
                </span>
                <span className="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-250 px-2 py-0.5 rounded">
                  {selectedRegion} County Context
                </span>
              </div>

              {/* Grid of 12 month indicators */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-outfit">
                {monthsNames.map((month, idx) => {
                  const isCurrent = idx === currentMonthIdx;
                  const isPeak = activeSeason.peak.includes(idx);
                  const isGood = activeSeason.good.includes(idx);
                  
                  let badgeStyle = 'bg-slate-50 border-slate-150 text-slate-400';
                  if (isPeak) badgeStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold shadow-xs';
                  else if (isGood) badgeStyle = 'bg-sky-50 border-sky-200 text-sky-800 font-bold';

                  return (
                    <div 
                      key={month}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold select-none relative flex flex-col justify-between items-center ${badgeStyle} ${
                        isCurrent ? 'ring-2 ring-emerald-600 ring-offset-1' : ''
                      }`}
                    >
                      <span>{month}</span>
                      <span className="text-[7px] uppercase font-black tracking-tighter mt-1 block">
                        {isPeak ? 'Peak' : isGood ? 'Good' : 'Low'}
                      </span>
                      {isCurrent && (
                        <div className="absolute -top-1.5 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-600 border border-white text-[7px] font-black text-white flex items-center justify-center font-mono">
                          ★
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Safe Storage Tips Card */}
              <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl flex gap-2">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block">Safe Storage Directive</span>
                  <p className="text-[11px] leading-relaxed text-slate-650 font-semibold">
                    {activeSeason.safeTip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Extraction Recipes and Step-by-Step Interactive Checklists */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">
                Bedside Sterile Extraction Methods
              </span>

              {/* Method Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-center">
                {Object.keys(recipesList).map(method => (
                  <button
                    key={method}
                    onClick={() => setRecipeMethod(method)}
                    className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer uppercase ${
                      recipeMethod === method 
                        ? 'bg-white text-emerald-800 shadow-sm font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {method === 'decoction' ? '1. Decoction' : method === 'powdering' ? '2. Powder' : '3. Maceration'}
                  </button>
                ))}
              </div>

              {/* Selected Recipe Panel */}
              {(() => {
                const recipe = recipesList[recipeMethod];
                const checked = checkedSteps[recipeMethod];
                const totalSteps = recipe.steps.length;
                const completedSteps = checked.length;
                const progressPct = Math.round((completedSteps / totalSteps) * 100);

                return (
                  <div className="space-y-4 animate-fade-in pt-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 font-outfit uppercase">
                          {recipe.title}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">
                          Standard Duration: {recipe.time}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded font-outfit">
                          Progress: {progressPct}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar indicator */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border">
                      <div 
                        className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Checkbox Timeline list */}
                    <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/20">
                      {recipe.steps.map((step, idx) => {
                        const isChecked = checked.includes(idx);
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-3.5 p-3.5 cursor-pointer transition-all hover:bg-slate-50/50 ${
                              isChecked ? 'bg-emerald-50/30 text-emerald-950' : 'text-slate-700'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleRecipeStep(recipeMethod, idx)}
                              className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                            />
                            <div>
                              <span className="text-[10px] font-black text-slate-400 block uppercase font-outfit">
                                Step {idx + 1}
                              </span>
                              <p className="text-[11px] leading-relaxed font-semibold pt-0.5">
                                {step}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Autoclaved Hygiene Warnings panel */}
                    <div className="p-4 bg-rose-50/55 border border-rose-200 rounded-2xl flex gap-2 text-rose-950">
                      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-extrabold text-[11px] uppercase tracking-wider mb-0.5">Sterile Bedside Hygiene Alert</h5>
                        <p className="text-[10px] leading-relaxed opacity-95 font-semibold text-slate-650">
                          Un-boiled herbal preparations are highly prone to bacterial contamination (specifically Pseudomonas and fecal coliforms) that multiply in water wells. Always boil extraction jars or autoclave cotton gauze filters prior to decanting to prevent introducing septic shock pathogens.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        </div>
      )}

      {showFlag && <FlagModal entityName={r.name} onClose={() => setShowFlag(false)} />}
      {showImprove && <ImproveModal entityName={r.name} onClose={() => setShowImprove(false)} />}
    </div>
  );
}
