import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Download, 
  AlertOctagon, 
  AlertTriangle, 
  Activity, 
  Check, 
  ChevronRight, 
  X, 
  Info, 
  ShieldAlert, 
  HeartPulse, 
  Send 
} from 'lucide-react';

// Sub-regions / Outpost Zones Definition
const COUNTY_ZONES = {
  nairobi: [
    { id: 'westlands', name: 'Westlands', desc: 'High elevation, low malaria risk but high household density.', coords: 'M 30,30 L 90,20 L 110,60 L 50,70 Z' },
    { id: 'kibera', name: 'Kibera', desc: 'Socio-ecological vulnerability, high fecal-water runoff and cholera transmission risk.', coords: 'M 50,70 L 110,60 L 90,110 L 40,100 Z' },
    { id: 'embakasi', name: 'Embakasi Plain', desc: 'Low-lying, warm savannah border; rising mosquito vector pools.', coords: 'M 110,60 L 180,40 L 190,110 L 90,110 Z' },
    { id: 'kasarani', name: 'Kasarani', desc: 'Cool clay terrain, stable water lines.', coords: 'M 90,20 L 170,10 L 180,40 L 110,60 Z' },
    { id: 'cbd', name: 'Central CBD', desc: 'Densely populated commercial hub, high respiratory exposure.', coords: 'M 95,50 A 15,15 0 1,1 95,80 A 15,15 0 1,1 95,50' }
  ],
  mombasa: [
    { id: 'mvita', name: 'Mvita (Old Town)', desc: 'Dense ancient stone architecture, stagnant water channels.', coords: 'M 80,60 L 120,50 L 130,90 L 90,100 Z' },
    { id: 'kisauni', name: 'Kisauni Wetlands', desc: 'Swampy marshes, peak seasonal breeding environment for Aedes Dengue vectors.', coords: 'M 70,20 L 140,10 L 120,50 L 80,60 Z' },
    { id: 'likoni', name: 'Likoni Ferry Zone', desc: 'Dense transit hubs, coastal humidity spikes.', coords: 'M 90,100 L 130,90 L 110,150 L 60,140 Z' },
    { id: 'changamwe', name: 'Changamwe Perimeter', desc: 'Industrial corridor, high chemical and respiratory burden.', coords: 'M 20,50 L 80,60 L 90,100 L 30,95 Z' },
    { id: 'nyali', name: 'Nyali Coast', desc: 'Sandy dry dunes, moderate ventilation.', coords: 'M 140,10 L 190,40 L 160,80 L 120,50 Z' }
  ],
  lodwar: [
    { id: 'town', name: 'Lodwar Central', desc: 'High-density sand plains, high daytime solar radiation.', coords: 'M 80,70 A 20,20 0 1,1 80,110 A 20,20 0 1,1 80,70' },
    { id: 'kalokol', name: 'Kalokol Shore', desc: 'Lake Turkana fishing front; high cholera risk from unchlorinated shallow wells.', coords: 'M 90,10 L 170,20 L 150,70 L 80,70 Z' },
    { id: 'kakuma', name: 'Kakuma Refugee Hub', desc: 'Dense refugee quarters, dry dust cycles, fragile sanitary infrastructure.', coords: 'M 20,20 L 90,10 L 80,70 L 30,80 Z' },
    { id: 'lokichar', name: 'Lokichar Basin', desc: 'Arid scrubland; vulnerable nomadic clusters.', coords: 'M 80,110 L 150,70 L 170,160 L 100,170 Z' },
    { id: 'turkwel', name: 'Turkwel Seasonal River', desc: 'Riparian woodland strip, rising vector pools during sudden flash rains.', coords: 'M 30,80 L 80,70 L 80,110 L 40,130 Z' }
  ],
  kakamega: [
    { id: 'town', name: 'Kakamega Central', desc: 'High commercial density, rapid clinical referrals.', coords: 'M 90,65 A 15,15 0 1,1 90,95 A 15,15 0 1,1 90,65' },
    { id: 'shinyalu', name: 'Shinyalu Forest Core', desc: 'Equatorial forest canopy; high humidity, thiving fungal and hookworm vectors.', coords: 'M 100,20 L 170,30 L 160,95 L 90,95 Z' },
    { id: 'mumias', name: 'Mumias Sugar Fields', desc: 'Intensive crop irrigation zones, heavy exposure to damp mud soil.', coords: 'M 30,30 L 100,20 L 95,80 L 25,80 Z' },
    { id: 'butere', name: 'Butere Clay Plains', desc: 'Clay wetlands, high standing water pooling post-monsoon rains.', coords: 'M 25,80 L 95,80 L 80,140 L 20,130 Z' },
    { id: 'lugari', name: 'Lugari Highland Edge', desc: 'Cool clearings, stable water runoffs.', coords: 'M 95,80 L 160,95 L 140,150 L 80,140 Z' }
  ]
};

