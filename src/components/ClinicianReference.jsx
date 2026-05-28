import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ChevronLeft,
  User,
  Calendar,
  Sparkles,
  Heart,
  ShieldAlert,
  Trash2,
  Copy,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { database } from '../data/database';

export default function ClinicianReference() {
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'checker' | 'logs'
  const [selectedSymptomIds, setSelectedSymptomIds] = useState([]);
  
  // Guided Wizard States
  const [wizardStep, setWizardStep] = useState(1); // 1 to 6 (Step 6 is report screen)
  const [formData, setFormData] = useState({
    childName: '',
    ageMonths: 12,
    // Step 1: Danger Signs
    unableToDrink: false,
    vomitsEverything: false,
    convulsions: false,
    lethargicOrUnconscious: false,
    // Step 2: Cough/Respiration
    hasCough: false,
    breathsPerMinute: '',
    chestIndrawing: false,
    stridor: false,
    // Step 3: Diarrhea
    hasDiarrhea: false,
    diarrheaDays: '',
    bloodInStool: false,
    diarrheaDehydrationSigns: 'none', // 'lethargic', 'irritable', 'none'
    sunkenEyes: false,
    drinkingAbility: 'normal', // 'unable', 'thirsty', 'normal'
    skinPinch: 'immediate', // 'very-slow', 'slow', 'immediate'
    // Step 4: Fever
    hasFever: false,
    feverDays: '',
    highMalariaRisk: true,
    stiffNeck: false,
    measlesSigns: false,
    // Step 5: Nutrition & Anemia
    severeWasting: false,
    edemaFeet: false,
    muac: 'green', // 'red', 'yellow', 'green', 'unmeasured'
    palmarPallor: 'none', // 'severe', 'some', 'none'
  });

  const [savedRecords, setSavedRecords] = useState([]);
  const [showFhirPayload, setShowFhirPayload] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Load saved local triage logs on mount
  useEffect(() => {
    const records = localStorage.getItem('this_triage_records');
    if (records) {
      try {
        setSavedRecords(JSON.parse(records));
      } catch (e) {
        console.error("Failed to load local triage records:", e);
      }
    }
  }, []);

  // Update Symptom Checker list
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
      
      let totalMaxWeight = 0;
      let totalMatchWeight = 0;
      const matchedSymptoms = [];

      conditionSymptoms.forEach(s => {
        let sId = "";
        let isPrimary = false;
        
        if (typeof s === 'string') {
          sId = s;
          isPrimary = false;
        } else if (s && typeof s === 'object' && s.id) {
          sId = s.id;
          isPrimary = s.weight === 'primary';
        }

        if (!sId) return;

        const weightValue = isPrimary ? 3 : 1;
        totalMaxWeight += weightValue;

        if (selectedSymptomIds.includes(sId)) {
          totalMatchWeight += weightValue;
          matchedSymptoms.push(sId);
        }
      });

      const matchCount = matchedSymptoms.length;
      const matchPct = totalMaxWeight > 0 ? Math.round((totalMatchWeight / totalMaxWeight) * 100) : 0;

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

  // Dynamic WHO IMCI Triage Tree Logic
  const evaluateTriage = () => {
    const alerts = [];
    const age = Number(formData.ageMonths) || 12;
    const bpm = Number(formData.breathsPerMinute) || 0;
    
    // Fast Breathing Thresholds
    let isFastBreathing = false;
    if (age < 2 && bpm >= 60) isFastBreathing = true;
    else if (age >= 2 && age < 12 && bpm >= 50) isFastBreathing = true;
    else if (age >= 12 && age < 60 && bpm >= 40) isFastBreathing = true;

    // Danger Signs (RED ALERTS)
    const hasDangerSign = formData.unableToDrink || formData.vomitsEverything || formData.convulsions || formData.lethargicOrUnconscious;
    if (hasDangerSign) {
      alerts.push({
        category: 'red',
        name: 'GENERAL DANGER SIGN DETECTED',
        directive: 'Give Diazepam if convulsing now. Complete rapid clinical assessment. REFER URGENTLY to hospital.',
        actionLink: null
      });
    }

    // Respiration Branch
    if (formData.hasCough) {
      if (formData.chestIndrawing || formData.stridor || hasDangerSign) {
        alerts.push({
          category: 'red',
          name: 'SEVERE PNEUMONIA OR VERY SEVERE DISEASE',
          directive: 'Give first dose of appropriate IV/IM antibiotic (e.g. Benzylpenicillin). Give oxygen if available. Refer URGENTLY to hospital.',
          actionLink: null
        });
      } else if (isFastBreathing) {
        alerts.push({
          category: 'amber',
          name: 'PNEUMONIA (TREAT AT OUTPOST)',
          directive: 'Give oral Amoxicillin for 3-5 days. Soothe the throat and alleviate cough with safe traditional home remedies (e.g. warm honey water). Advise caregiver on returning immediately if symptoms worsen.',
          actionLink: '/dosage'
        });
      } else {
        alerts.push({
          category: 'green',
          name: 'COUGH OR COLD (SUPPORTIVE HOME CARE)',
          directive: 'No antibiotic needed. Soothe the throat and alleviate cough with warm home fluids. Advise caregiver to watch for chest indrawing or fast breathing.',
          actionLink: null
        });
      }
    }

    // Diarrhea Branch
    if (formData.hasDiarrhea) {
      let severePoints = 0;
      let somePoints = 0;
      
      if (formData.lethargicOrUnconscious || formData.diarrheaDehydrationSigns === 'lethargic') severePoints++;
      if (formData.diarrheaDehydrationSigns === 'irritable') somePoints++;
      
      if (formData.sunkenEyes) {
        severePoints++;
        somePoints++;
      }
      
      if (formData.drinkingAbility === 'unable') severePoints++;
      if (formData.drinkingAbility === 'thirsty') somePoints++;
      
      if (formData.skinPinch === 'very-slow') severePoints++;
      if (formData.skinPinch === 'slow') somePoints++;

      if (severePoints >= 2) {
        alerts.push({
          category: 'red',
          name: 'SEVERE DEHYDRATION (ORS PLAN C)',
          directive: 'Start IV fluids immediately. If child can drink, give ORS by mouth while setting up IV. Monitor hourly. If unable to administer IV, deploy NG tube or refer urgently.',
          actionLink: null
        });
      } else if (somePoints >= 2) {
        alerts.push({
          category: 'amber',
          name: 'SOME DEHYDRATION (ORS PLAN B)',
          directive: 'Administer WHO ORS Plan B rehydration therapy (approx 75ml per kg) over 4 hours at the outpost. Show caregiver how to prepare and feed ORS. Re-evaluate after 4 hours.',
          actionLink: null
        });
      } else {
        alerts.push({
          category: 'green',
          name: 'NO DEHYDRATION (ORS PLAN A)',
          directive: 'Treat at home using WHO ORS Plan A guidelines. Give extra fluids, feed the child, and administer Zinc daily supplements for 10-14 days. Teach danger signs.',
          actionLink: null
        });
      }

      // Persistent Diarrhea
      const duration = Number(formData.diarrheaDays) || 0;
      if (duration >= 14) {
        const isSeverePersist = severePoints >= 2 || somePoints >= 2;
        alerts.push({
          category: isSeverePersist ? 'red' : 'amber',
          name: isSeverePersist ? 'SEVERE PERSISTENT DIARRHEA' : 'PERSISTENT DIARRHEA',
          directive: isSeverePersist 
            ? 'Treat dehydration before referral. Refer URGENTLY to hospital.'
            : 'Soothe bowel. Give Vitamin A and Zinc daily. Feed special high-nutritive diet. Follow up in 5 days.',
          actionLink: null
        });
      }

      // Dysentery
      if (formData.bloodInStool) {
        alerts.push({
          category: 'amber',
          name: 'DYSENTERY (BLOOD IN STOOL)',
          directive: 'Give oral Ciprofloxacin (or local sensitive antibiotic) for 3 days. Follow up in 2 days. Monitor closely for toxic shock.',
          actionLink: '/dosage'
        });
      }
    }

    // Fever Branch
    if (formData.hasFever) {
      if (formData.stiffNeck || hasDangerSign) {
        alerts.push({
          category: 'red',
          name: 'VERY SEVERE FEBRILE DISEASE / SUSPECTED MENINGITIS',
          directive: 'Give first dose of Ampicillin and Gentamicin. Give paracetamol if fever is very high (>38.5°C). Refer URGENTLY to hospital.',
          actionLink: null
        });
      } else if (formData.highMalariaRisk) {
        alerts.push({
          category: 'amber',
          name: 'MALARIA (SUSPECTED OR RDT ACTIVE)',
          directive: 'Perform a malaria Rapid Diagnostic Test (RDT). If positive, treat with standard 6-dose oral ACT (Artemether-Lumefantrine) course based on weight bands. Support hydration.',
          actionLink: '/dosage'
        });
      } else {
        alerts.push({
          category: 'green',
          name: 'FEVER - LOW MALARIA RISK',
          directive: 'Treat fever with safe paracetamol. Advise caregiver on supportive cooling (tepid sponging). Instruct to return if fever persists >2 days.',
          actionLink: null
        });
      }

      if (formData.measlesSigns) {
        const hasMeaslesDanger = hasDangerSign || formData.stiffNeck || formData.sunkenEyes;
        alerts.push({
          category: hasMeaslesDanger ? 'red' : 'amber',
          name: hasMeaslesDanger ? 'SEVERE COMPLICATED MEASLES' : 'MEASLES',
          directive: hasMeaslesDanger
            ? 'Give first dose of Vitamin A. Give appropriate antibiotics if eye/lung complications exist. Refer URGENTLY.'
            : 'Give high-dose Vitamin A (Day 1 and Day 2). Treat eye discharges with Tetracycline ointment if present. Follow up in 2 days.',
          actionLink: null
        });
      }
    }

    // Malnutrition Branch
    const isSAM = formData.severeWasting || formData.edemaFeet || formData.muac === 'red';
    const isMAM = formData.muac === 'yellow' || formData.palmarPallor === 'some';
    const isSevereAnemia = formData.palmarPallor === 'severe';

    if (isSAM) {
      alerts.push({
        category: 'red',
        name: 'SEVERE ACUTE MALNUTRITION (SAM)',
        directive: 'Give Vitamin A immediately. If medical complications (e.g. vomiting, lethargy) or edema feet exist, refer URGENTLY to hospital. Otherwise, initiate outpatient therapeutic feeding (RUTF).',
        actionLink: null
      });
    } else if (isMAM) {
      alerts.push({
        category: 'amber',
        name: 'MODERATE ACUTE MALNUTRITION (MAM) / ANEMIA',
        directive: 'Initiate supplemental feeding. Check child deworming history (give Albendazole if eligible). Assess feeding practices and counsel caregiver. Follow up in 14 days.',
        actionLink: '/dosage'
      });
    } else if (isSevereAnemia) {
      alerts.push({
        category: 'red',
        name: 'SEVERE ANEMIA',
        directive: 'Child has severe palmar pallor. Refer URGENTLY to hospital for blood transfusion screening. Do not administer iron tablets until screen is complete.',
        actionLink: null
      });
    }

    // Fallback Nutritionally Adequate
    if (alerts.filter(a => ['SEVERE ACUTE MALNUTRITION (SAM)', 'MODERATE ACUTE MALNUTRITION (MAM) / ANEMIA', 'SEVERE ANEMIA'].includes(a.name)).length === 0) {
      alerts.push({
        category: 'green',
        name: 'NUTRITIONALLY ADEQUATE',
        directive: 'Child displays normal MUAC and no severe wasting or palmar pallor. Praise caregiver and encourage continuation of breastfeeding and balanced complementary feeding.',
        actionLink: null
      });
    }

    return {
      alerts,
      highestRisk: alerts.some(a => a.category === 'red') 
        ? 'red' 
        : alerts.some(a => a.category === 'amber') 
          ? 'amber' 
          : 'green'
    };
  };

  const triageOutput = evaluateTriage();

  // Save Completed Triage to local storage registry
  const handleSaveTriage = () => {
    const newRecord = {
      id: Date.now(),
      childName: formData.childName || 'Anonymous Child',
      ageMonths: formData.ageMonths,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      highestRisk: triageOutput.highestRisk,
      alerts: triageOutput.alerts,
      formData: { ...formData }
    };

    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    localStorage.setItem('this_triage_records', JSON.stringify(updated));
    
    // Jump to logs tab to view the registry
    setActiveTab('logs');
    setWizardStep(1);
    resetWizard();
  };

  // Reload a past saved record back into the wizard
  const handleLoadRecord = (record) => {
    setFormData({ ...record.formData });
    setWizardStep(6);
    setActiveTab('triage');
  };

  // Delete a saved record
  const handleDeleteRecord = (id) => {
    const updated = savedRecords.filter(r => r.id !== id);
    setSavedRecords(updated);
    localStorage.setItem('this_triage_records', JSON.stringify(updated));
  };

  const resetWizard = () => {
    setFormData({
      childName: '',
      ageMonths: 12,
      unableToDrink: false,
      vomitsEverything: false,
      convulsions: false,
      lethargicOrUnconscious: false,
      hasCough: false,
      breathsPerMinute: '',
      chestIndrawing: false,
      stridor: false,
      hasDiarrhea: false,
      diarrheaDays: '',
      bloodInStool: false,
      diarrheaDehydrationSigns: 'none',
      sunkenEyes: false,
      drinkingAbility: 'normal',
      skinPinch: 'immediate',
      hasFever: false,
      feverDays: '',
      highMalariaRisk: true,
      stiffNeck: false,
      measlesSigns: false,
      severeWasting: false,
      edemaFeet: false,
      muac: 'green',
      palmarPallor: 'none',
    });
    setWizardStep(1);
    setShowFhirPayload(false);
  };

  // Compile HL7 FHIR DiagnosticReport payload
  const compileFHIR = () => {
    const dateStr = new Date().toISOString();
    const payload = {
      resourceType: "DiagnosticReport",
      id: `this-imci-${Math.random().toString(36).substring(2, 9)}`,
      status: "final",
      category: [{
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/v2-0074",
          code: "GE",
          display: "General Practice"
        }]
      }],
      code: {
        coding: [{
          system: "http://loinc.org",
          code: "82582-8",
          display: "Integrated Management of Childhood Illness (IMCI) report"
        }]
      },
      subject: {
        reference: `Patient/${formData.childName.replace(/\s+/g, '-').toLowerCase() || 'anonymous-child'}`,
        display: `${formData.childName || "Anonymous Child"} (${formData.ageMonths} months)`
      },
      effectiveDateTime: dateStr,
      issued: dateStr,
      conclusion: triageOutput.alerts.map(a => `[${a.category.toUpperCase()}] ${a.name}: ${a.directive}`).join("\n"),
      result: triageOutput.alerts.map(a => ({
        resourceType: "Observation",
        status: "final",
        code: {
          coding: [{
            system: "http://loinc.org",
            display: a.name
          }]
        },
        valueString: a.directive
      }))
    };
    return JSON.stringify(payload, null, 2);
  };

  const handleCopyFhir = () => {
    navigator.clipboard.writeText(compileFHIR());
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in space-y-6 clinician-mode">
      {/* Clinician Title Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-700 bg-emerald-950/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
            <Stethoscope className="h-5.5 w-5.5 text-emerald-800 shrink-0" />
            Rural Clinician Triage Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Institutional decision-support helper for low-resource posts. Walk through guided IMCI diagnostic workflows, calculate dynamic triage risks, and log records offline.
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all flex-1 sm:flex-initial justify-center cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Sheets
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200/60 pb-1 gap-2 no-print">
        {[
          { id: 'triage', label: 'Guided IMCI Triage Wizard', icon: Sparkles },
          { id: 'checker', label: 'Symptom Differential Checker', icon: CheckSquare },
          { id: 'logs', label: `Saved Outpost Logs (${savedRecords.length})`, icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'text-[hsl(var(--primary-green))] border-b-2 border-b-emerald-850 font-extrabold'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================
          TAB 1: GUIDED IMCI TRIAGE WIZARD
          ======================================================== */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Wizard Form Card (Left - 8 columns) */}
          <div className="lg:col-span-8 glass-panel p-6 bg-white border border-slate-200 shadow-md space-y-6">
            
            {/* Child Identifier Form on Step 1-5 */}
            {wizardStep <= 5 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Child Patient Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="e.g. Stephen Ajulu"
                      value={formData.childName}
                      onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Child Age (Months)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="number"
                      min="1"
                      max="60"
                      value={formData.ageMonths}
                      onChange={(e) => setFormData(prev => ({ ...prev, ageMonths: Math.max(1, Number(e.target.value)) }))}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step Wizard Header Progress Bar */}
            <div className="no-print">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                <span>IMCI Assessment Steps</span>
                <span className="text-emerald-700">Step {wizardStep} of 6</span>
              </div>
              <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden flex">
                {[1, 2, 3, 4, 5, 6].map(st => (
                  <div 
                    key={st}
                    className={`h-full flex-1 border-r border-white/40 last:border-0 transition-all ${
                      st <= wizardStep ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ========================================================
                STEP 1: GENERAL DANGER SIGNS
                ======================================================== */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-scale-up">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2.5 py-0.5 rounded border border-rose-250 inline-block mb-1">Step 1</span>
                  <h3 className="text-lg font-black text-slate-800">Assess for General Danger Signs</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Check immediately for key vital compromises. The presence of ANY general danger sign requires urgent outpatient stabilization and emergency hospital referral.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: 'unableToDrink', title: 'Unable to Drink or Breastfeed', desc: 'Child is too weak or refuses to suck/swallow fluid' },
                    { id: 'vomitsEverything', title: 'Vomits Absolutely Everything', desc: 'Cannot retain any fluids or therapeutic solids' },
                    { id: 'convulsions', title: 'Convulsions During This Illness', desc: 'Experienced fits or fits active now at bedside' },
                    { id: 'lethargicOrUnconscious', title: 'Lethargic or Unconscious', desc: 'Unusually sleepy, floppy, or completely unresponsive' }
                  ].map(item => (
                    <label 
                      key={item.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData[item.id] 
                          ? 'bg-rose-50/50 border-rose-300 text-rose-950 shadow-sm' 
                          : 'bg-slate-50 border-slate-150 hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={formData[item.id]}
                        onChange={(e) => setFormData(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        className="rounded border-slate-350 text-rose-600 focus:ring-rose-500 h-5 w-5 mt-0.5 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-black block">{item.title}</span>
                        <span className="text-[10px] opacity-75 font-medium leading-normal block">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 2: COUGH OR DIFFICULT BREATHING
                ======================================================== */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-scale-up">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-250 inline-block mb-1">Step 2</span>
                  <h3 className="text-lg font-black text-slate-800">Cough or Difficult Breathing</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Evaluate respiratory rate and airway obstruction indicators. Fast breathing is calculated dynamically based on age brackets.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Master Branch Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-150">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-800 block">Does the child have cough or difficult breathing?</span>
                      <span className="text-[10px] text-slate-400 font-medium">Toggle off if respiratory symptoms are absent</span>
                    </div>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, hasCough: !prev.hasCough }))}
                      className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                        formData.hasCough 
                          ? 'bg-emerald-700 text-white shadow' 
                          : 'bg-white border border-slate-200 text-slate-500'
                      }`}
                    >
                      {formData.hasCough ? "Yes" : "No"}
                    </button>
                  </div>

                  {formData.hasCough && (
                    <div className="space-y-4 p-4 border border-emerald-100 bg-emerald-50/10 rounded-xl animate-fade-in">
                      {/* Respiratory Count Input */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Breaths Per Minute (BPM)</label>
                          <span className="text-[9px] text-slate-400 leading-normal block">Count for 1 full minute when child is calm</span>
                          <input 
                            type="number"
                            placeholder="e.g. 42"
                            value={formData.breathsPerMinute}
                            onChange={(e) => setFormData(prev => ({ ...prev, breathsPerMinute: e.target.value }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        {/* Age reference fast breathing indicator */}
                        <div className="p-3 bg-white rounded-lg border border-slate-200/50 text-[10px] leading-relaxed text-slate-650 space-y-1">
                          <span className="font-extrabold text-emerald-800 uppercase block">💡 WHO Fast Breathing Guides</span>
                          <span className="block font-medium">• Under 2 Months: <strong>&gt;= 60 BPM</strong></span>
                          <span className="block font-medium">• 2 to 11 Months: <strong>&gt;= 50 BPM</strong></span>
                          <span className="block font-medium">• 12 to 59 Months: <strong>&gt;= 40 BPM</strong></span>
                        </div>
                      </div>

                      {/* Chest Indrawing & Stridor check */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {[
                          { id: 'chestIndrawing', title: 'Chest Indrawing Present', desc: 'Lower chest wall goes IN when child breathes IN' },
                          { id: 'stridor', title: 'Stridor in Calm Child', desc: 'Harsh high-pitched breathing sound during inspiration' }
                        ].map(item => (
                          <label 
                            key={item.id}
                            className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                              formData[item.id] 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-sm' 
                                : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={formData[item.id]}
                              onChange={(e) => setFormData(prev => ({ ...prev, [item.id]: e.target.checked }))}
                              className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-black block">{item.title}</span>
                              <span className="text-[9px] opacity-75 font-medium leading-normal block">{item.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 3: DIARRHEA OR LOOSE STOOLS
                ======================================================== */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-scale-up">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-250 inline-block mb-1">Step 3</span>
                  <h3 className="text-lg font-black text-slate-800">Diarrhea or Loose Stools</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Evaluate hydration levels and potential persistent bowel complications. Standard skin turgor and drinking behaviors calculate ORS Plan pathways.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-150">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-800 block">Does the child have diarrhea?</span>
                      <span className="text-[10px] text-slate-400 font-medium">Toggle off if stool frequency is normal</span>
                    </div>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, hasDiarrhea: !prev.hasDiarrhea }))}
                      className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                        formData.hasDiarrhea 
                          ? 'bg-emerald-700 text-white shadow' 
                          : 'bg-white border border-slate-200 text-slate-500'
                      }`}
                    >
                      {formData.hasDiarrhea ? "Yes" : "No"}
                    </button>
                  </div>

                  {formData.hasDiarrhea && (
                    <div className="space-y-4 p-4 border border-emerald-100 bg-emerald-50/10 rounded-xl animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Duration */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Duration of Diarrhea (Days)</label>
                          <input 
                            type="number"
                            placeholder="e.g. 3"
                            value={formData.diarrheaDays}
                            onChange={(e) => setFormData(prev => ({ ...prev, diarrheaDays: e.target.value }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        {/* Dysentery check */}
                        <label className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-200 bg-rose-50/20 cursor-pointer self-end transition-all">
                          <input 
                            type="checkbox"
                            checked={formData.bloodInStool}
                            onChange={(e) => setFormData(prev => ({ ...prev, bloodInStool: e.target.checked }))}
                            className="rounded border-rose-350 text-rose-600 focus:ring-rose-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-rose-950 block">Blood in Stool (Dysentery)</span>
                            <span className="text-[9px] text-rose-800 opacity-75 font-medium leading-normal block">Overt blood observed in feces</span>
                          </div>
                        </label>
                      </div>

                      {/* Dehydration Signs */}
                      <div className="space-y-3 pt-2 border-t border-slate-200/40">
                        <span className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block">Assess Hydration Metrics:</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                          {/* Sunken Eyes */}
                          <label className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-slate-200/50 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={formData.sunkenEyes}
                              onChange={(e) => setFormData(prev => ({ ...prev, sunkenEyes: e.target.checked }))}
                              className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <span className="block">Sunken Eyes</span>
                              <span className="text-[9px] text-slate-400 font-medium block">Eyes look hollow or visibly sunken in sockets</span>
                            </div>
                          </label>

                          {/* Dehydration Behavior Dropdown */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Behavior / Alertness State</label>
                            <select 
                              value={formData.diarrheaDehydrationSigns}
                              onChange={(e) => setFormData(prev => ({ ...prev, diarrheaDehydrationSigns: e.target.value }))}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            >
                              <option value="none">Normal, active behavior</option>
                              <option value="irritable">Restless or Irritable</option>
                              <option value="lethargic">Lethargic or Unconscious</option>
                            </select>
                          </div>

                          {/* Drinking Ability */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Drinking Fluid Ability</label>
                            <select 
                              value={formData.drinkingAbility}
                              onChange={(e) => setFormData(prev => ({ ...prev, drinkingAbility: e.target.value }))}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            >
                              <option value="normal">Normal drinking, not thirsty</option>
                              <option value="thirsty">Drinks eagerly, Thirsty</option>
                              <option value="unable">Not able to drink or drinks poorly</option>
                            </select>
                          </div>

                          {/* Skin Pinch Test */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Skin Pinch Test (Abdomen)</label>
                            <select 
                              value={formData.skinPinch}
                              onChange={(e) => setFormData(prev => ({ ...prev, skinPinch: e.target.value }))}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            >
                              <option value="immediate">Goes back immediately</option>
                              <option value="slow">Goes back slowly</option>
                              <option value="very-slow">Goes back very slowly (&gt; 2 seconds)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 4: FEVER & VECTORS
                ======================================================== */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-scale-up">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-250 inline-block mb-1">Step 4</span>
                  <h3 className="text-lg font-black text-slate-800">Fever & Vector Risk</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Evaluate febrile symptoms, local endemic vectors, and critical bacterial meningitis signs (neck stiffness).
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-150">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-800 block">Does the child have fever (Temp &gt;= 37.5°C or hot)?</span>
                      <span className="text-[10px] text-slate-400 font-medium">Toggle off if skin is cool and temperature is normal</span>
                    </div>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, hasFever: !prev.hasFever }))}
                      className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                        formData.hasFever 
                          ? 'bg-emerald-700 text-white shadow' 
                          : 'bg-white border border-slate-200 text-slate-500'
                      }`}
                    >
                      {formData.hasFever ? "Yes" : "No"}
                    </button>
                  </div>

                  {formData.hasFever && (
                    <div className="space-y-4 p-4 border border-emerald-100 bg-emerald-50/10 rounded-xl animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Duration */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Duration of Fever (Days)</label>
                          <input 
                            type="number"
                            placeholder="e.g. 2"
                            value={formData.feverDays}
                            onChange={(e) => setFormData(prev => ({ ...prev, feverDays: e.target.value }))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        {/* Endemic Malaria Risk */}
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200/50 self-end">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800 block">High Malaria Risk Area?</span>
                            <span className="text-[9px] text-slate-400"> endemically high mosquito zone</span>
                          </div>
                          <button 
                            onClick={() => setFormData(prev => ({ ...prev, highMalariaRisk: !prev.highMalariaRisk }))}
                            className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${
                              formData.highMalariaRisk 
                                ? 'bg-amber-600 text-white shadow-sm' 
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {formData.highMalariaRisk ? "Active" : "Low Risk"}
                          </button>
                        </div>
                      </div>

                      {/* Meningitis and Measles signs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/40">
                        {/* Stiff Neck */}
                        <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.stiffNeck 
                            ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-sm' 
                            : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}>
                          <input 
                            type="checkbox"
                            checked={formData.stiffNeck}
                            onChange={(e) => setFormData(prev => ({ ...prev, stiffNeck: e.target.checked }))}
                            className="rounded border-slate-350 text-rose-600 focus:ring-rose-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-black block text-rose-800 flex items-center gap-1">
                              <ShieldAlert className="h-4 w-4" /> Stiff Neck (Meningitis)
                            </span>
                            <span className="text-[9px] opacity-75 font-medium leading-normal block">Nuchal rigidity, head cannot touch chest</span>
                          </div>
                        </label>

                        {/* Measles Signs */}
                        <label className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.measlesSigns 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-sm' 
                            : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}>
                          <input 
                            type="checkbox"
                            checked={formData.measlesSigns}
                            onChange={(e) => setFormData(prev => ({ ...prev, measlesSigns: e.target.checked }))}
                            className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-black block">Active Measles Signs</span>
                            <span className="text-[9px] opacity-75 font-medium leading-normal block">Generalized rash, runny nose, cough, or red eyes</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 5: NUTRITION AND ANEMIA
                ======================================================== */}
            {wizardStep === 5 && (
              <div className="space-y-4 animate-scale-up">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-250 inline-block mb-1">Step 5</span>
                  <h3 className="text-lg font-black text-slate-800">Nutritional Status & Anemia</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Screen for wasting, bilateral edema, arm circumference limits (MUAC), and palmar pallor to diagnose SAM, MAM, or anemia.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Wasting & Edema Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'severeWasting', title: 'Visible Severe Wasting', desc: 'Severe muscle wasting, skin-and-bone appearance' },
                      { id: 'edemaFeet', title: 'Edema of Both Feet', desc: 'Bilateral pitting edema indicating potential Kwashiorkor' }
                    ].map(item => (
                      <label 
                        key={item.id}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData[item.id] 
                            ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-sm' 
                            : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={formData[item.id]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          className="rounded border-slate-350 text-rose-600 focus:ring-rose-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-black block text-rose-800">{item.title}</span>
                          <span className="text-[9px] opacity-75 font-medium leading-normal block">{item.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/40">
                    {/* MUAC select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">MUAC (Mid-Upper Arm Circumference)</label>
                      <select 
                        value={formData.muac}
                        onChange={(e) => setFormData(prev => ({ ...prev, muac: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="green">Green: &gt; 12.5 cm (Nutritionally Adequate)</option>
                        <option value="yellow">Yellow: 11.5 to 12.5 cm (Moderate Malnutrition)</option>
                        <option value="red">Red: &lt; 11.5 cm (Severe Acute Malnutrition)</option>
                        <option value="unmeasured">Not Measured</option>
                      </select>
                    </div>

                    {/* Palmar Pallor select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Palmar Pallor Check (Anemia)</label>
                      <select 
                        value={formData.palmarPallor}
                        onChange={(e) => setFormData(prev => ({ ...prev, palmarPallor: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="none">No Palmar Pallor (Healthy pink skin)</option>
                        <option value="some">Some Palmar Pallor (Pale palm colorations)</option>
                        <option value="severe">Severe Palmar Pallor (Visibly chalk-white skin)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                STEP 6: FINAL COMPILATION & DIAGNOSTIC REPORT
                ======================================================== */}
            {wizardStep === 6 && (
              <div className="space-y-6 animate-scale-up">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-250 inline-block mb-1">Step 6</span>
                    <h3 className="text-xl font-extrabold text-slate-800 font-outfit">IMCI Bedside Triage Report</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Child: <strong>{formData.childName || "Anonymous Child"}</strong> | Age: <strong>{formData.ageMonths} Months</strong>
                    </p>
                  </div>
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                    triageOutput.highestRisk === 'red'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                      : triageOutput.highestRisk === 'amber'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  }`}>
                    {triageOutput.highestRisk.toUpperCase()} STATUS
                  </span>
                </div>

                {/* Compilation Alerts List */}
                <div className="space-y-4">
                  {triageOutput.alerts.map((alert, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start gap-4 transition-all ${
                        alert.category === 'red' 
                          ? 'bg-rose-50/50 border-rose-200 text-rose-950' 
                          : alert.category === 'amber'
                            ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                            : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="space-y-2">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${
                          alert.category === 'red'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : alert.category === 'amber'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {alert.category.toUpperCase()} ALERT
                        </span>
                        <h4 className="font-extrabold text-sm font-outfit">{alert.name}</h4>
                        <p className="text-xs leading-relaxed font-bold opacity-90">{alert.directive}</p>
                      </div>

                      {/* Dynamic Action Prescription links */}
                      {alert.actionLink && (
                        <a 
                          href={alert.actionLink}
                          className="no-print mt-2 sm:mt-0 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                        >
                          <Clock className="h-3.5 w-3.5 text-emerald-800" /> Prescribe Dosage
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* FHIR Export Trigger & Viewer */}
                <div className="border-t border-slate-100 pt-4 space-y-3 no-print">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Interoperability Payload (HL7 FHIR)</span>
                    <button
                      onClick={() => setShowFhirPayload(!showFhirPayload)}
                      className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer transition-all flex items-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" /> {showFhirPayload ? "Hide FHIR JSON" : "Show FHIR JSON"}
                    </button>
                  </div>

                  {showFhirPayload && (
                    <div className="relative animate-scale-up border border-slate-200 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                      <button 
                        onClick={handleCopyFhir}
                        className="absolute right-3 top-3 p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy FHIR payload to clipboard"
                      >
                        {copiedSuccess ? (
                          <span className="text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1 px-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Copied!
                          </span>
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <pre className="text-[10px] text-emerald-400 p-4 font-mono overflow-x-auto select-all max-h-60 leading-normal">
                        {compileFHIR()}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Save Triage Report Actions */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-end gap-3 no-print">
                  <button 
                    onClick={resetWizard}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Reset & start Over
                  </button>
                  <button 
                    onClick={handleSaveTriage}
                    className="px-5 py-2.5 bg-emerald-850 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Save & Log Offline Record
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons for Step 1-5 */}
            {wizardStep <= 5 && (
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center no-print">
                <button
                  onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                  disabled={wizardStep === 1}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    wizardStep === 1 
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                
                <button
                  onClick={() => {
                    // Logic to skip unneeded branches
                    if (wizardStep === 2 && !formData.hasCough) {
                      setWizardStep(3);
                    } else if (wizardStep === 3 && !formData.hasDiarrhea) {
                      setWizardStep(4);
                    } else if (wizardStep === 4 && !formData.hasFever) {
                      setWizardStep(5);
                    } else {
                      setWizardStep(prev => Math.min(6, prev + 1));
                    }
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

          </div>

          {/* Guidelines Sidebar (Right - 4 columns) */}
          <div className="lg:col-span-4 space-y-4 no-print">
            <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl shadow border border-emerald-900 space-y-3">
              <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-4 w-4" /> IMCI Outpost Triage Protocols
              </h4>
              <p className="text-[10px] leading-relaxed opacity-95">
                The **Integrated Management of Childhood Illness (IMCI)** is a systematic clinical strategy developed by WHO and UNICEF to diagnose the primary causes of child morbidity (pneumonia, diarrhea, malaria, and SAM) at local bedside hubs.
              </p>
              <div className="border-t border-emerald-900 pt-2 text-[9px] text-emerald-300 font-bold space-y-1.5">
                <span className="block">• Answer clinical questions sequentially.</span>
                <span className="block">• Unneeded steps will automatically skip based on toggles.</span>
                <span className="block">• Diagnostic recommendations, safety caveats, and FHIR payloads generate dynamically at the end.</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 text-amber-950 rounded-2xl shadow border border-amber-200 space-y-2">
              <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Triage Notice
              </h4>
              <p className="text-[10px] leading-relaxed opacity-90">
                Guided decision trees are primary tools to support outpost diagnostics. They do not replace standard clinical judgment. Always refer immediately if a child displays high-grade danger flags.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: SYMPTOM DIFFERENTIAL CHECKER (ORIGINAL FLOW)
          ======================================================== */}
      {activeTab === 'checker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Symptom Checklist Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel p-5 space-y-4 bg-white shadow-sm border border-slate-100">
              <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <CheckSquare className="h-4.5 w-4.5 text-emerald-750" />
                Symptom Triage Check
              </h3>
              
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
                        className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 shrink-0"
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

              {/* Diagnostic Differential results */}
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

          {/* Rehydration card */}
          <div className="lg:col-span-6 space-y-4">
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
      )}

      {/* ========================================================
          TAB 3: SAVED OUTPOST LOGS REGISTRY
          ======================================================== */}
      {activeTab === 'logs' && (
        <div className="glass-panel p-6 bg-white border border-slate-200 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-800">Saved Child Triage Registry</h3>
              <p className="text-xs text-slate-500">
                Offline clinical record repository saved locally in browser space. Clear logs before sharing the tablet, or copy FHIR data for medical audits.
              </p>
            </div>
            
            {savedRecords.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete all saved logs? This cannot be undone.")) {
                    setSavedRecords([]);
                    localStorage.removeItem('this_triage_records');
                  }
                }}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 animate-pulse" /> Wipe Outpost Logs
              </button>
            )}
          </div>

          {savedRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedRecords.map(record => (
                <div 
                  key={record.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    record.highestRisk === 'red'
                      ? 'bg-rose-50/20 border-rose-200 text-rose-950'
                      : record.highestRisk === 'amber'
                        ? 'bg-amber-50/20 border-amber-200 text-amber-950'
                        : 'bg-emerald-50/20 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 font-outfit">{record.childName}</h4>
                        <span className="text-[10px] text-slate-400 italic block mt-0.5">
                          Age: {record.ageMonths} months | Registered: {record.date}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${
                        record.highestRisk === 'red'
                          ? 'bg-rose-100 text-rose-800 border-rose-350 shadow-sm'
                          : record.highestRisk === 'amber'
                            ? 'bg-amber-100 text-amber-800 border-amber-350 shadow-sm'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-350 shadow-sm'
                      }`}>
                        {record.highestRisk.toUpperCase()} STATUS
                      </span>
                    </div>

                    <div className="space-y-1 pt-1.5 border-t border-slate-200/40">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Diagnostic Outcomes:</span>
                      <ul className="space-y-1">
                        {record.alerts.map((a, i) => (
                          <li key={i} className="text-[10px] flex items-start gap-1 leading-normal font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0 mt-1.5" />
                            <span>{a.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-200/40">
                    <button
                      onClick={() => handleLoadRecord(record)}
                      className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <ArrowRight className="h-3 w-3 text-emerald-800" /> Reload Wizard
                    </button>
                    
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="px-3 py-1 hover:bg-rose-50 text-rose-700 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FileText className="h-10 w-10 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs italic">
                No offline triage records registered yet. Fill out the Guided IMCI Triage Wizard and save reports to create logs.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          CLIMATE VECTOR GUIDELINE ROW (SHARED FOOTER no-print)
          ======================================================== */}
      <div className="glass-panel p-5 space-y-4 bg-white shadow-sm border border-slate-100 no-print">
        <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2 font-outfit">
          <CloudRain className="h-4.5 w-4.5 text-emerald-750" />
          Climate Vector Threat Triage Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <CloudRain className="h-4 w-4 text-sky-500 shrink-0" />
              Heavy Monsoon Seasons
            </div>
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              Creates standing water pools. High breeding potential for <strong>Anopheles mosquito larvae (Malaria)</strong>. Proactive mosquito net distribution is critical.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <Thermometer className="h-4 w-4 text-amber-500 shrink-0" />
              High Humidity Heatwaves
            </div>
            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              High dehydration risk. Accelerates biting frequency and replication for <strong>Aedes mosquitoes (Dengue)</strong>. Standardize hydration campaigns at field outposts.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <Plus className="h-4 w-4 text-emerald-600 shrink-0" />
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

