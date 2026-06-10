import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertOctagon, 
  Heart, 
  Users, 
  RefreshCw, 
  Calculator, 
  FileText, 
  Printer, 
  Search, 
  Check, 
  X, 
  Info, 
  Activity 
} from 'lucide-react';
import { database } from '../data/database';
import { getLocalizedRemedy } from '../utils/regionalHelper';

export default function SafetyChecker({ selectedRegion }) {
  const [activeTab, setActiveTab] = useState('demographic');

  // ==========================================
  // TAB 1: DEMOGRAPHIC SAFETY CHECK STATE
  // ==========================================
  const [selectedPopulation, setSelectedPopulation] = useState('none');
  const [selectedRemedy, setSelectedRemedy] = useState('none');

  const populationObj = database.populations.find(p => p.id === selectedPopulation);
  const baseRemedyObj = database.remedies.find(r => r.id === selectedRemedy);
  const remedyObj = getLocalizedRemedy(baseRemedyObj, selectedRegion);

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

  const handleDemographicReset = () => {
    setSelectedPopulation('none');
    setSelectedRemedy('none');
  };

  // ==========================================
  // TAB 2: DILI & RUCAM AUDITOR STATE
  // ==========================================
  // 1. Lab Values & R-Value Calculator
  const [patientAlt, setPatientAlt] = useState('');
  const [altUln, setAltUln] = useState('40');
  const [patientAlp, setPatientAlp] = useState('');
  const [alpUln, setAlpUln] = useState('120');

  // Compute R-Value and Injury Pattern
  const altVal = parseFloat(patientAlt);
  const altUlnVal = parseFloat(altUln);
  const alpVal = parseFloat(patientAlp);
  const alpUlnVal = parseFloat(alpUln);

  const altRatio = (altVal > 0 && altUlnVal > 0) ? (altVal / altUlnVal) : 0;
  const alpRatio = (alpVal > 0 && alpUlnVal > 0) ? (alpVal / alpUlnVal) : 0;
  const rValue = (altRatio > 0 && alpRatio > 0) ? (altRatio / alpRatio) : 0;

  let activePattern = null;
  if (altRatio > 0 && alpRatio > 0) {
    if (rValue >= 5.0) {
      activePattern = 'hepatocellular';
    } else if (rValue > 2.0 && rValue < 5.0) {
      activePattern = 'mixed';
    } else {
      activePattern = 'cholestatic';
    }
  }

  // 2. RUCAM 5-Domain Selection
  const [timeToOnset, setTimeToOnset] = useState('none');
  const [riskFactors, setRiskFactors] = useState({
    age55: false,
    alcohol: false,
    pregnancy: false
  });
  
  // Concomitant Herbs picker
  const [remedySearchQuery, setRemedySearchQuery] = useState('');
  const [selectedConcomitantRemedies, setSelectedConcomitantRemedies] = useState([]);
  const [concomitantTier, setConcomitantTier] = useState('none'); // 'none', 'compatible', 'highly_suspicious'

  // Exclusions
  const [exclusions, setExclusions] = useState({
    serologyNeg: false,
    ultrasoundNeg: false,
    otherRuledOut: false,
    altCauseIdentified: false
  });

  // Decline course
  const [enzymeDecline, setEnzymeDecline] = useState('none');

  // Get hepatotoxic remedies checked
  const hepatotoxicRemediesInDb = database.remedies.filter(r => r.hepatotoxic);
  const activeHepatotoxicRemediesSelected = selectedConcomitantRemedies.map(id => 
    database.remedies.find(r => r.id === id)
  ).filter(r => r && r.hepatotoxic);

  // Compute Total RUCAM Score
  let rucamScore = 0;

  // Domain 1: Time to Onset
  if (timeToOnset === 'onset_5_90') {
    rucamScore += 2;
  } else if (timeToOnset === 'onset_less_5_more_90') {
    rucamScore += 1;
  } else if (timeToOnset === 'stop_le_15') {
    rucamScore += 1;
  } else if (timeToOnset === 'stop_le_30') {
    rucamScore += 1;
  }

  // Domain 2: Risk Factors
  if (riskFactors.age55) rucamScore += 1;
  if (riskFactors.alcohol) rucamScore += 1;
  if (riskFactors.pregnancy && (activePattern === 'mixed' || activePattern === 'cholestatic')) {
    rucamScore += 1;
  }

  // Domain 3: Concomitant Herbs/Drugs
  if (concomitantTier === 'compatible') {
    rucamScore += 1;
  } else if (concomitantTier === 'highly_suspicious') {
    rucamScore += 2;
  }

  // Domain 4: Exclusions
  if (exclusions.altCauseIdentified) {
    rucamScore -= 2;
  } else {
    const checkCount = [exclusions.serologyNeg, exclusions.ultrasoundNeg, exclusions.otherRuledOut].filter(Boolean).length;
    if (checkCount === 3) {
      rucamScore += 2;
    } else if (checkCount > 0) {
      rucamScore += 1;
    }
  }

  // Domain 5: Enzyme Decline
  if (enzymeDecline === 'decline_ge_50_8d') {
    rucamScore += 3;
  } else if (enzymeDecline === 'decline_ge_50_30d') {
    rucamScore += 2;
  } else if (enzymeDecline === 'decline_ge_50_after_30d') {
    rucamScore += 1;
  }

  // RUCAM Causality classification
  let causalityBadge = {
    text: 'Unlikely',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    pulse: '',
    directive: 'ROUTINE AUDIT: Causality is unlikely. Continue standard diagnostic workup for non-drug hepatic injury. Monitor baseline transaminases.'
  };

  if (rucamScore >= 9) {
    causalityBadge = {
      text: 'Highly Probable',
      color: 'bg-rose-100 text-rose-800 border-rose-200 shadow-[0_0_12px_rgba(225,29,72,0.15)] font-black',
      pulse: 'hepatocellular-pulse border-rose-500',
      directive: 'CRITICAL ADVOCACY: Immediate cessation of all suspect herbs/drugs. Alert regional pharmacovigilance registry. Support liver function, monitor coagulation (PT/INR), and check daily transaminases.'
    };
  } else if (rucamScore >= 6) {
    causalityBadge = {
      text: 'Probable',
      color: 'bg-amber-100 text-amber-800 border-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)] font-bold',
      pulse: 'mixed-pulse border-amber-500',
      directive: 'STRONG RECOMMENDATION: Discontinue suspect substance immediately. Re-evaluate alternative etiologies and repeat liver function tests within 48-72 hours.'
    };
  } else if (rucamScore >= 3) {
    causalityBadge = {
      text: 'Possible',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200 font-bold',
      pulse: '',
      directive: 'CLINICAL ADVISORY: Suspected causality is possible. Closely monitor transaminases. Avoid re-exposure. Keep investigating secondary causes.'
    };
  }

  // Remedy search logic
  const filteredRemedies = remedySearchQuery.trim() === '' 
    ? [] 
    : database.remedies.filter(r => 
        r.name.toLowerCase().includes(remedySearchQuery.toLowerCase()) ||
        r.scientificName.toLowerCase().includes(remedySearchQuery.toLowerCase())
      ).slice(0, 5);

  const toggleConcomitantRemedy = (id) => {
    if (selectedConcomitantRemedies.includes(id)) {
      setSelectedConcomitantRemedies(selectedConcomitantRemedies.filter(rId => rId !== id));
    } else {
      setSelectedConcomitantRemedies([...selectedConcomitantRemedies, id]);
      // If adding a hepatotoxic remedy, auto-select a compatible or suspicious tier as advice
      const remObj = database.remedies.find(r => r.id === id);
      if (remObj && remObj.hepatotoxic && concomitantTier === 'none') {
        setConcomitantTier('compatible');
      }
    }
    setRemedySearchQuery('');
  };

  const handleRucamReset = () => {
    setPatientAlt('');
    setAltUln('40');
    setPatientAlp('');
    setAlpUln('120');
    setTimeToOnset('none');
    setRiskFactors({ age55: false, alcohol: false, pregnancy: false });
    setSelectedConcomitantRemedies([]);
    setConcomitantTier('none');
    setExclusions({ serologyNeg: false, ultrasoundNeg: false, otherRuledOut: false, altCauseIdentified: false });
    setEnzymeDecline('none');
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* 1. Visual Header (Screen only) */}
      <div className="glass-panel p-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600 animate-pulse" />
              Bedside Safety Checker & Drug-Induced Liver Injury (DILI) Auditor
            </h2>
            <p className="text-xs text-slate-500">
              Cross-reference vulnerable patient groups against traditional botanicals, calculate hepatic injury patterns, and score clinical RUCAM causality entirely offline.
            </p>
          </div>
          
          {/* Dual-Tab Navigation controls */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start md:self-auto border border-slate-200/50">
            <button
              onClick={() => setActiveTab('demographic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'demographic'
                  ? 'bg-white text-[hsl(var(--primary-green))] shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Demographic Check</span>
            </button>
            <button
              onClick={() => setActiveTab('dili')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'dili'
                  ? 'bg-white text-[hsl(var(--primary-green))] shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>DILI & RUCAM Auditor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
         TAB 1: DEMOGRAPHIC CAUTIONS VIEW
         ======================================================== */}
      {activeTab === 'demographic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
          {/* Input Selectors */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-5 space-y-4">
              <label 
                htmlFor="safety-population-select"
                className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <Users className="h-4 w-4" />
                1. Vulnerable Demographic
              </label>
              <select
                id="safety-population-select"
                value={selectedPopulation}
                onChange={(e) => setSelectedPopulation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="none">-- Select Target Group --</option>
                {database.populations.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <label 
                htmlFor="safety-remedy-select"
                className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1 pt-2 cursor-pointer"
              >
                <Heart className="h-4 w-4" />
                2. Remedy or Botanical
              </label>
              <select
                id="safety-remedy-select"
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
                  onClick={handleDemographicReset}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors mt-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset Checker
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Warning Banners */}
          <div className="lg:col-span-8 space-y-4">
            {selectedPopulation === 'none' && selectedRemedy === 'none' && (
              <div className="glass-panel p-10 text-center flex flex-col items-center justify-center h-full min-h-[220px]">
                <ShieldAlert className="h-10 w-10 text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-600 text-sm">Select parameters to check safety</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Select a vulnerable population group and a remedy on the left to compute instant warnings and drug-herb interactions.
                </p>
              </div>
            )}

            {intersectionAlert && (
              <div className={`p-5 rounded-xl border flex gap-3 animate-fade-in ${
                intersectionAlert.type === 'danger' 
                  ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm' 
                  : intersectionAlert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm'
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
                  <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-100 space-y-1">
                    <span className="text-[9px] uppercase font-black text-rose-800 tracking-wider block">
                      CONTRAINDICATIONS & SAFETY ALERTS:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {remedyObj.safetyAlert}
                    </p>
                  </div>

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
      )}

      {/* ========================================================
         TAB 2: DILI & RUCAM AUDITOR SCREEN VIEW
         ======================================================== */}
      {activeTab === 'dili' && (
        <div className="space-y-6 no-print">
          {/* Main layout grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Lab Calculator & RUCAM form */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* ALT / ALP R-Value Calculator Card */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5 m-0">
                    <Calculator className="h-4 w-4 text-emerald-600" />
                    Hepatic Injury Pattern & R-Value Calculator
                  </h3>
                  <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold font-mono">
                    WHO/DILI Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ALT Card */}
                  <div className="bg-slate-50/70 p-3.5 border border-slate-200/50 rounded-xl space-y-3">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">
                      ALT (Alanine Aminotransferase)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="dili-patient-alt" className="text-[9px] font-bold text-slate-500 block mb-1">Patient Value (U/L)</label>
                        <input
                          id="dili-patient-alt"
                          type="number"
                          placeholder="e.g. 150"
                          value={patientAlt}
                          onChange={(e) => setPatientAlt(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="dili-alt-uln" className="text-[9px] font-bold text-slate-500 block mb-1">ULN (U/L)</label>
                        <input
                          id="dili-alt-uln"
                          type="number"
                          placeholder="e.g. 40"
                          value={altUln}
                          onChange={(e) => setAltUln(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    {altRatio > 0 && (
                      <div className="text-[10px] text-emerald-800 font-bold">
                        Elevation: {altRatio.toFixed(2)}x ULN
                      </div>
                    )}
                  </div>
 
                  {/* ALP Card */}
                  <div className="bg-slate-50/70 p-3.5 border border-slate-200/50 rounded-xl space-y-3">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">
                      ALP (Alkaline Phosphatase)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="dili-patient-alp" className="text-[9px] font-bold text-slate-500 block mb-1">Patient Value (U/L)</label>
                        <input
                          id="dili-patient-alp"
                          type="number"
                          placeholder="e.g. 200"
                          value={patientAlp}
                          onChange={(e) => setPatientAlp(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="dili-alp-uln" className="text-[9px] font-bold text-slate-500 block mb-1">ULN (U/L)</label>
                        <input
                          id="dili-alp-uln"
                          type="number"
                          placeholder="e.g. 120"
                          value={alpUln}
                          onChange={(e) => setAlpUln(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    {alpRatio > 0 && (
                      <div className="text-[10px] text-emerald-800 font-bold">
                        Elevation: {alpRatio.toFixed(2)}x ULN
                      </div>
                    )}
                  </div>
                </div>

                {/* Calculated Result Banner */}
                {activePattern ? (
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in transition-all ${
                    activePattern === 'hepatocellular'
                      ? 'bg-rose-50 border-rose-200 text-rose-900 hepatocellular-pulse'
                      : activePattern === 'mixed'
                      ? 'bg-amber-50 border-amber-200 text-amber-900 mixed-pulse'
                      : 'bg-sky-50 border-sky-200 text-sky-900 cholestatic-pulse'
                  }`}>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Activity className="h-4 w-4 shrink-0" />
                        Active Hepatic Pattern: {activePattern.toUpperCase()}
                      </h4>
                      <p className="text-[11px] leading-relaxed opacity-90">
                        {activePattern === 'hepatocellular' && "Predominant transaminase elevation. Highest risk of acute liver failure. Immediate transaminase and PT/INR review mandated."}
                        {activePattern === 'mixed' && "Co-elevation of transaminases and alkaline phosphatase. Monitor both hepatocellular and biliary parameters."}
                        {activePattern === 'cholestatic' && "Predominant alkaline phosphatase elevation. Highly suggestive of toxic biliary injury. Ensure biliary patency via ultrasound."}
                      </p>
                    </div>
                    <div className="text-center bg-white/70 border border-current/25 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto shadow-sm">
                      <span className="text-[9px] font-bold uppercase tracking-wider block leading-none">R-Ratio</span>
                      <span className="text-lg font-black font-mono leading-none mt-1 block">{rValue.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-xs text-slate-400">
                    Enter positive ALT & ALP values above to calculate the hepatic injury R-value and pattern.
                  </div>
                )}
              </div>

              {/* RUCAM Causality Scorecard */}
              <div className="glass-panel p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5 m-0">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Interactive 5-Domain RUCAM Scorecard
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Client-Side Auditor
                  </span>
                </div>

                {/* Domain 1: Time to Onset */}
                <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-200/40 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 m-0 uppercase tracking-wide">
                        Domain 1: Time to Onset of Symptom / Lab Elevation
                      </h4>
                      <p className="text-[10px] text-slate-500">Select the relative time interval since initial ingestion of botanicals or drugs.</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0 font-mono">
                      Weight: {timeToOnset === 'onset_5_90' ? '+2' : (timeToOnset === 'none' ? '0' : '+1')} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5" role="group" aria-label="Time to Onset options">
                    {[
                      { id: 'onset_5_90', label: 'Ingestion Active: Onset 5 to 90 days after starting (+2 pts)' },
                      { id: 'onset_less_5_more_90', label: 'Ingestion Active: Onset < 5 days or > 90 days (+1 pt)' },
                      { id: 'stop_le_15', label: 'Stopped: Onset <= 15 days (Hepatocellular) (+1 pt)' },
                      { id: 'stop_le_30', label: 'Stopped: Onset <= 30 days (Mixed/Cholestatic) (+1 pt)' },
                      { id: 'none', label: 'None Selected / Unknown (0 pts)' }
                    ].map(choice => (
                      <button
                        key={choice.id}
                        onClick={() => setTimeToOnset(choice.id)}
                        aria-pressed={timeToOnset === choice.id}
                        className={`text-left p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                          timeToOnset === choice.id
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Domain 2: Risk Factors */}
                <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-200/40 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 m-0 uppercase tracking-wide">
                        Domain 2: Patient Demographic Risk Factors
                      </h4>
                      <p className="text-[10px] text-slate-500">Select active patient conditions. Pregnancy factor applies ONLY to Cholestatic/Mixed patterns.</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0 font-mono">
                      Weight: +{[
                        riskFactors.age55,
                        riskFactors.alcohol,
                        riskFactors.pregnancy && (activePattern === 'mixed' || activePattern === 'cholestatic')
                      ].filter(Boolean).length} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1.5" role="group" aria-label="Demographic Risk Factors options">
                    {/* Age >= 55 */}
                    <button
                      onClick={() => setRiskFactors({ ...riskFactors, age55: !riskFactors.age55 })}
                      role="checkbox"
                      aria-checked={riskFactors.age55}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        riskFactors.age55
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        riskFactors.age55 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {riskFactors.age55 && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span>Age &gt;= 55 years (+1 pt)</span>
                    </button>

                    {/* Alcohol */}
                    <button
                      onClick={() => setRiskFactors({ ...riskFactors, alcohol: !riskFactors.alcohol })}
                      role="checkbox"
                      aria-checked={riskFactors.alcohol}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        riskFactors.alcohol
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        riskFactors.alcohol ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {riskFactors.alcohol && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span>Alcohol Use (+1 pt)</span>
                    </button>

                    {/* Pregnancy */}
                    <button
                      onClick={() => setRiskFactors({ ...riskFactors, pregnancy: !riskFactors.pregnancy })}
                      role="checkbox"
                      aria-checked={riskFactors.pregnancy}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        riskFactors.pregnancy
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        riskFactors.pregnancy ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {riskFactors.pregnancy && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span>Active Pregnancy</span>
                        {riskFactors.pregnancy && activePattern && activePattern !== 'mixed' && activePattern !== 'cholestatic' && (
                          <span className="block text-[8px] text-rose-600 font-extrabold mt-0.5">0 pts (Hepatocellular)</span>
                        )}
                        {riskFactors.pregnancy && (activePattern === 'mixed' || activePattern === 'cholestatic') && (
                          <span className="block text-[8px] text-emerald-700 font-extrabold mt-0.5">+1 pt (Cholestatic/Mixed)</span>
                        )}
                        {!activePattern && riskFactors.pregnancy && (
                          <span className="block text-[8px] text-slate-400 font-medium mt-0.5">Awaiting R-Ratio</span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Domain 3: Concomitant Herbs & Relational Search */}
                <div className="space-y-4 bg-slate-50/50 p-4 border border-slate-200/40 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 m-0 uppercase tracking-wide">
                        Domain 3: Concomitant Botanicals & Pharmaceuticals
                      </h4>
                      <p className="text-[10px] text-slate-500">Cross-reference clinical exposures. Scans and alerts on database remedies with registered hepatotoxicity.</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0 font-mono">
                      Weight: {concomitantTier === 'compatible' ? '+1' : (concomitantTier === 'highly_suspicious' ? '+2' : '0')} pts
                    </span>
                  </div>

                  {/* Bedside fast-tap & search picker */}
                  <div className="space-y-2">
                    <label htmlFor="dili-remedy-search" className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block cursor-pointer">1. Patient Co-Exposures (Search Database)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="dili-remedy-search"
                        type="text"
                        placeholder="Search remedies (e.g. Neem, Albendazole)..."
                        value={remedySearchQuery}
                        onChange={(e) => setRemedySearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      
                      {/* Search Results Dropdown */}
                      {filteredRemedies.length > 0 && (
                        <div className="absolute top-[105%] left-0 right-0 bg-white border border-slate-200/80 shadow-lg rounded-xl z-50 divide-y divide-slate-100 overflow-hidden">
                          {filteredRemedies.map(rem => {
                            const isSelected = selectedConcomitantRemedies.includes(rem.id);
                            return (
                              <button
                                key={rem.id}
                                onClick={() => toggleConcomitantRemedy(rem.id)}
                                className="w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-emerald-50/50 transition-colors"
                              >
                                <div>
                                  <span className="text-slate-800 font-bold block">{rem.name}</span>
                                  <span className="text-[9px] text-slate-400 italic block">{rem.scientificName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {rem.hepatotoxic && (
                                    <span className="text-[8px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 font-extrabold uppercase shrink-0">
                                      Hepatotoxic Risk
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 ${
                                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {isSelected ? 'Remove' : 'Add'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Selection Tags */}
                  {selectedConcomitantRemedies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedConcomitantRemedies.map(id => {
                        const rem = database.remedies.find(r => r.id === id);
                        if (!rem) return null;
                        return (
                          <span 
                            key={id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                              rem.hepatotoxic 
                                ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm' 
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{rem.name}</span>
                            <button
                              onClick={() => toggleConcomitantRemedy(id)}
                              className="text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/50 p-0.5 shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Relational Safety Warning Alerts */}
                  {activeHepatotoxicRemediesSelected.map(rem => (
                    <div key={rem.id} className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex gap-3 animate-fade-in">
                      <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-extrabold text-xs uppercase tracking-wide mb-0.5">
                          🚨 Relational Hepatotoxic Risk: {rem.name}
                        </h5>
                        <p className="text-[10px] leading-relaxed">
                          This treatment contains documented hepatic stress agents (<strong>{rem.activeConstituents.join(', ')}</strong>). 
                          Clinical caution: {rem.safetyAlert}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* 2. RUCAM Concomitant Scoring Tier Selector */}
                  <div className="space-y-2 pt-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">2. Causality Scoring Tier (Domain 3 Score)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Causality Scoring Tier options">
                      {[
                        { id: 'none', label: 'No concomitant hepatotoxic substances (0 pts)' },
                        { id: 'compatible', label: 'Exposures present with compatible onset (+1 pt)' },
                        { id: 'highly_suspicious', label: 'Highly suspected co-offender / active toxicity (+2 pts)' }
                      ].map(tier => (
                        <button
                          key={tier.id}
                          onClick={() => setConcomitantTier(tier.id)}
                          aria-pressed={concomitantTier === tier.id}
                          className={`text-left p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                            concomitantTier === tier.id
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Domain 4: Exclusions */}
                <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-200/40 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 m-0 uppercase tracking-wide">
                        Domain 4: Rule out of Alternative Causes
                      </h4>
                      <p className="text-[10px] text-slate-500">Perform checklist exclusions. Ruled-out causes increment score; a confirmed alternative cause deducts points.</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0 font-mono">
                      Weight: {exclusions.altCauseIdentified ? '-2' : `+${[exclusions.serologyNeg, exclusions.ultrasoundNeg, exclusions.otherRuledOut].filter(Boolean).length === 3 ? '2' : ([exclusions.serologyNeg, exclusions.ultrasoundNeg, exclusions.otherRuledOut].filter(Boolean).length > 0 ? '1' : '0')}`} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5" role="group" aria-label="Alternative Cause Exclusions options">
                    {/* Hep Serology */}
                    <button
                      onClick={() => setExclusions({ ...exclusions, serologyNeg: !exclusions.serologyNeg, altCauseIdentified: false })}
                      role="checkbox"
                      aria-checked={exclusions.serologyNeg}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        exclusions.serologyNeg
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        exclusions.serologyNeg ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {exclusions.serologyNeg && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span>Serology Neg: Hep A, B, C, E</span>
                    </button>

                    {/* Ultrasound */}
                    <button
                      onClick={() => setExclusions({ ...exclusions, ultrasoundNeg: !exclusions.ultrasoundNeg, altCauseIdentified: false })}
                      role="checkbox"
                      aria-checked={exclusions.ultrapoundNeg}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        exclusions.ultrasoundNeg
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        exclusions.ultrasoundNeg ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {exclusions.ultrasoundNeg && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span>Imaging/US Neg: Biliary Obstruction</span>
                    </button>

                    {/* Other exclusions */}
                    <button
                      onClick={() => setExclusions({ ...exclusions, otherRuledOut: !exclusions.otherRuledOut, altCauseIdentified: false })}
                      role="checkbox"
                      aria-checked={exclusions.otherRuledOut}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        exclusions.otherRuledOut
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        exclusions.otherRuledOut ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {exclusions.otherRuledOut && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span>Other Neg: CMV, EBV, Autoimmune</span>
                    </button>

                    {/* Alternative Cause Identified */}
                    <button
                      onClick={() => setExclusions({
                        serologyNeg: false,
                        ultrasoundNeg: false,
                        otherRuledOut: false,
                        altCauseIdentified: !exclusions.altCauseIdentified
                      })}
                      role="checkbox"
                      aria-checked={exclusions.altCauseIdentified}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        exclusions.altCauseIdentified
                          ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        exclusions.altCauseIdentified ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {exclusions.altCauseIdentified && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span>Alternative Cause Highly Likely (-2 pts)</span>
                    </button>
                  </div>
                </div>

                {/* Domain 5: Enzyme Decline Course */}
                <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-200/40 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 m-0 uppercase tracking-wide">
                        Domain 5: Enzyme Decline Course after Stopping
                      </h4>
                      <p className="text-[10px] text-slate-500">Track transaminase or ALP clearance rates following herbal cessation.</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0 font-mono">
                      Weight: {enzymeDecline === 'decline_ge_50_8d' ? '+3' : (enzymeDecline === 'decline_ge_50_30d' ? '+2' : (enzymeDecline === 'decline_ge_50_after_30d' ? '+1' : '0'))} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5" role="group" aria-label="Enzyme Decline Course options">
                    {[
                      { id: 'decline_ge_50_8d', label: 'Fast Decline: >= 50% drop in ALT/ALP within 8 days (+3 pts)' },
                      { id: 'decline_ge_50_30d', label: 'Decline: >= 50% drop in ALT/ALP within 30 days (+2 pts)' },
                      { id: 'decline_ge_50_after_30d', label: 'Delayed Decline: >= 50% drop after 30 days (+1 pt)' },
                      { id: 'none', label: 'Minimal / No Decline, or usage continued (0 pts)' }
                    ].map(choice => (
                      <button
                        key={choice.id}
                        onClick={() => setEnzymeDecline(choice.id)}
                        aria-pressed={enzymeDecline === choice.id}
                        className={`text-left p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                          enzymeDecline === choice.id
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right side: Visual RUCAM summary & Diagnostic badges */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Score Display Card */}
              <div className="glass-panel p-5 space-y-5 sticky top-20">
                <div className="text-center border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none">RUCAM Causality Score</span>
                  <div className="mt-2.5 inline-flex items-baseline gap-1">
                    <span className="text-5xl font-black text-emerald-950 leading-none">{rucamScore}</span>
                    <span className="text-xs text-slate-400 font-bold">/ 14</span>
                  </div>
                </div>

                {/* Causality Badge Card */}
                <div className={`p-4 rounded-xl border text-center transition-all ${causalityBadge.pulse} ${causalityBadge.color}`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider block">Causality Grade</span>
                  <span className="text-base font-black uppercase mt-1 block">{causalityBadge.text}</span>
                </div>

                {/* Clinician Directives */}
                <div className="bg-slate-50/70 p-4 border border-slate-200/50 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    GRADE Outpost Directive:
                  </h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                    {causalityBadge.directive}
                  </p>
                </div>

                {/* Print button & Reset */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => window.print()}
                    className="py-2.5 bg-[hsl(var(--primary-green))] hover:bg-[hsl(var(--primary-green-light))] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Printer className="h-4 w-4" /> Print Report
                  </button>
                  <button
                    onClick={handleRucamReset}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset Audit
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
         TAB 3: A4 PRINT-OPTIMIZED DILI CAUSALITY REPORT
         ======================================================== */}
      <div className="hidden print:block w-full bg-white text-black p-6 space-y-6 text-xs border border-slate-300 rounded-xl font-sans">
        {/* Report Header */}
        <div className="text-center border-b-2 border-black pb-4">
          <h1 className="text-xl font-black text-black tracking-tight leading-none uppercase">Tropical Health Information System (THIS)</h1>
          <span className="text-[9px] uppercase font-bold tracking-wider block mt-1">Bedside Pharmacovigilance & DILI Causality Report</span>
          <div className="grid grid-cols-2 gap-4 mt-4 text-[10px] text-left">
            <div>
              <p><strong>Clinical Outpost:</strong> {selectedRegion.toUpperCase()} Regional Center</p>
              <p><strong>Date of Audit:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p><strong>Methodology:</strong> Clinical RUCAM Standard</p>
              <p><strong>Software Version:</strong> THIS PWA Offline v1.0</p>
            </div>
          </div>
        </div>

        {/* Section 1: Patient Lab profiles */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold border-b border-black pb-1 uppercase tracking-wide">1. Hepatic Laboratory Profile</h3>
          <div className="grid grid-cols-3 gap-4 text-[11px]">
            <div className="border border-slate-300 p-2 rounded">
              <span className="block font-bold">ALT (Alanine Aminotransferase)</span>
              <p className="mt-1">Patient ALT: {patientAlt || 'N/A'} U/L</p>
              <p>Normal Upper Limit (ULN): {altUln} U/L</p>
              <p>Elevation Factor: {altRatio > 0 ? `${altRatio.toFixed(2)}x ULN` : 'N/A'}</p>
            </div>
            <div className="border border-slate-300 p-2 rounded">
              <span className="block font-bold">ALP (Alkaline Phosphatase)</span>
              <p className="mt-1">Patient ALP: {patientAlp || 'N/A'} U/L</p>
              <p>Normal Upper Limit (ULN): {alpUln} U/L</p>
              <p>Elevation Factor: {alpRatio > 0 ? `${alpRatio.toFixed(2)}x ULN` : 'N/A'}</p>
            </div>
            <div className="border border-slate-300 p-2 rounded text-center flex flex-col justify-center bg-slate-50">
              <span className="block font-bold uppercase text-[9px]">Calculated R-Ratio</span>
              <span className="text-base font-black my-0.5">{rValue > 0 ? rValue.toFixed(2) : 'N/A'}</span>
              <span className="block font-bold text-[8px] uppercase">{activePattern || 'N/A'} Pattern</span>
            </div>
          </div>
        </div>

        {/* Section 2: Concomitant Exposures */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold border-b border-black pb-1 uppercase tracking-wide">2. Documented Herbal & Pharmaceutical Exposures</h3>
          {selectedConcomitantRemedies.length > 0 ? (
            <table className="w-full border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-1 text-left">Remedy Name</th>
                  <th className="border border-slate-300 p-1 text-left">Scientific Identity</th>
                  <th className="border border-slate-300 p-1 text-left">Hepatotoxicity Risk</th>
                  <th className="border border-slate-300 p-1 text-left">Active Toxins/Constituents</th>
                </tr>
              </thead>
              <tbody>
                {selectedConcomitantRemedies.map(id => {
                  const rem = database.remedies.find(r => r.id === id);
                  if (!rem) return null;
                  return (
                    <tr key={id}>
                      <td className="border border-slate-300 p-1.5 font-bold">{rem.name}</td>
                      <td className="border border-slate-300 p-1.5 italic">{rem.scientificName}</td>
                      <td className="border border-slate-300 p-1.5 uppercase font-bold">{rem.hepatotoxic ? '🚨 HIGH HAZARD' : 'Standard'}</td>
                      <td className="border border-slate-300 p-1.5">{rem.activeConstituents.join(', ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-[11px] italic text-slate-500">No concomitant remedies or botanicals registered during this assessment.</p>
          )}
        </div>

        {/* Section 3: RUCAM Score breakdown */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold border-b border-black pb-1 uppercase tracking-wide">3. RUCAM 5-Domain Causality Scorecard</h3>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border border-slate-300 p-1">RUCAM Domain Parameter</th>
                <th className="border border-slate-300 p-1">Audited Patient Profile Status</th>
                <th className="border border-slate-300 p-1 text-right">Points Weight</th>
              </tr>
            </thead>
            <tbody>
              {/* Domain 1 */}
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">Domain 1: Time to Onset</td>
                <td className="border border-slate-300 p-1.5">
                  {timeToOnset === 'onset_5_90' && 'Ingestion active: Symptom onset 5 to 90 days after starting'}
                  {timeToOnset === 'onset_less_5_more_90' && 'Ingestion active: Symptom onset < 5 days or > 90 days'}
                  {timeToOnset === 'stop_le_15' && 'Cessation onset: <= 15 days'}
                  {timeToOnset === 'stop_le_30' && 'Cessation onset: <= 30 days'}
                  {timeToOnset === 'none' && 'Unknown / unspecified onset timeline'}
                </td>
                <td className="border border-slate-300 p-1.5 text-right font-bold font-mono">
                  {timeToOnset === 'onset_5_90' ? '+2' : (timeToOnset === 'none' ? '0' : '+1')}
                </td>
              </tr>
              {/* Domain 2 */}
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">Domain 2: Risk Factors</td>
                <td className="border border-slate-300 p-1.5">
                  {[
                    riskFactors.age55 ? 'Age >= 55' : null,
                    riskFactors.alcohol ? 'Alcohol use history' : null,
                    riskFactors.pregnancy && (activePattern === 'mixed' || activePattern === 'cholestatic') ? 'Active Pregnancy' : null
                  ].filter(Boolean).join(', ') || 'No qualifying demographics'}
                </td>
                <td className="border border-slate-300 p-1.5 text-right font-bold font-mono">
                  +{[
                    riskFactors.age55,
                    riskFactors.alcohol,
                    riskFactors.pregnancy && (activePattern === 'mixed' || activePattern === 'cholestatic')
                  ].filter(Boolean).length}
                </td>
              </tr>
              {/* Domain 3 */}
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">Domain 3: Concomitant Exposures</td>
                <td className="border border-slate-300 p-1.5">
                  {concomitantTier === 'none' && 'No concomitant hepatotoxic substances'}
                  {concomitantTier === 'compatible' && 'Concomitant hepatotoxic substance present with compatible onset'}
                  {concomitantTier === 'highly_suspicious' && 'Highly suspected co-offender / active toxicity'}
                </td>
                <td className="border border-slate-300 p-1.5 text-right font-bold font-mono">
                  {concomitantTier === 'compatible' ? '+1' : (concomitantTier === 'highly_suspicious' ? '+2' : '0')}
                </td>
              </tr>
              {/* Domain 4 */}
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">Domain 4: Rule out of Alternative Causes</td>
                <td className="border border-slate-300 p-1.5">
                  {exclusions.altCauseIdentified ? (
                    <span className="text-red-700">Alternative cause highly likely</span>
                  ) : (
                    [
                      exclusions.serologyNeg ? 'Hepatitis serology negative' : null,
                      exclusions.ultrasoundNeg ? 'Biliary patency normal' : null,
                      exclusions.otherRuledOut ? 'Other secondary causes ruled out' : null
                    ].filter(Boolean).join(', ') || 'Alternative causes uninvestigated'
                  )}
                </td>
                <td className="border border-slate-300 p-1.5 text-right font-bold font-mono">
                  {exclusions.altCauseIdentified ? '-2' : `+${[exclusions.serologyNeg, exclusions.ultrasoundNeg, exclusions.otherRuledOut].filter(Boolean).length === 3 ? '2' : ([exclusions.serologyNeg, exclusions.ultrasoundNeg, exclusions.otherRuledOut].filter(Boolean).length > 0 ? '1' : '0')}`}
                </td>
              </tr>
              {/* Domain 5 */}
              <tr>
                <td className="border border-slate-300 p-1.5 font-bold">Domain 5: Enzyme Decline course</td>
                <td className="border border-slate-300 p-1.5">
                  {enzymeDecline === 'decline_ge_50_8d' && 'Fast Decline: >= 50% drop in ALT/ALP in 8 days'}
                  {enzymeDecline === 'decline_ge_50_30d' && 'Decline: >= 50% drop in ALT/ALP in 30 days'}
                  {enzymeDecline === 'decline_ge_50_after_30d' && 'Delayed Decline: >= 50% drop after 30 days'}
                  {enzymeDecline === 'none' && 'Minimal / No decline, or usage continued'}
                </td>
                <td className="border border-slate-300 p-1.5 text-right font-bold font-mono">
                  {enzymeDecline === 'decline_ge_50_8d' ? '+3' : (enzymeDecline === 'decline_ge_50_30d' ? '+2' : (enzymeDecline === 'decline_ge_50_after_30d' ? '+1' : '0'))}
                </td>
              </tr>
              {/* Total Row */}
              <tr className="bg-slate-100 font-bold">
                <td colSpan="2" className="border border-slate-300 p-1.5 text-right uppercase">Accumulated Causality Score</td>
                <td className="border border-slate-300 p-1.5 text-right font-mono font-black">{rucamScore} / 14</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Final diagnostic verdict */}
        <div className="border-2 border-black p-4 rounded bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase">RUCAM DIAGNOSTIC CAUSALITY VERDICT:</span>
            <span className="text-sm font-black uppercase underline">{causalityBadge.text} (Score {rucamScore})</span>
          </div>
          <div className="text-[11px] leading-relaxed pt-1.5">
            <strong>GRADE Outpost Clinical Directive:</strong>
            <p className="mt-1 font-semibold italic text-black">{causalityBadge.directive}</p>
          </div>
        </div>

        {/* Signature lines */}
        <div className="grid grid-cols-2 gap-12 pt-8 text-[10px]">
          <div className="border-t border-black pt-2">
            <span>Signature of Auditing Outpost Clinician</span>
            <p className="text-slate-400 mt-6 font-mono">MD / Clinical Officer Credentials</p>
          </div>
          <div className="border-t border-black pt-2 text-right">
            <span>Verified against local registry</span>
            <p className="text-slate-400 mt-6 font-mono">THIS Reference ID: THIS-DILI-{(Math.random()*100000).toFixed(0)}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