// Seed cases to load for realistic Bedside Demonstrations
const SEED_CASES = [
  // Kakamega
  { id: 'case-1', initials: 'JK', disease: 'malaria', county: 'kakamega', zone: 'shinyalu', severity: 'severe', age: 4, gender: 'male', rdtConfirmed: true, symptoms: ['high-fever', 'joint-pain'], timestamp: '14:20' },
  { id: 'case-2', initials: 'AM', disease: 'malaria', county: 'kakamega', zone: 'shinyalu', severity: 'moderate', age: 35, gender: 'female', rdtConfirmed: true, symptoms: ['high-fever', 'fatigue'], timestamp: '15:10' },
  { id: 'case-3', initials: 'SL', disease: 'malaria', county: 'kakamega', zone: 'shinyalu', severity: 'mild', age: 18, gender: 'male', rdtConfirmed: false, symptoms: ['fatigue'], timestamp: '16:05' },
  { id: 'case-4', initials: 'WT', disease: 'cholera', county: 'kakamega', zone: 'butere', severity: 'severe', age: 2, gender: 'male', rdtConfirmed: true, symptoms: ['dehydration', 'vomiting'], timestamp: '10:45' },
  
  // Mombasa
  { id: 'case-5', initials: 'SM', disease: 'dengue', county: 'mombasa', zone: 'kisauni', severity: 'severe', age: 7, gender: 'female', rdtConfirmed: true, symptoms: ['high-fever', 'joint-pain', 'platelet-drop'], timestamp: '09:15' },
  { id: 'case-6', initials: 'HO', disease: 'dengue', county: 'mombasa', zone: 'kisauni', severity: 'severe', age: 45, gender: 'male', rdtConfirmed: true, symptoms: ['high-fever', 'joint-pain', 'fatigue'], timestamp: '11:30' },
  { id: 'case-7', initials: 'TN', disease: 'dengue', county: 'mombasa', zone: 'kisauni', severity: 'moderate', age: 29, gender: 'female', rdtConfirmed: true, symptoms: ['joint-pain', 'fatigue'], timestamp: '13:00' },
  { id: 'case-8', initials: 'PK', disease: 'dengue', county: 'mombasa', zone: 'kisauni', severity: 'mild', age: 12, gender: 'male', rdtConfirmed: false, symptoms: ['fatigue'], timestamp: '14:50' },
  { id: 'case-9', initials: 'RA', disease: 'malaria', county: 'mombasa', zone: 'mvita', severity: 'moderate', age: 22, gender: 'female', rdtConfirmed: true, symptoms: ['high-fever'], timestamp: '16:12' },
  
  // Lodwar
  { id: 'case-10', initials: 'EE', disease: 'cholera', county: 'lodwar', zone: 'kalokol', severity: 'severe', age: 3, gender: 'male', rdtConfirmed: true, symptoms: ['dehydration', 'vomiting'], timestamp: '08:30' },
  { id: 'case-11', initials: 'LO', disease: 'cholera', county: 'lodwar', zone: 'kalokol', severity: 'severe', age: 28, gender: 'female', rdtConfirmed: true, symptoms: ['dehydration', 'vomiting', 'fatigue'], timestamp: '10:10' },
  { id: 'case-12', initials: 'NK', disease: 'cholera', county: 'lodwar', zone: 'kalokol', severity: 'moderate', age: 50, gender: 'male', rdtConfirmed: true, symptoms: ['dehydration', 'fatigue'], timestamp: '12:40' },
  
  // Nairobi
  { id: 'case-13', initials: 'GN', disease: 'cholera', county: 'nairobi', zone: 'kibera', severity: 'severe', age: 1, gender: 'female', rdtConfirmed: true, symptoms: ['dehydration', 'vomiting'], timestamp: '11:15' },
  { id: 'case-14', initials: 'MM', disease: 'cholera', county: 'nairobi', zone: 'kibera', severity: 'moderate', age: 20, gender: 'male', rdtConfirmed: true, symptoms: ['dehydration'], timestamp: '14:22' },
  { id: 'case-15', initials: 'EK', disease: 'malaria', county: 'nairobi', zone: 'westlands', severity: 'mild', age: 9, gender: 'female', rdtConfirmed: false, symptoms: ['high-fever'], timestamp: '15:45' }
];

