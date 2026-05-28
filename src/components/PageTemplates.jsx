import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Sprout, AlertTriangle, ShieldCheck, BookOpen, HeartPulse, Clock, Sparkles, Printer, AlertOctagon, Send, Check, WifiOff, AlertCircle } from 'lucide-react';
import { database } from '../data/database';

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

export function ConditionPage({ id, onBack, onNavigate }) {
  const c = database.conditions.find(cond => cond.id === id);
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
      {showImprove && <ImproveModal entityName={c.name} onClose={() => setShowImprove(false)} />}
    </div>
  );
}

export function RemedyPage({ id, onBack, onNavigate }) {
  const r = database.remedies.find(rem => rem.id === id);
  const [showFlag, setShowFlag] = useState(false);
  const [showImprove, setShowImprove] = useState(false);

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
      {showImprove && <ImproveModal entityName={r.name} onClose={() => setShowImprove(false)} />}
    </div>
  );
}
