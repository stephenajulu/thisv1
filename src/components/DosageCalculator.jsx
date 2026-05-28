import React, { useState, useEffect } from 'react';
import { database } from '../data/database';
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  Scale, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Info, 
  Droplets, 
  Baby, 
  RefreshCw, 
  AlertOctagon, 
  HelpCircle,
  Timer,
  Utensils,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

export default function DosageCalculator() {
  const [weight, setWeight] = useState(15);
  const [ageMonths, setAgeMonths] = useState(24);
  const [selectedDrug, setSelectedDrug] = useState('act');
  
  // ORS State variables
  const [orsPlan, setOrsPlan] = useState('planB'); // 'planA', 'planB', 'planC'
  const [orsMode, setOrsMode] = useState('weight'); // 'weight', 'ageBand'
  const [orsPlanBProgress, setOrsPlanBProgress] = useState({
    hour1: false,
    hour2: false,
    hour3: false,
    hour4: false,
  });

  // ACT State variables
  const [actStartTime, setActStartTime] = useState('08:00');
  const [actStartDay, setActStartDay] = useState('today'); // 'today', 'tomorrow'
  const [actDosesTaken, setActDosesTaken] = useState({
    dose1: false,
    dose2: false,
    dose3: false,
    dose4: false,
    dose5: false,
    dose6: false,
  });

  // Reset checkboxes when parameters or selections change
  useEffect(() => {
    setOrsPlanBProgress({
      hour1: false,
      hour2: false,
      hour3: false,
      hour4: false,
    });
    setActDosesTaken({
      dose1: false,
      dose2: false,
      dose3: false,
      dose4: false,
      dose5: false,
      dose6: false,
    });
  }, [weight, ageMonths, selectedDrug, orsPlan, actStartTime, actStartDay]);

  // Dynamic age string converter
  const getAgeString = (months) => {
    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    const yrs = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${yrs} yr${yrs > 1 ? 's' : ''}`;
    }
    return `${yrs} yr${yrs > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
  };

  // ACT Dosing Schedule generator based on initial time inputs
  const calculateACTDoses = (startTimeStr, startDay) => {
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const baseDate = new Date();
    baseDate.setHours(hours, minutes, 0, 0);
    
    if (startDay === 'tomorrow') {
      baseDate.setDate(baseDate.getDate() + 1);
    }

    const offsets = [0, 8, 24, 36, 48, 60];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return offsets.map((offset, idx) => {
      const d = new Date(baseDate.getTime() + offset * 60 * 60 * 1000);
      const dayName = daysOfWeek[d.getDay()];
      const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      
      let dayLabel = "Day 1";
      if (offset >= 48) dayLabel = "Day 3";
      else if (offset >= 24) dayLabel = "Day 2";

      return {
        doseNum: idx + 1,
        offsetHours: offset,
        dayLabel,
        dayName,
        timeString: timeFormatted,
        dateObj: d
      };
    });
  };

  const actDoses = calculateACTDoses(actStartTime, actStartDay);

  // WHO Age bands list for ORS
  const orsAgeBands = [
    { minMo: 0, maxMo: 3.99, rangeStr: "Under 4 months", volRange: "200 - 400 ml" },
    { minMo: 4, maxMo: 11.99, rangeStr: "4 to 11 months", volRange: "400 - 600 ml" },
    { minMo: 12, maxMo: 23.99, rangeStr: "12 to 23 months", volRange: "600 - 800 ml" },
    { minMo: 24, maxMo: 59.99, rangeStr: "2 to 4 years", volRange: "800 - 1200 ml" },
    { minMo: 60, maxMo: 179.99, rangeStr: "5 to 14 years", volRange: "1200 - 2200 ml" },
    { minMo: 180, maxMo: 9999.99, rangeStr: "15 years and above", volRange: "2200 - 4000 ml" }
  ];

  // Helper to determine active age band index based on selected age slider
  const getActiveOrsBandIndex = () => {
    return orsAgeBands.findIndex(band => ageMonths >= band.minMo && ageMonths <= band.maxMo);
  };

  const activeOrsBandIdx = getActiveOrsBandIndex();

  const calculateDosage = () => {
    const actRem = database.remedies.find(r => r.id === 'artemether-lumefantrine');
    const orsRem = database.remedies.find(r => r.id === 'oral-rehydration-salts');
    const albRem = database.remedies.find(r => r.id === 'albendazole');
    const zincRem = database.remedies.find(r => r.id === 'zinc-sulfate');

    switch (selectedDrug) {
      case 'ors':
        const orsVolume = weight * 75;
        if (orsPlan === 'planA') {
          let advice = "Infants (< 2 years): 50 to 100 ml after each loose stool. Children (2-9 years): 100 to 200 ml after each loose stool. Teens & Adults: Up to 400 ml after each loose stool.";
          return {
            title: "WHO Plan A: Home Hydration & Prevention",
            dosage: advice,
            clinicalNotes: `Patient exhibits NO signs of dehydration. Focus is preventing onset. Administer 10-20mg Zinc Sulfate adjuvant daily for 10-14 days. Advise caregivers on the 4 pillars of home management: extra fluids, continue breastfeeding, Zinc supplements, and monitoring for danger signs. ${orsRem?.safetyAlert || ''}`
          };
        } else if (orsPlan === 'planB') {
          return {
            title: "WHO Plan B: Oral Rehydration for Some Dehydration",
            dosage: `${orsVolume} ml of Low-Osmolarity ORS solution over 4 hours`,
            clinicalNotes: `Calculated for patient weight: ${weight} kg. Caregiver must administer this volume slowly in small sips using a cup and clean spoon. If child vomits, pause for 10 minutes, then resume ORS administration at a slower rate. Re-assess patient's hydration status after exactly 4 hours. ${orsRem?.safetyAlert || ''}`
          };
        } else {
          // Plan C
          return {
            title: "WHO Plan C: Urgent IV Therapy for Severe Dehydration",
            dosage: `100 ml/kg Ringer's Lactate (or Normal Saline if unavailable) split into multiple infusions.`,
            clinicalNotes: `EMERGENCY ALERT: Intravenous access required immediately. WHO Guideline: For infants under 12 months, give 30ml/kg over 1 hour, then 70ml/kg over 5 hours (Total 6 hours). For children 1 year and older, give 30ml/kg over 30 minutes, then 70ml/kg over 2.5 hours (Total 3 hours). ${orsRem?.safetyAlert || ''}`
          };
        }

      case 'act':
        // Artemether-Lumefantrine weight-based pediatric tablet dosing (3-day course, 6 doses total)
        let actTablets = 1;
        let band = "5 to <15 kg";
        let isContraindicated = false;

        if (weight < 5) {
          isContraindicated = true;
          actTablets = 0;
          band = "Under 5 kg (Contraindicated)";
        } else if (weight >= 35) {
          actTablets = 4;
          band = "35 kg and above (Adult Dose)";
        } else if (weight >= 25) {
          actTablets = 3;
          band = "25 to <35 kg";
        } else if (weight >= 15) {
          actTablets = 2;
          band = "15 to <25 kg";
        }

        return {
          title: "Artemether-Lumefantrine Antimalarial (ACT Combination)",
          dosage: isContraindicated 
            ? "Contraindicated (Weight < 5 kg)" 
            : `${actTablets} tablet(s) per dose (Artemether 20mg / Lumefantrine 120mg)`,
          band,
          isContraindicated,
          totalTablets: actTablets * 6,
          clinicalNotes: isContraindicated 
            ? "Artemether-Lumefantrine is not recommended for infants weighing less than 5 kg. Consult specialized pediatric guidelines or consider alternative therapies." 
            : `Calculated for weight band: ${band}. Dose requires a total of ${actTablets * 6} tablets over 3 days. CRITICAL: Take with fatty food, whole milk, breastmilk, or porridge containing oil. Vomiting protocol: If patient vomits within 30 minutes, repeat the dose. ${actRem?.safetyAlert || ''}`
        };

      case 'albendazole':
        let albDose = "400 mg single dose (1 chewable tablet)";
        let note = "Standard dose for children 2 years and older and adults.";
        let contra = false;

        if (ageMonths < 12) {
          albDose = "Contraindicated";
          note = "Do not administer Albendazole to infants under 12 months.";
          contra = true;
        } else if (ageMonths < 24) {
          albDose = "200 mg single dose (1/2 tablet)";
          note = "Recommended adjusted pediatric dose for infants 12-23 months.";
        }

        return {
          title: "Albendazole Dewormer (Broad-Spectrum Anthelmintic)",
          dosage: albDose,
          isContraindicated: contra,
          clinicalNotes: `${note} Primarily targeted for Soil-Transmitted Helminths (Hookworm, Roundworm). Chew fully. ${albRem?.safetyAlert || ''} ${albRem?.interactions || ''}`
        };

      case 'zinc':
        let zincDose = "20 mg elemental Zinc daily (1 tablet)";
        let zincNote = "Recommended daily dosage for children 6 months and older.";
        
        if (ageMonths < 6) {
          zincDose = "10 mg elemental Zinc daily (1/2 tablet)";
          zincNote = "Recommended daily dosage for infants under 6 months.";
        }

        return {
          title: "Zinc Sulfate Adjuvant Therapy (Acute Diarrhea)",
          dosage: `${zincDose} dissolved in clean water or breastmilk`,
          clinicalNotes: `${zincNote} Administer once daily for exactly 10 to 14 days, even if diarrhea stops early. ${zincRem?.safetyAlert || ''} ${zincRem?.interactions || ''}`
        };

      default:
        return null;
    }
  };

  const dose = calculateDosage();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-800 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
              <Calculator className="h-5.5 w-5.5 text-emerald-855" />
              Weight-Based Clinical Outpost Calculator
            </h2>
            <p className="text-xs text-slate-500">
              Compute immediate, WHO-calibrated dosages for essential tropical and rehydration protocols. Supports offline clinic operations.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-extrabold px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            WHO Protocol Calibrated
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Patient Parameters Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 space-y-5 bg-white shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
              <Scale className="h-4.5 w-4.5 text-emerald-800" />
              Patient Parameters
            </h3>

            {/* Weight Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-slate-650">Patient Weight:</span>
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50 font-black">{weight} kg</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="80" 
                value={weight} 
                onChange={(e) => setWeight(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-800 border border-slate-200"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
                <span>3 kg (Infant)</span>
                <span>40 kg (Teen)</span>
                <span>80 kg (Adult)</span>
              </div>
            </div>

            {/* Age Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-slate-650">Patient Age:</span>
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50 font-black">{getAgeString(ageMonths)}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="180" 
                value={ageMonths} 
                onChange={(e) => setAgeMonths(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-800 border border-slate-200"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
                <span>1 month</span>
                <span>5 years (60m)</span>
                <span>15 years (180m)</span>
              </div>
            </div>

            {/* Target Intervention Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Target Intervention:</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'ors', label: 'WHO Rehydration ORS', icon: Droplets, color: 'text-sky-600' },
                  { id: 'act', label: 'Artemether-Lumefantrine (ACT)', icon: ClipboardList, color: 'text-emerald-600' },
                  { id: 'albendazole', label: 'Albendazole Dewormer', icon: Baby, color: 'text-indigo-600' },
                  { id: 'zinc', label: 'Zinc Sulfate Supplement', icon: ShieldCheck, color: 'text-amber-600' }
                ].map(drug => {
                  const IconComp = drug.icon;
                  return (
                    <button
                      key={drug.id}
                      onClick={() => setSelectedDrug(drug.id)}
                      className={`text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between group ${
                        selectedDrug === drug.id
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-850 shadow-sm'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-650'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComp className={`h-4.5 w-4.5 ${selectedDrug === drug.id ? 'text-emerald-700' : drug.color} group-hover:scale-105 transition-transform`} />
                        <span>{drug.label}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${selectedDrug === drug.id ? 'translate-x-0.5 text-emerald-700' : 'text-slate-350 opacity-0 group-hover:opacity-100'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contextual Parameters based on Intervention Choice */}
            {selectedDrug === 'ors' && (
              <div className="space-y-3 pt-3 border-t border-slate-100 animate-fade-in">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Dehydration Severity Triage:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'planA', label: 'Plan A', desc: 'No Dehy.', style: 'hover:bg-emerald-50 hover:text-emerald-900 border-slate-200 text-slate-700', activeStyle: 'bg-emerald-600 border-emerald-700 text-white shadow' },
                    { id: 'planB', label: 'Plan B', desc: 'Moderate', style: 'hover:bg-amber-50 hover:text-amber-900 border-slate-200 text-slate-700', activeStyle: 'bg-amber-500 border-amber-600 text-white shadow' },
                    { id: 'planC', label: 'Plan C', desc: 'Severe', style: 'hover:bg-rose-50 hover:text-rose-900 border-slate-200 text-slate-700', activeStyle: 'bg-rose-600 border-rose-700 text-white shadow' }
                  ].map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => setOrsPlan(plan.id)}
                      className={`px-2 py-2 rounded-xl text-xs font-extrabold border text-center transition-all flex flex-col justify-center items-center ${
                        orsPlan === plan.id ? plan.activeStyle : `bg-white ${plan.style}`
                      }`}
                    >
                      <span>{plan.label}</span>
                      <span className={`text-[9px] font-medium opacity-90 mt-0.5 ${orsPlan === plan.id ? 'text-white/80' : 'text-slate-400'}`}>
                        {plan.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDrug === 'act' && (
              <div className="space-y-3 pt-3 border-t border-slate-100 animate-fade-in">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Initial Dose Scheduling:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block">Dose 1 Day:</span>
                    <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                      <button 
                        onClick={() => setActStartDay('today')}
                        className={`text-center py-1 rounded-md text-[10px] font-bold transition-all ${actStartDay === 'today' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Today
                      </button>
                      <button 
                        onClick={() => setActStartDay('tomorrow')}
                        className={`text-center py-1 rounded-md text-[10px] font-bold transition-all ${actStartDay === 'tomorrow' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block">Initial Dose Time:</span>
                    <input 
                      type="time" 
                      value={actStartTime}
                      onChange={(e) => setActStartTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Dynamic Dosage Output Sheet */}
        <div className="lg:col-span-7 space-y-4">
          {dose && (
            <div className="glass-panel p-6 space-y-5 animate-fade-in bg-white border border-slate-100 shadow-sm">
              
              {/* Output Title & Header Badge */}
              <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-150/50">
                <div>
                  <span className="text-[9px] uppercase font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 tracking-wider">
                    CALCULATED OUTPUT COURSE
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-1.5 leading-tight">
                    {dose.title}
                  </h3>
                </div>
                
                {/* Status Indicator */}
                {!dose.isContraindicated ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></div>
                    Active Protocol
                  </div>
                ) : (
                  <div className="bg-rose-50 text-rose-800 border border-rose-150 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm animate-pulse">
                    <AlertTriangle className="h-3 w-3 text-rose-600" />
                    Contraindicated
                  </div>
                )}
              </div>

              {/* Main Dosage Results Card */}
              <div className={`p-5 rounded-2xl border transition-all ${
                dose.isContraindicated 
                  ? 'bg-rose-50 border-rose-200 text-rose-900' 
                  : selectedDrug === 'ors' && orsPlan === 'planC'
                    ? 'bg-rose-50/55 border-rose-200 text-rose-900'
                    : selectedDrug === 'ors' && orsPlan === 'planB'
                      ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50/60 border-emerald-150 text-slate-900 shadow-inner'
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                  dose.isContraindicated 
                    ? 'text-rose-800' 
                    : selectedDrug === 'ors' && orsPlan === 'planC'
                      ? 'text-rose-800'
                      : selectedDrug === 'ors' && orsPlan === 'planB'
                        ? 'text-amber-800'
                        : 'text-emerald-800'
                }`}>
                  RECOMMENDED MEDICAL QUANTITY:
                </span>
                <p className="text-lg font-black leading-tight tracking-tight">
                  {dose.dosage}
                </p>
                {selectedDrug === 'act' && !dose.isContraindicated && (
                  <p className="text-xs text-slate-500 font-extrabold mt-1.5 flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5 text-emerald-700" />
                    Total prescription requirement: {dose.totalTablets} tablets (3-day total pack)
                  </p>
                )}
              </div>

              {/* Dynamic Drug Specific Workflows */}
              
              {/* ORS DETAIL WORKFLOWS */}
              {selectedDrug === 'ors' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* PLAN A Extra Advice */}
                  {orsPlan === 'planA' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="h-4 w-4 text-emerald-700" />
                        Caregiver Home Treatment Guidelines
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">1. Zinc Supplementation</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Under 6 months: 10mg Zinc Sulfate daily for 10-14 days.
                            <br />
                            6 months and older: 20mg Zinc Sulfate daily for 10-14 days.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">2. Fluid Advice</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Give extra fluids: ORS, salted soup, rice water, yogurt drinks, or pure boiled water. Do not give sweet tea or soda.
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">3. Continued Feeding</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Continue frequent breast feeding or feeding nutrient-dense fresh foods. Do not withhold food.
                          </p>
                        </div>
                        <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 space-y-1">
                          <span className="text-[10px] font-extrabold text-rose-800 uppercase block">4. Danger Signs (Return immediately)</span>
                          <p className="text-[11px] text-rose-900 leading-relaxed font-bold">
                            • Vomiting everything / unable to drink
                            <br />
                            • Blood in stool / very high fever
                            <br />
                            • Floppy, lethargic, or unresponsive
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PLAN B Timeline & Age Table */}
                  {orsPlan === 'planB' && (
                    <div className="space-y-4">
                      {/* Mode Toggles */}
                      <div className="flex border-b border-slate-100 pb-1">
                        <button
                          onClick={() => setOrsMode('weight')}
                          className={`pb-1 px-3 text-xs font-black tracking-wider transition-all border-b-2 ${orsMode === 'weight' ? 'border-amber-500 text-amber-850' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                          Weight-Based Drinking Timeline
                        </button>
                        <button
                          onClick={() => setOrsMode('ageBand')}
                          className={`pb-1 px-3 text-xs font-black tracking-wider transition-all border-b-2 ${orsMode === 'ageBand' ? 'border-amber-500 text-amber-850' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                          Age-Band Fallback Table
                        </button>
                      </div>

                      {/* Weight-Based Drinking Checklist */}
                      {orsMode === 'weight' && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="flex items-center gap-1.5">
                            <Timer className="h-4.5 w-4.5 text-amber-600" />
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Plan B 4-Hour Fluid Administration Checklist:</span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 italic">
                            Instruct the caregiver to check off each hour as they administer the fluids cup-by-cup. Pause if puffiness occurs.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {[1, 2, 3, 4].map(hr => {
                              const hrKey = `hour${hr}`;
                              const volPerHour = Math.round((weight * 75) / 4);
                              return (
                                <label 
                                  key={hr}
                                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                    orsPlanBProgress[hrKey] 
                                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="checkbox" 
                                      checked={orsPlanBProgress[hrKey]}
                                      onChange={(e) => setOrsPlanBProgress({...orsPlanBProgress, [hrKey]: e.target.checked})}
                                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                                    />
                                    <span>Hour {hr} Intake</span>
                                  </div>
                                  <span className="bg-white/80 px-2 py-0.5 rounded text-[10px] font-black border border-slate-200">
                                    {volPerHour} ml
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Age Band Fallback Reference Table */}
                      {orsMode === 'ageBand' && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="flex items-center gap-1.5">
                            <ClipboardList className="h-4.5 w-4.5 text-amber-600" />
                            <span className="text-xs font-black text-slate-700 uppercase tracking-wide">WHO Weight-Unknown Age Bands:</span>
                          </div>

                          <div className="overflow-hidden border border-slate-150 rounded-xl">
                            <table className="min-w-full divide-y divide-slate-150 text-xs">
                              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                                <tr>
                                  <th className="px-3 py-2 text-left">Age Band Range</th>
                                  <th className="px-3 py-2 text-right">Target ORS Volume (4h)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                                {orsAgeBands.map((band, idx) => (
                                  <tr 
                                    key={idx}
                                    className={`transition-colors ${
                                      idx === activeOrsBandIdx 
                                        ? 'bg-amber-50/70 text-amber-900 font-extrabold border-l-4 border-l-amber-500' 
                                        : 'text-slate-655 hover:bg-slate-50/50'
                                    }`}
                                  >
                                    <td className="px-3 py-2.5">
                                      {band.rangeStr}
                                      {idx === activeOrsBandIdx && (
                                        <span className="ml-2 text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                          Patient Match
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2.5 text-right font-bold">{band.volRange}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PLAN C Critical Infusion & Nasogastric Advice */}
                  {orsPlan === 'planC' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="glass-panel p-4 bg-rose-50 border border-rose-200 text-rose-950 space-y-3 rounded-xl">
                        <div className="flex gap-2 items-start">
                          <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest block">PLAN C EMERGENCY IV CRITICAL STEP</span>
                            <h4 className="font-extrabold text-sm mt-0.5">Start Intravenous Infusion Immediately!</h4>
                            <p className="text-[11px] leading-relaxed opacity-90 mt-1">
                              If patient can drink, administer ORS orally while the IV line is established. Preferred fluid is <strong>Ringer's Lactate Solution</strong>. If unavailable, use <strong>Normal Saline</strong>. Do not use 5% Dextrose.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Nasogastric tube advice */}
                      <div className="p-4 bg-amber-50/50 border border-amber-200 text-amber-950 rounded-xl space-y-2">
                        <div className="flex gap-2 items-start">
                          <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">FALLBACK: IV ACCESS UNAVAILABLE</span>
                            <h4 className="font-extrabold text-sm mt-0.5">Nasogastric (NG) Tube or Oral Treatment Protocol</h4>
                            <p className="text-[11px] leading-relaxed opacity-95 mt-1 text-slate-700">
                              If IV fluid is completely unavailable or clinician lacks access, immediately place a nasogastric tube or administer ORS orally.
                              <br />
                              • <strong>Administer ORS at:</strong> <span className="font-extrabold text-amber-900 bg-white border border-amber-200 px-1.5 py-0.5 rounded">{weight * 20} ml per hour</span> (20 ml/kg/hr) for exactly 6 hours.
                              <br />
                              • Re-evaluate the patient every 1-2 hours. If there is repeated vomiting or abdominal distension, administer fluid slower.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ACT DETAIL WORKFLOWS */}
              {selectedDrug === 'act' && !dose.isContraindicated && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Hour-by-hour dynamic schedule timeline */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4.5 w-4.5 text-emerald-800" />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wide">6-Dose Hour-By-Hour Timeline:</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                        Course Calendar
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic leading-relaxed">
                      Enter the initial dose time in parameters to pre-schedule all remaining 5 doses. Instruct patient's guardian to mark checkboxes as taken.
                    </p>

                    {/* Timeline Grid */}
                    <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
                      {actDoses.map((doseObj) => {
                        const doseKey = `dose${doseObj.doseNum}`;
                        const actTablets = weight >= 35 ? 4 : weight >= 25 ? 3 : weight >= 15 ? 2 : 1;
                        return (
                          <label 
                            key={doseObj.doseNum}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2 cursor-pointer transition-all ${
                              actDosesTaken[doseKey] 
                                ? 'bg-emerald-50 text-emerald-950' 
                                : 'bg-white hover:bg-slate-50 text-slate-750'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input 
                                type="checkbox"
                                checked={actDosesTaken[doseKey]}
                                onChange={(e) => setActDosesTaken({...actDosesTaken, [doseKey]: e.target.checked})}
                                className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 h-4.5 w-4.5 mt-0.5 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black">
                                    Dose {doseObj.doseNum} ({doseObj.offsetHours === 0 ? 'Immediate' : `Hour ${doseObj.offsetHours}`})
                                  </span>
                                  <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded tracking-wider border ${
                                    doseObj.dayLabel === 'Day 1' 
                                      ? 'bg-sky-50 text-sky-850 border-sky-200' 
                                      : doseObj.dayLabel === 'Day 2'
                                        ? 'bg-amber-50 text-amber-850 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-850 border-emerald-200'
                                  }`}>
                                    {doseObj.dayLabel}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5 font-bold">
                                  Scheduled: {doseObj.dayName} at {doseObj.timeString}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-200">
                                {actTablets} tab{actTablets > 1 ? 's' : ''}
                              </span>
                              {actDosesTaken[doseKey] && (
                                <span className="bg-emerald-600 text-white text-[8px] uppercase font-black px-2 py-0.5 rounded tracking-wider">
                                  Administered
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nutrition Requirements & Vomiting Recovery Guide */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-150 space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Utensils className="h-4 w-4 text-amber-700" />
                        <span className="text-xs font-black text-amber-900 uppercase">Fatty Absorption Advice</span>
                      </div>
                      <p className="text-[11px] text-slate-650 leading-relaxed">
                        Artemether-Lumefantrine is extremely hydrophobic. It <strong>MUST</strong> be administered immediately after eating fatty foods (whole milk, breastmilk, peanut paste, eggs, or porridge prepared with vegetable oil) to ensure adequate systemic absorption of Lumefantrine and prevent clinical relapses.
                      </p>
                    </div>

                    <div className="bg-rose-50/55 p-4 rounded-xl border border-rose-150 space-y-1.5">
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-4 w-4 text-rose-700 animate-spin-slow" />
                        <span className="text-xs font-black text-rose-900 uppercase">Vomiting Recovery Protocol</span>
                      </div>
                      <p className="text-[11px] text-slate-650 leading-relaxed font-bold">
                        If patient vomits within 30 minutes of taking a dose, caregivers must immediately administer another FULL repeat dose. If vomiting occurs between 30 and 60 minutes, administer a repeat HALF dose (or full dose under severe vector climates). Keep patient rested and cool.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Albendazole Extra Guidelines */}
              {selectedDrug === 'albendazole' && !dose.isContraindicated && (
                <div className="p-4 bg-indigo-50/40 border border-indigo-150 rounded-xl space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-4.5 w-4.5 text-indigo-755" />
                    <span className="text-xs font-black text-indigo-900 uppercase tracking-wide">Albendazole Clinical Notes:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Deworming programs dramatically reverse microcytic anemia in children. Under endemic conditions, WHO recommends mass treatment of all school-aged children twice annually. Ensure the chewable tablet is completely crushed or chewed before swallowing in young toddlers to avoid choking risks.
                  </p>
                </div>
              )}

              {/* Zinc Sulfate Extra Guidelines */}
              {selectedDrug === 'zinc' && (
                <div className="p-4 bg-amber-50/30 border border-amber-150 rounded-xl space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4.5 w-4.5 text-amber-700" />
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wide">Zinc Mucosal Healing:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Diarrheal pathogens damage intestinal microvilli, disabling nutritional uptake. <strong>Zinc Sulfate adjuvant treatment</strong> accelerates epithelial replication, repairs tight junctions, and maintains cellular immune functions. Caregivers should be counselled to complete the full 10-14 day course even if diarrheal stool counts normalize on Day 2 or 3.
                  </p>
                </div>
              )}

              {/* Warnings / Advisor (Shared clinical reference warnings) */}
              <div className="flex gap-2.5 items-start text-xs text-slate-700 pt-3 border-t border-slate-100">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-800">Critical Clinical Guidelines:</span>
                  <p className="mt-0.5 text-slate-500 leading-relaxed text-[11px]">
                    {dose.clinicalNotes}
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