export default function EpidemicHeatmap({ selectedRegion }) {
  const activeCounty = selectedRegion || 'nairobi';
  
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem('this_epidemic_cases');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Load default seed data
    localStorage.setItem('this_epidemic_cases', JSON.stringify(SEED_CASES));
    return SEED_CASES;
  });

  const [hoveredZone, setHoveredZone] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeZoneDetail, setActiveZoneDetail] = useState(null);

  // Form states
  const [patientInitials, setPatientInitials] = useState('');
  const [targetDisease, setTargetDisease] = useState('malaria');
  const [targetZone, setTargetZone] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [expandAdvanced, setExpandAdvanced] = useState(false);
  
  // Advanced parameters
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('male');
  const [rdtConfirmed, setRdtConfirmed] = useState(false);
  const [activeSymptoms, setActiveSymptoms] = useState([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('this_epidemic_cases', JSON.stringify(cases));
  }, [cases]);

  // Compute case counts for active county zones
  const activeCases = cases.filter(c => c.county === activeCounty);
  const zoneCaseCounts = {};
  activeCases.forEach(c => {
    zoneCaseCounts[c.zone] = (zoneCaseCounts[c.zone] || 0) + 1;
  });

  // Identify Epicenter
  let epicenterZoneId = null;
  let maxCaseCount = 0;
  Object.keys(zoneCaseCounts).forEach(zId => {
    if (zoneCaseCounts[zId] > maxCaseCount) {
      maxCaseCount = zoneCaseCounts[zId];
      epicenterZoneId = zId;
    }
  });

  // Standard interactive zone details
  const zonesList = COUNTY_ZONES[activeCounty] || [];

  const handleLogCaseSubmit = (e) => {
    e.preventDefault();
    if (!patientInitials.trim() || !targetZone) return;

    const newCase = {
      id: `case-${Date.now()}`,
      initials: patientInitials.toUpperCase().trim(),
      disease: targetDisease,
      county: activeCounty,
      zone: targetZone,
      severity,
      age: patientAge ? Number(patientAge) : null,
      gender: patientGender,
      rdtConfirmed,
      symptoms: activeSymptoms,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCases(prev => [newCase, ...prev]);
    setShowLogModal(false);
    
    // Reset Form
    setPatientInitials('');
    setPatientAge('');
    setRdtConfirmed(false);
    setActiveSymptoms([]);
    setExpandAdvanced(false);
  };

  const handleDeleteCase = (id) => {
    setCases(prev => prev.filter(c => c.id !== id));
  };

  // FHIR Export logic
  const handleFhirExport = () => {
    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: activeCases.map(c => ({
        resource: {
          resourceType: 'QuestionnaireResponse',
          id: `epidemic-report-${c.id}`,
          status: 'completed',
          subject: {
            display: `Patient Initials: ${c.initials}`
          },
          authored: new Date().toISOString(),
          item: [
            { linkId: 'disease', text: 'Target Disease Pathogen', answer: [{ valueString: c.disease }] },
            { linkId: 'county', text: 'Regional County context', answer: [{ valueString: c.county }] },
            { linkId: 'zone', text: 'Sub-Region Outpost District', answer: [{ valueString: c.zone }] },
            { linkId: 'severity', text: 'Diagnostic Severity Level', answer: [{ valueString: c.severity }] },
            { linkId: 'age', text: 'Patient Age', answer: [{ valueInteger: c.age }] },
            { linkId: 'gender', text: 'Patient Gender', answer: [{ valueString: c.gender }] },
            { linkId: 'rdtConfirmed', text: 'Rapid Diagnostic Confirmed', answer: [{ valueBoolean: c.rdtConfirmed }] }
          ]
        }
      }))
    };

    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FHIR-Epidemic-Report-${activeCounty}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Shading Class Resolver
  const getChoroplethClass = (count, zId) => {
    if (!count) return 'fill-slate-100/30 stroke-emerald-800/25 hover:fill-emerald-50/20';
    if (zId === epicenterZoneId && count >= 3) {
      return 'fill-rose-500/25 stroke-rose-600 hover:fill-rose-500/40 cursor-pointer duration-500';
    }
    if (count >= 3) return 'fill-rose-400/20 stroke-rose-500 hover:fill-rose-400/35';
    return 'fill-amber-400/15 stroke-amber-500 hover:fill-amber-400/30';
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'severe': return 'bg-rose-100 text-rose-800 border-rose-250';
      case 'moderate': return 'bg-amber-100 text-amber-800 border-amber-250';
      case 'mild':
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-250';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Premium Visual Header */}
      <div className="glass-panel p-6 border-l-4 border-l-rose-600 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 font-outfit">
              <Activity className="h-5.5 w-5.5 text-rose-600 animate-pulse" />
              Epidemic Outbreak Heatmap & Case Registry
            </h2>
            <p className="text-xs text-slate-500">
              Locally log infectious vector-borne clusters and monitor live high-risk transmission zones entirely offline. Toggle active contexts from the header dropdown.
            </p>
          </div>
          <button
            onClick={() => {
              setTargetZone(zonesList[0]?.id || '');
              setShowLogModal(true);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Log Local Outbreak Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Map Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 bg-white border border-slate-200 shadow-sm relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="h-4 w-4 text-rose-600" />
                Active Map Context: {activeCounty.charAt(0).toUpperCase() + activeCounty.slice(1)} Outpost
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-450">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-100 border border-emerald-450" /> 0 Cases
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-100 border border-amber-450" /> 1-2 Cases
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-100 border border-rose-450" /> 3+ Cases
                </span>
              </div>
            </div>

            {/* SVG Choropleth Vector Grid */}
            <div className="aspect-[4/3] bg-slate-50/50 border border-slate-150 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 200 180" className="w-full h-full max-h-[380px] drop-shadow-md">
                {/* Outbreak Epicenter Animated Pulse Beacon */}
                {epicenterZoneId && maxCaseCount >= 3 && (() => {
                  const epicZone = zonesList.find(z => z.id === epicenterZoneId);
                  if (epicZone) {
                    // Extract a central mock offset point
                    let cx = 100, cy = 90;
                    if (epicenterZoneId === 'kibera') { cx = 75; cy = 85; }
                    else if (epicenterZoneId === 'shinyalu') { cx = 130; cy = 55; }
                    else if (epicenterZoneId === 'kalokol') { cx = 125; cy = 40; }
                    else if (epicenterZoneId === 'kisauni') { cx = 105; cy = 35; }
                    
                    return (
                      <g className="pointer-events-none no-print">
                        <circle cx={cx} cy={cy} r="18" fill="none" stroke="red" strokeWidth="1" className="animate-ping opacity-60" />
                        <circle cx={cx} cy={cy} r="6" fill="red" className="animate-pulse" />
                      </g>
                    );
                  }
                  return null;
                })()}

                {/* Vector divisions */}
                {zonesList.map(zone => {
                  const casesCount = zoneCaseCounts[zone.id] || 0;
                  const isActiveHovered = hoveredZone === zone.id;
                  
                  return (
                    <path
                      key={zone.id}
                      d={zone.coords}
                      className={`transition-all duration-300 stroke-[1.2] cursor-pointer ${getChoroplethClass(casesCount, zone.id)}`}
                      onClick={() => setActiveZoneDetail(zone)}
                      onMouseEnter={() => setHoveredZone(zone.id)}
                      onMouseLeave={() => setHoveredZone(null)}
                    />
                  );
                })}
              </svg>

              {/* Hover status bubble */}
              {hoveredZone && (() => {
                const zoneObj = zonesList.find(z => z.id === hoveredZone);
                const count = zoneCaseCounts[hoveredZone] || 0;
                return (
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 px-3.5 py-2 rounded-xl shadow-lg pointer-events-none animate-fade-in space-y-0.5">
                    <strong className="text-xs font-bold text-slate-800 block leading-tight">{zoneObj?.name}</strong>
                    <span className="text-[10px] font-black text-rose-600 uppercase block">{count} cases logged</span>
                  </div>
                );
              })()}
            </div>
            
            {/* Interactive zone information block */}
            <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl min-h-[85px] flex items-center justify-center text-center">
              {activeZoneDetail ? (
                <div className="space-y-1 text-left w-full relative">
                  <button 
                    onClick={() => setActiveZoneDetail(null)}
                    className="absolute right-0 top-0 text-slate-400 hover:text-slate-650"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-rose-500" />
                    District Focus: {activeZoneDetail.name}
                  </h4>
                  <p className="text-[11px] text-slate-550 leading-relaxed max-w-lg">
                    {activeZoneDetail.desc} — <strong>Active caseload: {zoneCaseCounts[activeZoneDetail.id] || 0} diagnosed clusters.</strong>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Hover over zones to quick-scan caseloads. Click any zone to view district-specific epidemiological notes.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Local Case Registry Logs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between min-h-[480px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-extrabold text-[hsl(var(--primary-green))] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-rose-650" />
                  Bedside Patient Registry ({activeCases.length})
                </h3>
                {activeCases.length > 0 && (
                  <button
                    onClick={handleFhirExport}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Download className="h-3 w-3" />
                    Export FHIR Bundle
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {activeCases.map(c => {
                  const zoneObj = zonesList.find(z => z.id === c.zone);
                  return (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 text-xs animate-scale-up group">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <strong className="font-bold text-slate-800">Initials: {c.initials}</strong>
                          <span className={`text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.2 rounded border ${getSeverityBadgeClass(c.severity)}`}>
                            {c.severity}
                          </span>
                          {c.rdtConfirmed && (
                            <span className="text-[9px] uppercase font-black tracking-wider px-1 bg-emerald-500 text-white rounded border border-emerald-600">
                              ✓ RDT Confirmed
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal truncate">
                          Disease: <span className="font-bold text-slate-700 capitalize">{c.disease}</span> | Zone: <span className="font-bold text-slate-700">{zoneObj?.name || c.zone}</span>
                        </p>
                        {c.age && (
                          <span className="text-[9px] text-slate-400 block font-medium">
                            Demographics: {c.age} yrs | {c.gender} | Logged: {c.timestamp}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCase(c.id)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100 hover:border-rose-100 rounded-lg shadow-sm transition-colors cursor-pointer"
                        title="Delete record from PWA logs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}

                {activeCases.length === 0 && (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <HeartPulse className="h-10 w-10 text-slate-200 mx-auto" />
                    <p className="text-xs italic">No outbreak clusters registered in this outpost yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-rose-50/35 border border-rose-100 p-3.5 rounded-2xl flex items-start gap-2.5 text-rose-900 mt-4 leading-normal">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-0.5">
                <strong className="text-[11px] uppercase font-extrabold tracking-wider block">Bedside Outbreak Protocol</strong>
                <p className="text-[10px] leading-relaxed text-slate-650 font-medium">
                  Diagnosing <strong>3+ active Cholera or Dengue cases</strong> in any single sub-district triggers the active warning beacon. Alert the regional health office, mobilize community vector control nets, and secure sterile water chlorination caches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Logging Modal Form */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-4 animate-fade-in no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-600 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-855 font-outfit">Log Local Outbreak Case</h3>
                  <span className="text-[10px] text-slate-400">Outpost regional registry intake</span>
                </div>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLogCaseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Patient Initials:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JK"
                    maxLength={3}
                    value={patientInitials}
                    onChange={(e) => setPatientInitials(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-rose-500 text-slate-700 font-bold uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Disease Target:</label>
                  <select
                    value={targetDisease}
                    onChange={(e) => setTargetDisease(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                  >
                    <option value="malaria">Malaria (Anopheles)</option>
                    <option value="dengue">Dengue Fever (Aedes)</option>
                    <option value="cholera">Cholera (Waterborne)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Outpost Zone:</label>
                  <select
                    value={targetZone}
                    required
                    onChange={(e) => setTargetZone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                  >
                    {zonesList.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Severity Level:</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                  >
                    <option value="mild">Mild (Supportive Care)</option>
                    <option value="moderate">Moderate (Clinical Intake)</option>
                    <option value="severe">Severe (Urgent IV / Referral)</option>
                  </select>
                </div>
              </div>

              {/* Expandable Advanced drawer */}
              <div className="border-t border-slate-100 pt-2.5">
                <button
                  type="button"
                  onClick={() => setExpandAdvanced(!expandAdvanced)}
                  className="text-[10px] text-rose-600 font-extrabold uppercase hover:underline flex items-center gap-1"
                >
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expandAdvanced ? 'rotate-90' : ''}`} />
                  {expandAdvanced ? "Hide Advanced Epidemiology" : "Expand Advanced Epidemiology Drawer"}
                </button>

                {expandAdvanced && (
                  <div className="space-y-3 mt-3 p-3 bg-slate-50 border border-slate-200/60 rounded-xl animate-scale-up">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-slate-500 block">Patient Age (Years):</label>
                        <input
                          type="number"
                          placeholder="e.g. 5"
                          min={0}
                          max={120}
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-slate-500 block">Patient Gender:</label>
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-rose-500 text-slate-700 font-bold"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/40">
                      <input
                        type="checkbox"
                        id="rdtConfirmCheck"
                        checked={rdtConfirmed}
                        onChange={(e) => setRdtConfirmed(e.target.checked)}
                        className="rounded border-slate-350 text-rose-600 focus:ring-rose-500"
                      />
                      <label htmlFor="rdtConfirmCheck" className="text-[10px] font-bold text-slate-650 cursor-pointer">
                        Confirm via Rapid Diagnostic Test (RDT) / Microscopy
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowLogModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
