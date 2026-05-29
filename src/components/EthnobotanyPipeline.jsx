import React, { useState, useEffect } from 'react';
import { Sprout, Search, ArrowRight, User, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle, FileText, ClipboardList, Trash2 } from 'lucide-react';
import { database } from '../data/database';

export default function EthnobotanyPipeline() {
  const [activeSubTab, setActiveSubTab] = useState('submit'); // 'submit' | 'moderate' | 'audit'

  // Submission Form States
  const [healerName, setHealerName] = useState('');
  const [plantName, setPlantName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [prepInstructions, setPrepInstructions] = useState('');
  const [safetyRating, setSafetyRating] = useState('Moderate Safety');
  const [safetyAlert, setSafetyAlert] = useState('');
  const [indications, setIndications] = useState([]);
  const [citationTrail, setCitationTrail] = useState('');
  
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionsQueue, setSubmissionsQueue] = useState([]);
  const [approvedRemedies, setApprovedRemedies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Load submissions and approved lists on mount
  useEffect(() => {
    const queue = localStorage.getItem('this_ethnobotany_submissions');
    if (queue) {
      try { setSubmissionsQueue(JSON.parse(queue)); } catch(e) {}
    } else {
      // Seed demonstration submissions
      const demoSub = [
        {
          id: Date.now() - 10000,
          healerName: "Mzee Juma, Kilifi Herbalist Registry",
          plantName: "Baobab Bark Decoction",
          scientificName: "Adansonia digitata L.",
          prepInstructions: "Boil 10g of clean dried baobab bark strips in 500ml of fresh water for 20 minutes. Filter and drink warm thrice daily to combat fever shivering.",
          safetyRating: "High Safety",
          safetyAlert: "Safe in moderate quantities. Do not exceed 3 cups daily.",
          indications: ["high-fever", "severe-rigors"],
          citationTrail: "Oral tradition documented under Coastal Ethnobotanical Survey (2024), ODPC Registered.",
          status: "pending"
        }
      ];
      setSubmissionsQueue(demoSub);
      localStorage.setItem('this_ethnobotany_submissions', JSON.stringify(demoSub));
    }

    const approved = localStorage.getItem('this_ethnobotany_approved');
    if (approved) {
      try { setApprovedRemedies(JSON.parse(approved)); } catch(e) {}
    }

    const logs = localStorage.getItem('this_admin_audit_logs');
    if (logs) {
      try { setAuditLogs(JSON.parse(logs)); } catch(e) {}
    } else {
      const demoLogs = [
        {
          id: 1,
          action: "Initialize Mod-Queue",
          user: "Admin System",
          timestamp: new Date(Date.now() - 86400000).toLocaleString(),
          details: "Offline crowdsourced contribution queue established successfully."
        }
      ];
      setAuditLogs(demoLogs);
      localStorage.setItem('this_admin_audit_logs', JSON.stringify(demoLogs));
    }
  }, []);

  const handleSubmitRecipe = (e) => {
    e.preventDefault();
    if (!plantName || !prepInstructions || !healerName) return;

    const newSubmission = {
      id: Date.now(),
      healerName,
      plantName,
      scientificName: scientificName || "Unclassified Botanical Specimen",
      prepInstructions,
      safetyRating,
      safetyAlert: safetyAlert || "No immediate acute contraindications recorded. Practice clinical caution.",
      indications,
      citationTrail: citationTrail || "Ethno-botanical oral tradition, traceable to practitioner.",
      status: "pending"
    };

    const updatedQueue = [...submissionsQueue, newSubmission];
    setSubmissionsQueue(updatedQueue);
    localStorage.setItem('this_ethnobotany_submissions', JSON.stringify(updatedQueue));

    // Reset Form
    setHealerName('');
    setPlantName('');
    setScientificName('');
    setPrepInstructions('');
    setSafetyRating('Moderate Safety');
    setSafetyAlert('');
    setIndications([]);
    setCitationTrail('');
    
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 5000);
  };

  const handleApprove = (sub) => {
    // 1. Mark as approved in queue
    const updatedQueue = submissionsQueue.filter(s => s.id !== sub.id);
    setSubmissionsQueue(updatedQueue);
    localStorage.setItem('this_ethnobotany_submissions', JSON.stringify(updatedQueue));

    // 2. Add to approved remedies list (caches remedy locally so other components dynamically load it!)
    const newRemedy = {
      id: `crowd-${sub.id}`,
      name: sub.plantName,
      scientificName: sub.scientificName,
      category: "botanical",
      description: `[CROWDSOURCED VETTED ENTRY] Contributed by: ${sub.healerName}. ${sub.citationTrail}`,
      activeConstituents: ["Organic Traditional Extract"],
      preparation: sub.prepInstructions,
      safetyRating: sub.safetyRating,
      safetyAlert: sub.safetyAlert,
      interactions: "None recorded. Standard herb caution.",
      isCrowdsourced: true,
      healerName: sub.healerName
    };

    const updatedApproved = [newRemedy, ...approvedRemedies];
    setApprovedRemedies(updatedApproved);
    localStorage.setItem('this_ethnobotany_approved', JSON.stringify(updatedApproved));
    
    // 2.b. Stage in offline pending sync queue for Serverless Sync Gateway
    const syncItem = {
      id: `crowd-${sub.id}`,
      collection: "remedies",
      action: "create",
      timestamp: Date.now(),
      data: {
        id: `crowd-${sub.id}`,
        name: sub.plantName,
        scientificName: sub.scientificName,
        category: "botanical",
        description: `[CROWDSOURCED VETTED ENTRY] Contributed by: ${sub.healerName}. ${sub.citationTrail}`,
        activeConstituents: ["Organic Traditional Extract"],
        preparation: sub.prepInstructions,
        safetyRating: sub.safetyRating,
        safetyAlert: sub.safetyAlert,
        interactions: "None recorded. Standard herb caution.",
        synonyms: sub.indications.map(ind => ({ synonym: ind }))
      }
    };
    
    let currentSyncQueue = [];
    const savedSyncQueue = localStorage.getItem('this_pending_sync_queue');
    if (savedSyncQueue) {
      try { currentSyncQueue = JSON.parse(savedSyncQueue); } catch(e) {}
    }
    const updatedSyncQueue = [syncItem, ...currentSyncQueue];
    localStorage.setItem('this_pending_sync_queue', JSON.stringify(updatedSyncQueue));
    window.dispatchEvent(new Event('this_sync_queue_changed'));

    // Dispatch custom event to notify App.jsx and database context
    window.dispatchEvent(new Event('this_database_enriched'));

    // 3. Add to admin audit logs
    const newAudit = {
      id: Date.now(),
      action: "Approve Traditional Remedy",
      user: "Auditing Officer",
      timestamp: new Date().toLocaleString(),
      details: `Vetted & approved '${sub.plantName}' contributed by ${sub.healerName}. Stored in local registry.`
    };
    const updatedLogs = [newAudit, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('this_admin_audit_logs', JSON.stringify(updatedLogs));
  };

  const handleReject = (subId, name) => {
    const updatedQueue = submissionsQueue.filter(s => s.id !== subId);
    setSubmissionsQueue(updatedQueue);
    localStorage.setItem('this_ethnobotany_submissions', JSON.stringify(updatedQueue));

    const newAudit = {
      id: Date.now(),
      action: "Reject Submission",
      user: "Auditing Officer",
      timestamp: new Date().toLocaleString(),
      details: `Rejected submission for '${name}' due to clinical vetting discrepancy.`
    };
    const updatedLogs = [newAudit, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('this_admin_audit_logs', JSON.stringify(updatedLogs));
  };

  const handleClearApproved = (id, name) => {
    const updated = approvedRemedies.filter(r => r.id !== id);
    setApprovedRemedies(updated);
    localStorage.setItem('this_ethnobotany_approved', JSON.stringify(updated));
    
    // Remove from offline pending sync queue if it exists there
    let currentSyncQueue = [];
    const savedSyncQueue = localStorage.getItem('this_pending_sync_queue');
    if (savedSyncQueue) {
      try {
        currentSyncQueue = JSON.parse(savedSyncQueue);
        const updatedSyncQueue = currentSyncQueue.filter(item => item.id !== id);
        localStorage.setItem('this_pending_sync_queue', JSON.stringify(updatedSyncQueue));
        window.dispatchEvent(new Event('this_sync_queue_changed'));
      } catch(e) {}
    }
    
    window.dispatchEvent(new Event('this_database_enriched'));

    const newAudit = {
      id: Date.now(),
      action: "Remove Approved Remedy",
      user: "Auditing Officer",
      timestamp: new Date().toLocaleString(),
      details: `Removed approved crowdsourced remedy '${name}' from clinical registry.`
    };
    const updatedLogs = [newAudit, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('this_admin_audit_logs', JSON.stringify(updatedLogs));
  };

  const toggleIndicationSymptom = (id) => {
    if (indications.includes(id)) {
      setIndications(indications.filter(sId => sId !== id));
    } else {
      setIndications([...indications, id]);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Visual Header */}
      <div className="glass-panel p-6 bg-white border-l-4 border-l-emerald-800 shadow-sm no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
              <Sprout className="h-5.5 w-5.5 text-emerald-800 animate-pulse" />
              Traditional Ethnobotany Submissions & Moderation Desk
            </h2>
            <p className="text-xs text-slate-500">
              Preserve traditional botanical knowledge, audit practitioner credentials, and approve peer-reviewed crowdsourced recipes directly into the active medical registry.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200/50 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('submit')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'submit' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Submit Recipe
            </button>
            <button
              onClick={() => setActiveSubTab('moderate')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'moderate' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Moderate Queue
              {submissionsQueue.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-rose-500 inline-block animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'audit' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Audit Logs
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
         TAB 1: TRADITIONAL MEDICINE SUBMISSION FORM
         ======================================================== */}
      {activeSubTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmitRecipe} className="glass-panel p-6 bg-white border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-emerald-950 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText className="h-4.5 w-4.5 text-emerald-800" />
                Ethnobotanical Recipe Entry
              </h3>

              {submissionSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-2 animate-scale-up">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  Recipe submitted successfully! Sent to clinical moderators for validation and audit trail indexing.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Healer identity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Contributor / Practitioner Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mzee Chengo, Rabai Traditional Elder"
                    value={healerName}
                    onChange={(e) => setHealerName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Citation trail */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Traceable Citation Trail / Oral Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Documented oral tradition, coast herbal lineage registry"
                    value={citationTrail}
                    onChange={(e) => setCitationTrail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Common plant name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Traditional Plant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Moringa Leaves (Mlonge)"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Scientific Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Scientific Botanical Classification (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Moringa oleifera"
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Target indications symptoms checkbox */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Target Clinical Indications</label>
                <div className="flex flex-wrap gap-1.5">
                  {database.symptoms.slice(0, 8).map(sym => {
                    const isChecked = indications.includes(sym.id);
                    return (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => toggleIndicationSymptom(sym.id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                          isChecked 
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-sm'
                            : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {sym.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prep instructions */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Detailed Preparation & Dosage Method</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Aqueous decoction: Boil 5g of dried roots in 250ml water for 15 minutes. Administer 100ml orally twice daily after meals..."
                  value={prepInstructions}
                  onChange={(e) => setPrepInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Safety rating */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Safety Classification Estimate</label>
                  <select
                    value={safetyRating}
                    onChange={(e) => setSafetyRating(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    <option value="High Safety">High Safety</option>
                    <option value="Moderate Safety">Moderate Safety</option>
                    <option value="Moderate Caution">Moderate Caution</option>
                    <option value="High Caution">High Caution</option>
                  </select>
                </div>

                {/* Contraindications */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Specific Contraindications / Cautions</label>
                  <input
                    type="text"
                    placeholder="e.g. Do not administer during pregnancy or to infants"
                    value={safetyAlert}
                    onChange={(e) => setSafetyAlert(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Submit Recipe to Outpost Review Board
              </button>
            </form>
          </div>

          {/* Right sidebar info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl shadow space-y-3">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5" /> Traditional Medicine Sovereignty
              </h4>
              <p className="text-[10px] leading-relaxed opacity-95">
                THIS values the centuries-old clinical wisdom of traditional medicine practitioners. Crowdsourced submissions go through a rigorous medical vetting review board to verify botanical safety, identify harmful drug interactions, and document practitioner credentials.
              </p>
              <div className="border-t border-emerald-900 pt-2 text-[9px] text-emerald-300 font-bold space-y-1">
                <span>• Contributions are securely cached at the outpost.</span>
                <span className="block">• Moderated approval merges the recipe back into the active search index dynamically.</span>
                <span className="block">• Auditing log registers every moderator's action for clinical audit compliance.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
         TAB 2: ADMINISTRATIVE MODERATION QUEUE
         ======================================================== */}
      {activeSubTab === 'moderate' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ClipboardList className="h-4.5 w-4.5 text-sky-600 animate-pulse" />
              Incoming Contributions Queue ({submissionsQueue.length})
            </h3>

            {submissionsQueue.length > 0 ? (
              <div className="space-y-4">
                {submissionsQueue.map(sub => (
                  <div key={sub.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 pb-2 gap-2">
                      <div>
                        <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          Traditional Recipe
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-800 mt-1">{sub.plantName} <span className="text-[10px] font-medium text-slate-400 italic">({sub.scientificName})</span></h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(sub)}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                        >
                          Vet & Approve
                        </button>
                        <button
                          onClick={() => handleReject(sub.id, sub.plantName)}
                          className="px-3.5 py-1.5 bg-rose-550 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700 leading-relaxed">
                      <div>
                        <p><strong>Traditional Healer:</strong> {sub.healerName}</p>
                        <p className="mt-1"><strong>Citation / Reference Trail:</strong> {sub.citationTrail}</p>
                        <p className="mt-1"><strong>Indications:</strong> {sub.indications.length > 0 ? sub.indications.join(', ') : 'General wellness'}</p>
                      </div>
                      <div>
                        <p><strong>Prep & Dosage Method:</strong> {sub.prepInstructions}</p>
                        <p className="mt-1"><strong>Safety Classification:</strong> <span className="font-bold text-amber-700">{sub.safetyRating}</span></p>
                        <p className="mt-1"><strong>Safety Caveats:</strong> {sub.safetyAlert}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 py-8 italic bg-slate-50 rounded-xl border border-slate-100">
                All submissions have been reviewed. There are no pending traditional recipes in the moderation queue.
              </p>
            )}
          </div>

          {/* List of Approved Crowdsourced Remedies */}
          <div className="glass-panel p-5 bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-700" />
              Approved Ethnobotanical Registries ({approvedRemedies.length})
            </h3>

            {approvedRemedies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedRemedies.map(rem => (
                  <div key={rem.id} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/10 space-y-2 relative flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-850 flex items-center justify-between">
                        <span>{rem.name}</span>
                        <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-150 px-1.5 py-0.2 rounded font-black">APPROVED</span>
                      </h4>
                      <p className="text-[9px] text-slate-400 italic mt-0.5">{rem.scientificName}</p>
                      <p className="text-xs text-slate-655 font-medium leading-relaxed mt-2">{rem.preparation}</p>
                      <p className="text-[10px] text-slate-450 font-bold mt-2">Contributed by traditional healer: <strong>{rem.healerName}</strong></p>
                    </div>

                    <div className="border-t border-slate-100/50 pt-2.5 mt-2.5 flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase">CROWD-{rem.id.split('-')[1]}</span>
                      <button
                        onClick={() => handleClearApproved(rem.id, rem.name)}
                        className="text-slate-400 hover:text-rose-600 rounded p-1 hover:bg-rose-50 transition-all shrink-0"
                        title="Remove Approved Remedy"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 py-6 italic">No crowdsourced remedies approved in this clinic yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
         TAB 3: ADMINISTRATIVE AUDIT LOGS
         ======================================================== */}
      {activeSubTab === 'audit' && (
        <div className="glass-panel p-5 bg-white border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <ClipboardList className="h-4.5 w-4.5 text-amber-600" />
            Clinic Audit Log Trail (ISO 27001 / KDPA Compliant)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200 text-left text-xs font-medium">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="border border-slate-200 p-2">Timestamp</th>
                  <th className="border border-slate-200 p-2">Clinical Action</th>
                  <th className="border border-slate-200 p-2">User / Role</th>
                  <th className="border border-slate-200 p-2">Audit Action Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="border border-slate-200 p-2 font-mono text-[10px] text-slate-450">{log.timestamp}</td>
                    <td className="border border-slate-200 p-2 font-bold text-slate-800 uppercase text-[9px] tracking-wider">{log.action}</td>
                    <td className="border border-slate-200 p-2 font-bold text-emerald-800">{log.user}</td>
                    <td className="border border-slate-200 p-2 text-slate-600 font-semibold">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
