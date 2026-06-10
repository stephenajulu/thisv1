import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  ShieldCheck, 
  Calculator, 
  CloudRain, 
  Compass, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Settings, 
  AlertTriangle, 
  Layers, 
  Globe, 
  Activity, 
  Sparkles, 
  HeartPulse, 
  ShieldAlert, 
  Award, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  Check,
  X
} from 'lucide-react';
import { database } from '../data/database';
import { getLocalizedRemedy } from '../utils/regionalHelper';
import { verifyRemoteOutpost } from '../utils/membership';

export default function LandingPage({ onNavigate }) {
  // --- Invite Access Modal State ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOutpost, setInviteOutpost] = useState('');
  const [inviteRole, setInviteRole] = useState('clinical-officer');
  const [inviteReason, setInviteReason] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteSubmitted, setInviteSubmitted] = useState(false);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteSubmitting(true);
    
    // Netlify form data submission via AJAX
    const formData = new URLSearchParams();
    formData.append("form-name", "request-invite");
    formData.append("name", inviteName);
    formData.append("email", inviteEmail);
    formData.append("outpost", inviteOutpost);
    formData.append("role", inviteRole);
    formData.append("reason", inviteReason);
    
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      setInviteSubmitted(true);
      // Reset inputs
      setInviteName('');
      setInviteEmail('');
      setInviteOutpost('');
      setInviteReason('');
    } catch (err) {
      console.error("Failed to submit invite request", err);
      alert("Submission error. Please check your connection and try again.");
    } finally {
      setInviteSubmitting(false);
    }
  };

  // --- Vector Simulator State ---
  const [simTemp, setSimTemp] = useState(29);
  const [simHumidity, setSimHumidity] = useState(78);
  const [simRainfall, setSimRainfall] = useState(280);

  // --- Geofence Simulator State ---
  const [testLocation, setTestLocation] = useState('lodwar'); // 'nairobi' | 'lodwar' | 'mombasa'
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [customGeofenceResult, setCustomGeofenceResult] = useState(null);

  // --- GRADE Evidence Taster State ---
  const [selectedRemedyId, setSelectedRemedyId] = useState('artemisia-annua');

  // --- Outposts Data for simulation ---
  const MOCK_OUTPOSTS = {
    nairobi: { name: 'Nairobi Clinic (Central Highlands)', lat: -1.2921, lon: 36.8219, description: 'Located directly inside urban city centre (within 50km threshold).' },
    mombasa: { name: 'Mombasa Ward (Coastal Wetlands)', lat: -4.0435, lon: 39.6682, description: 'Located directly inside coastal urban center (within 50km threshold).' },
    lodwar: { name: 'Lodwar Outpost (Turkana Arid Border)', lat: 3.1197, lon: 35.5973, description: 'Located in remote northern savannah (exempt from fees, >50km away).' }
  };

  // Vector Risk Calculation (replicates the algorithm from WeatherThreatForecast)
  const calculateSimulatedRisks = () => {
    const malariaScore = (simTemp >= 20 && simTemp <= 35 ? 30 : 0) + (simHumidity >= 60 ? 30 : 0) + (simRainfall >= 80 ? 30 : 0) + 10;
    const dengueScore = (simTemp >= 22 && simTemp <= 38 ? 30 : 0) + (simHumidity >= 50 ? 30 : 0) + (simRainfall >= 100 ? 30 : 0) + 10;
    const choleraScore = simRainfall >= 250 ? 100 : (simRainfall < 15 && simTemp > 32 ? 75 : ((simTemp >= 24 && simTemp <= 40 ? 30 : 0) + (simHumidity >= 40 ? 30 : 0) + (simRainfall >= 150 ? 30 : 0) + 10));

    const getRiskDetails = (score) => {
      if (score >= 80) return { label: "SEVERE THREAT", color: "bg-rose-500/10 border-rose-500 text-rose-500", text: "Severe" };
      if (score >= 50) return { label: "HIGH RISK", color: "bg-amber-500/10 border-amber-500 text-amber-600", text: "High" };
      if (score >= 30) return { label: "MODERATE RISK", color: "bg-sky-500/10 border-sky-500 text-sky-600", text: "Moderate" };
      return { label: "LOW RISK", color: "bg-emerald-500/10 border-emerald-500 text-emerald-600", text: "Low" };
    };

    return [
      { id: 'malaria', name: 'Malaria Vector (Anopheles)', score: malariaScore, ...getRiskDetails(malariaScore), description: 'Optimal breeding occurs in warm standing rainwater.' },
      { id: 'dengue', name: 'Dengue Vector (Aedes aegypti)', score: dengueScore, ...getRiskDetails(dengueScore), description: 'Propagates rapidly in container pools and urban/outpost runoff.' },
      { id: 'cholera', name: 'Fecal Cholera Contamination', score: choleraScore, ...getRiskDetails(choleraScore), description: 'Heavy monsoon rains mix open sewage with shallow outpost drinking wells.' }
    ];
  };

  const activeRisks = calculateSimulatedRisks();

  // Handle simulation of geofence waivers
  const handleTestGeofence = (key) => {
    setTestLocation(key);
    setCustomGeofenceResult(null);
  };

  const handleCustomGeofence = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon)) return;
    const res = verifyRemoteOutpost(lat, lon);
    setCustomGeofenceResult({
      isRemote: res.isRemote,
      minDistance: res.minDistance,
      lat,
      lon
    });
  };

  // Selectable remedies for preview
  const previewRemedies = [
    {
      id: 'artemisia-annua',
      name: 'Sweet Wormwood (Artemisia)',
      scientificName: 'Artemisia annua',
      category: 'botanical',
      activeCompounds: 'Artemisinin, Flavonoids, Essential Oils',
      gradeQuality: 'Moderate',
      recStrength: 'Conditional For',
      traditionalAlignment: 'High',
      desc: 'Traditional Chinese medicine used for fevers. Modern extraction yields artemisinin, the foundation of modern first-line ACT antimalarials.',
      safety: 'Safe as a tea infusive, but leaf teas CANNOT replace WHO-first line pharmaceutical ACTs for active malaria due to erratic dosing.',
      contras: 'Avoid in early pregnancy unless clinical alternatives are unavailable.'
    },
    {
      id: 'artemether-lumefantrine',
      name: 'Artemether-Lumefantrine (ACT)',
      scientificName: 'Coartem / AL pharmaceutical',
      category: 'pharmaceutical',
      activeCompounds: 'Artemether (fast acting) + Lumefantrine (long acting)',
      gradeQuality: 'High',
      recStrength: 'Strong For',
      traditionalAlignment: 'Unaligned',
      desc: 'Modern gold standard first-line clinical malaria cure. Eradicates blood-stage malaria parasites within 24-48 hours.',
      safety: 'Extremely high clinical efficacy. Must be administered with fat/milk to guarantee proper intestinal absorption.',
      contras: 'Do not delay intake. Mandatory 6-dose course over 60 hours.'
    },
    {
      id: 'neem-leaves',
      name: 'Neem Leaf Infusion',
      scientificName: 'Azadirachta indica',
      category: 'botanical',
      activeCompounds: 'Azadirachtin, Nimbin, Quercetin',
      gradeQuality: 'Low',
      recStrength: 'Conditional Against',
      traditionalAlignment: 'High',
      desc: 'Widely used in traditional medicine across East Africa and India. Prescribed locally for high fevers and scabies.',
      safety: 'Leaves have low antimalarial clearance. Concentrated seed oils are highly neurotoxic in pediatric cases.',
      contras: 'STRICT CONTRAINDICATION: Abortifacient risk. Strongly prohibited in pregnant patients.'
    },
    {
      id: 'oral-rehydration-salts',
      name: 'Oral Rehydration Salts (ORS)',
      scientificName: 'WHO Low-Osmolarity Formula',
      category: 'pharmaceutical',
      activeCompounds: 'Sodium chloride, Glucose, Potassium chloride, Trisodium citrate',
      gradeQuality: 'High',
      recStrength: 'Strong For',
      traditionalAlignment: 'Unaligned',
      desc: 'Life-saving fluid buffer for severe diarrhea and cholera outposts. Restores extracellular fluid volume.',
      safety: 'Mix exactly with 1 Liter of clean water. Administer concurrently with zinc supplements in children.',
      contras: 'Plan C intravenous infusions required if patient exhibits signs of severe hypovolemic shock.'
    }
  ];

  const activeRemedy = previewRemedies.find(r => r.id === selectedRemedyId) || previewRemedies[0];

  // Record that user has seen landing page to offer quick bypass next time
  useEffect(() => {
    localStorage.setItem('this_landing_visited', 'true');
  }, []);

  return (
    <div className="space-y-20 pb-12 animate-fade-in no-print landing-page-container">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-950 bg-radial-[at_top_right] from-emerald-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-12 md:p-16 border border-emerald-900/50 shadow-2xl">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,_transparent_20%,_black_70%)] pointer-events-none" />
        
        {/* Glowing blobs */}
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Pitch Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-outfit uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
              100% Offline Clinical Support
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-outfit tracking-tight !text-white leading-[1.1]">
              Sovereign Outpost Triage for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">Tropical Medicine</span>
            </h1>
            
            <p className="!text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl">
              THIS (Tropical Health Information System) is a peer-reviewed decision engine designed for off-grid humanitarian outposts. It integrates traditional ethnobotanical treatments and modern pharmaceuticals under the global WHO GRADE evidence framework.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => {
                  localStorage.setItem('this_visited_before', 'true');
                  onNavigate('dashboard');
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 group cursor-pointer"
              >
                Launch Outpost Portal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <a 
                href="#sponsorships"
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
              >
                Explore BOGO Model
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <span className="block text-2xl font-black !text-white font-outfit">62+</span>
                <span className="text-xs !text-slate-205">Remedies Graded</span>
              </div>
              <div>
                <span className="block text-2xl font-black !text-white font-outfit">100%</span>
                <span className="text-xs !text-slate-205">Offline Local-Sovereign</span>
              </div>
              <div>
                <span className="block text-2xl font-black !text-white font-outfit">&lt;50km</span>
                <span className="text-xs !text-slate-205">Geofence Free Waiver</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase (Simulated App Snapshot) */}
          <div className="lg:col-span-5 relative">
            <div className="p-6 bg-slate-950/85 border border-emerald-900/50 backdrop-blur-md shadow-2xl rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 font-outfit">Outpost Live-Audit Connection</span>
                </div>
                <div className="px-2 py-0.5 bg-slate-800 rounded text-[9px] text-slate-400 font-bold uppercase">
                  PWA Cache
                </div>
              </div>

              {/* Simulated Diagnostic Card */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black !text-white uppercase tracking-wider">Plasmodium falciparum Malaria</h3>
                    <span className="text-[9px] text-emerald-400">Systemic Parasitemia • ICD11 1B10</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 font-extrabold rounded">
                    Severe Threat
                  </span>
                </div>

                <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300">First-Line Cure:</span>
                    <span className="text-emerald-400 font-bold">Artemether-Lumefantrine</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full" />
                  </div>
                  <p className="text-[9px] text-slate-300 leading-normal">
                    Adjuvant ethnobotanical treatments (e.g. Artemisia tea, Neem leaf) provide traditional support but cannot replace immediate ACT dosage timing.
                  </p>
                </div>

                {/* Simulated Settings Panel */}
                <div className="flex justify-between items-center text-[10px] bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-sky-400" />
                    <span className="text-slate-300">Outpost County: Turkana</span>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase text-[9px]">
                    Waiver Verified ✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CORE VALUE PILLARS ================= */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-[hsl(var(--primary-green))]">
            Designed for the Hardest Bedside Realities
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Outposts lack stable connections, medical libraries, and specialist backups. THIS is engineered specifically to address these structural deficits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Globe,
              color: "text-sky-600 bg-sky-50 border-sky-100",
              title: "100% Offline-Sovereign",
              desc: "Built as an offline-first Progressive Web App (PWA). Caches all guidelines, data modules, and calculated scripts so it remains fully functional in regions with complete grid collapse."
            },
            {
              icon: ShieldCheck,
              color: "text-emerald-800 bg-emerald-50 border-emerald-100",
              title: "WHO GRADE Evaluation",
              desc: "Every recommendation features transparent Grading of Recommendations Assessment, Development and Evaluation rating badges, helping clinicians assess the real scientific weight behind treatments."
            },
            {
              icon: Calculator,
              color: "text-amber-700 bg-amber-50 border-amber-100",
              title: "Outpost Dosage Calibrators",
              desc: "Calculates precise WHO Plan A/B/C pediatric rehydration volumes, Artemether-Lumefantrine 6-dose schedules, and dewormer weight adjustments without requiring an active internet connection."
            },
            {
              icon: CloudRain,
              color: "text-teal-700 bg-teal-50 border-teal-100",
              title: "Climate Vector Outbreak Dials",
              desc: "Enables clinicians to input real-time meteorological variables to gauge vector-borne infection rates, triggering alerts for preventive community health interventions."
            },
            {
              icon: HeartPulse,
              color: "text-rose-700 bg-rose-50 border-rose-100",
              title: "Traditional Ethnobotany Vetting",
              desc: "Respectfully catalogs local remedies, cross-referencing traditional prep methods with modern clinical trials to clarify drug interactions and maternal toxicity contraindications."
            },
            {
              icon: FileText,
              color: "text-slate-700 bg-slate-100 border-slate-200",
              title: "A4 PDF Clinic Handover Sheets",
              desc: "Instantly formulates clean, black-and-white printouts optimized for physical A4 paper, providing physical copies of charts and dosages for patient records and hospital transfers."
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass-panel p-6 bg-white dark:bg-slate-900/60 space-y-4 hover:border-[hsl(var(--primary-green),0.2)] transition-all">
              <div className={`p-3 rounded-xl w-fit border ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">{feature.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= INTERACTIVE COMPONENT 1: OUTBREAK SIMULATOR ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column - Simulator panel */}
        <div className="lg:col-span-5 glass-panel p-6 bg-white dark:bg-slate-900/60 border-emerald-100/50 dark:border-emerald-950/50 shadow-xl space-y-6">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
              Interactive Taster
            </span>
            <h3 className="text-lg font-black text-slate-850 dark:text-slate-100">Climate Outbreak Risk Simulator</h3>
            <p className="text-[11px] text-slate-600">
              Drag the climate sliders below to simulate how meteorological changes impact outpost infection threats.
            </p>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            {/* Temp Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="sim-temp" className="flex items-center gap-1 cursor-pointer">Temperature</label>
                <span className="text-emerald-800 dark:text-emerald-400">{simTemp}°C</span>
              </div>
              <input 
                type="range" 
                id="sim-temp"
                min="15" 
                max="42" 
                value={simTemp} 
                onChange={(e) => setSimTemp(parseInt(e.target.value))}
                className="w-full accent-emerald-600 dark:accent-emerald-450 bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
              <span className="text-[9px] text-slate-450 dark:text-slate-350 block">Optimal vector breeding occurs between 25°C and 32°C.</span>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="sim-humidity" className="cursor-pointer">Relative Humidity</label>
                <span className="text-emerald-800 dark:text-emerald-400">{simHumidity}%</span>
              </div>
              <input 
                type="range" 
                id="sim-humidity"
                min="20" 
                max="100" 
                value={simHumidity} 
                onChange={(e) => setSimHumidity(parseInt(e.target.value))}
                className="w-full accent-emerald-600 dark:accent-emerald-450 bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
              <span className="text-[9px] text-slate-450 dark:text-slate-350 block">High humidity extends mosquito lifespan, accelerating malaria cycles.</span>
            </div>

            {/* Rainfall Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="sim-rainfall" className="cursor-pointer">Monthly Rainfall equivalent</label>
                <span className="text-emerald-800 dark:text-emerald-400">{simRainfall} mm</span>
              </div>
              <input 
                type="range" 
                id="sim-rainfall"
                min="0" 
                max="400" 
                value={simRainfall} 
                onChange={(e) => setSimRainfall(parseInt(e.target.value))}
                className="w-full accent-emerald-600 dark:accent-emerald-450 bg-slate-100 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
              <span className="text-[9px] text-slate-450 dark:text-slate-350 block">Floods (&gt;250mm) trigger immediate cholera spikes by inundating open wells.</span>
            </div>
          </div>
        </div>

        {/* Right column - Realtime vector propagation calculations output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Meteorological Risk Modeling</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--primary-green))] leading-tight">
              Real-time Mosquito & Water-borne Outbreak Forecasts
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When meteorological factors align, vector propagation risks spike. Outpost staff are alerted automatically to distribute prophylaxis, test community shallow wells, and stock vaccine reserves.
            </p>
          </div>

          {/* Dynamic Vector Outputs */}
          <div className="space-y-3">
            {activeRisks.map((risk) => (
              <div key={risk.id} className="p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">{risk.name}</h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${risk.color}`}>
                      {risk.text}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600">{risk.description}</p>
                </div>
                
                {/* Score bar */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 min-w-8 text-right">{risk.score}%</span>
                  <div className="w-24 bg-slate-150 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        risk.score >= 80 ? 'bg-rose-500' :
                        risk.score >= 50 ? 'bg-amber-500' :
                        risk.score >= 30 ? 'bg-sky-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE COMPONENT 2: GRADE TASTER ================= */}
      <section className="space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Clinical Evidence Audit</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--primary-green))] leading-tight">
            Vetted Botanical Monographs & GRADE Matrices
          </h2>
          <p className="text-sm text-slate-600">
            Select a remedy to preview its scientific properties, active constituents, and demographic alerts.
          </p>
        </div>

        {/* Grid selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Remedy Selector List (Left) */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            {previewRemedies.map((rem) => (
              <button
                key={rem.id}
                onClick={() => setSelectedRemedyId(rem.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                  selectedRemedyId === rem.id 
                    ? 'bg-emerald-950 border-emerald-950 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-700/30 dark:hover:border-emerald-500/30'
                }`}
              >
                <div className="space-y-0.5">
                  <h4 className={`text-xs font-extrabold uppercase tracking-wide ${selectedRemedyId === rem.id ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {rem.name}
                  </h4>
                  <span className={`text-[10px] italic ${selectedRemedyId === rem.id ? 'text-emerald-300' : 'text-slate-600'}`}>
                    {rem.scientificName}
                  </span>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${selectedRemedyId === rem.id ? 'translate-x-1 text-emerald-400' : 'text-slate-500'}`} />
              </button>
            ))}
          </div>

          {/* Active Card Viewer (Right) */}
          <div className="lg:col-span-8 glass-panel p-6 sm:p-8 bg-white dark:bg-slate-900/60 border-emerald-100 dark:border-emerald-950/50 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border ${
                    activeRemedy.category === 'botanical' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-850/50' 
                      : 'bg-sky-50 dark:bg-sky-950/30 text-sky-850 dark:text-sky-300 border-sky-200 dark:border-sky-850/50'
                  }`}>
                    {activeRemedy.category}
                  </span>
                  <h3 className="text-xl font-black text-slate-850 dark:text-slate-100 mt-1">{activeRemedy.name}</h3>
                  <span className="text-xs italic text-slate-600">{activeRemedy.scientificName}</span>
                </div>

                {/* GRADE outcomes */}
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-center">
                    <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">GRADE Quality</span>
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">{activeRemedy.gradeQuality}</span>
                  </div>
                  <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-lg text-center">
                    <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">Recommendation</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{activeRemedy.recStrength}</span>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">Active Constituents</h5>
                    <p className="text-slate-600 dark:text-slate-350 font-semibold text-[11px] leading-relaxed">{activeRemedy.activeCompounds}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">Preparation & Administration</h5>
                    <p className="text-slate-600 dark:text-slate-350 text-[11px] leading-relaxed">{activeRemedy.desc}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">Safety & Adverse Events</h5>
                    <p className="text-slate-600 dark:text-slate-350 text-[11px] leading-relaxed">{activeRemedy.safety}</p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">Traditional Respect Rating</h5>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full inline-block ${
                        activeRemedy.traditionalAlignment === 'High' ? 'bg-emerald-500' :
                        activeRemedy.traditionalAlignment === 'Moderate' ? 'bg-sky-500' : 'bg-slate-400'
                      }`} />
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{activeRemedy.traditionalAlignment} Traditional Alignment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Susceptibility Alert Banner */}
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-200 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h6 className="font-black uppercase tracking-wider text-[9px] text-rose-800 dark:text-rose-300">Critical Demographic Precaution Alert</h6>
                <p className="text-[10px] leading-relaxed mt-0.5 text-rose-900 dark:text-rose-200">{activeRemedy.contras}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE COMPONENT 3: GEOFENCE SIMULATOR ================= */}
      <section id="sponsorships" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left column - text explanation */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Humanitarian Cross-Subsidization</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--primary-green))] leading-tight">
              Buy One, Give One (BOGO) & GPS Geofencing Waivers
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We operate on a solidarity-first pricing model. To support off-grid outpost operations, we grant instant, free, perpetual licenses to health workers operating in remote regions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Urban Supported Accounts</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Clinicians in private urban hubs (Nairobi, Mombasa, Kisumu) pay a one-time fee of 1,500 KES. This completely funds cloud servers, netlify sync pipelines, and database updates.
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Remote Outpost Waivers</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Facilities operating &gt;50km away from major urban hubs are granted instant, automatic free waivers. Clinicians check their coordinates via hardware GPS to unlock all toolkit items.
              </p>
            </div>
          </div>

          {/* Partner Logotypes mock-up */}
          <div className="space-y-2 pt-2 border-t border-slate-200/50">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest block">Trusted Outpost Networks</span>
            <div className="flex flex-wrap items-center gap-6 text-slate-600 font-extrabold font-outfit text-sm">
              <span className="flex items-center gap-1"><Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> AMREF BEDSIDE</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Compass className="h-4 w-4 text-sky-500 dark:text-sky-400" /> RED CROSS KENYA</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Sprout className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> KENYA HEALTH MIN.</span>
            </div>
          </div>
        </div>

        {/* Right column - geofence simulator widget */}
        <div className="lg:col-span-5 glass-panel p-6 bg-white dark:bg-slate-900/60 border-emerald-100/50 dark:border-emerald-950/50 shadow-xl space-y-6">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-sky-850 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-850/50">
              GPS Sandbox
            </span>
            <h3 className="text-base font-black text-slate-850 dark:text-slate-100">Geofencing Distance Sandbox</h3>
            <p className="text-[11px] text-slate-600">
              Simulate outpost coordinates to test if they qualify for the free humanitarian PRO waiver.
            </p>
          </div>

          {/* Quick preset locations */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(MOCK_OUTPOSTS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => handleTestGeofence(key)}
                className={`py-2 px-1 text-center rounded-lg border text-[10px] font-black uppercase transition-all ${
                  testLocation === key && !customGeofenceResult
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Preset details */}
          {!customGeofenceResult && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <h5 className="text-[10px] font-black text-slate-700 dark:text-slate-350 uppercase">{MOCK_OUTPOSTS[testLocation].name}</h5>
              <p className="text-[9px] text-slate-600 leading-normal">{MOCK_OUTPOSTS[testLocation].description}</p>
              <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50">
                <span className="text-slate-400">Eligibility Status:</span>
                <span className={`font-black uppercase text-[9px] ${testLocation === 'lodwar' ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'}`}>
                  {testLocation === 'lodwar' ? 'FREE OUTPOST WAIVER ✓' : 'BOGO LICENSE REQUIRED ✗'}
                </span>
              </div>
            </div>
          )}

          {/* Custom coords tester */}
          <form onSubmit={handleCustomGeofence} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-850 dark:text-slate-100 uppercase">Test Custom Coordinates</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="sim-custom-lat" className="text-[8px] uppercase font-bold text-slate-500 cursor-pointer">Latitude</label>
                <input 
                  type="number" 
                  id="sim-custom-lat"
                  step="0.0001" 
                  required
                  placeholder="e.g. 3.1197" 
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-800 text-slate-700 dark:text-slate-350"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sim-custom-lon" className="text-[8px] uppercase font-bold text-slate-500 cursor-pointer">Longitude</label>
                <input 
                  type="number" 
                  id="sim-custom-lon"
                  step="0.0001" 
                  required
                  placeholder="e.g. 35.5973" 
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-800 text-slate-700 dark:text-slate-350"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-1.5 bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Verify Coordinates
            </button>
          </form>

          {/* Custom Result Alert */}
          {customGeofenceResult && (
            <div className={`p-3 rounded-xl border text-[10px] space-y-1 leading-normal ${
              customGeofenceResult.isRemote 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-300' 
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-350'
            }`}>
              <div className="flex items-center gap-1.5 font-black uppercase text-[9px]">
                {customGeofenceResult.isRemote ? (
                  <>
                    <Unlock className="h-3.5 w-3.5 text-emerald-850 dark:text-emerald-400" />
                    Waiver Approved (Remote Outpost)
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-rose-850 dark:text-rose-400" />
                    License Required (Urban District)
                  </>
                )}
              </div>
              <p className="text-[9px] opacity-90">
                Your coordinates ({customGeofenceResult.lat.toFixed(3)}, {customGeofenceResult.lon.toFixed(3)}) are located **{Math.round(customGeofenceResult.minDistance)}km** from the nearest urban medical center.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================= FINAL CTA & CONVERSION MATRIX ================= */}
      <section className="bg-slate-900 rounded-3xl border border-slate-800 text-center p-8 sm:p-12 md:p-16 space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          <span className="text-[10px] tracking-widest font-black uppercase text-emerald-400 bg-emerald-950 border border-emerald-850 px-3 py-1 rounded-full inline-block">
            Launch Outpost Portal Today
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold !text-white leading-tight font-outfit">
            Ready to Deploy Clinical Sovereignty?
          </h2>
          <p className="!text-slate-300 text-xs sm:text-sm leading-relaxed">
            Enter the portal now. The free tier is always open and fully caches itself for off-grid operations. Urban practitioners can unlock the complete clinical toolkit instantly.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto relative z-10 pt-4 text-left">
          {/* Card A: Free Outpost / Basic */}
          <div className="p-6 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black !text-white uppercase tracking-wider">Outpost Basic / Free</h4>
                <span className="text-2xl font-black !text-white font-outfit">Free</span>
                <span className="text-[10px] !text-slate-300 block">Exempt for remote clinics & reference</span>
              </div>
              <ul className="space-y-2 text-[10px] !text-slate-200">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Full Condition Index & Synonyms
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Vetted Botanical Monographs
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> GRADE Quality Outcomes Matrix
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Local PWA Cache & Storage Sync
                </li>
              </ul>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('this_visited_before', 'true');
                onNavigate('dashboard');
              }}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-all text-center cursor-pointer"
            >
              Enter Free Portal
            </button>
          </div>

          {/* Card B: Sponsored Pro BOGO */}
          <div className="p-6 bg-gradient-to-br from-emerald-950 to-slate-950 border border-emerald-800/40 rounded-2xl flex flex-col justify-between space-y-6 relative">
            <span className="absolute -top-3 right-4 bg-emerald-500 text-white font-black uppercase text-[8px] px-2 py-0.5 rounded-full border border-emerald-400 shadow">
              Recommended Model
            </span>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black !text-white uppercase tracking-wider">Urban Pro (BOGO)</h4>
                <span className="text-2xl font-black !text-emerald-400 font-outfit">1,500 KES</span>
                <span className="text-[10px] !text-emerald-200 block">Sponsor one off-grid clinic forever</span>
              </div>
              <ul className="space-y-2 text-[10px] !text-emerald-100">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> All Free features + Advanced Toolkit
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> WHO Plan C Pediatric Hydration
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Climate Outbreak Threat Forecast
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Visual Anatomy & Pathology Atlas
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Bedside IMCI Diagnostic Trees
                </li>
              </ul>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('this_visited_before', 'true');
                onNavigate('dashboard'); // Takes them to paywall inside dashboard or bypasses if offline
              }}
              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer"
            >
              Get PRO / Sponsor Clinic
            </button>
          </div>
        </div>
      </section>

      {/* Footer / CMS Access Link */}
      <footer className="pt-8 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© 2026 Tropical Health Information System (THIS). All rights reserved.</span>
        <div className="flex gap-4">
          <a href="/admin/" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-colors">Admin Portal (CMS)</a>
          <span>•</span>
          <button 
            onClick={() => setShowInviteModal(true)} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 font-bold bg-transparent border-0 cursor-pointer transition-colors"
          >
            Request CMS Invite
          </button>
        </div>
      </footer>

      {/* Invite Request Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
            <button 
              onClick={() => {
                setShowInviteModal(false);
                setInviteSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {inviteSubmitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Submitted ✓</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Thank you! Your access request for the THIS admin portal has been queued. The local system administrators will review your credentials and issue a Netlify Identity invite email shortly.
                </p>
                <button 
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteSubmitted(false);
                  }}
                  className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-outfit">Request Admin Access</h3>
                  <p className="text-[11px] text-slate-500">
                    Outpost clinical officers and researchers can request credentials to manage clinical entries, guidebook protocols, and botanical specs.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="inv-name" className="text-[9px] uppercase font-bold text-slate-500 block">Full Name</label>
                    <input 
                      type="text" 
                      id="inv-name"
                      required
                      placeholder="e.g. Dr. Amani Joseph" 
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-800 text-slate-700 dark:text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="inv-email" className="text-[9px] uppercase font-bold text-slate-500 block">Email Address</label>
                    <input 
                      type="email" 
                      id="inv-email"
                      required
                      placeholder="e.g. amani@outpost.org" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-800 text-slate-700 dark:text-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="inv-outpost" className="text-[9px] uppercase font-bold text-slate-500 block">Outpost Location</label>
                      <input 
                        type="text" 
                        id="inv-outpost"
                        required
                        placeholder="e.g. Turkana County" 
                        value={inviteOutpost}
                        onChange={(e) => setInviteOutpost(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-800 text-slate-700 dark:text-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inv-role" className="text-[9px] uppercase font-bold text-slate-500 block">Clinical Role</label>
                      <select 
                        id="inv-role"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-800 text-slate-700 dark:text-slate-300"
                      >
                        <option value="clinical-officer">Clinical Officer</option>
                        <option value="medical-officer">Medical Officer / Doctor</option>
                        <option value="nurse">Outpost Nurse</option>
                        <option value="botanist">Ethnobotanist / Researcher</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="inv-reason" className="text-[9px] uppercase font-bold text-slate-500 block">Reason for Admin Access</label>
                    <textarea 
                      id="inv-reason"
                      required
                      rows={3}
                      placeholder="Specify your medical assignment or database additions..." 
                      value={inviteReason}
                      onChange={(e) => setInviteReason(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-800 text-slate-700 dark:text-slate-300 resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={inviteSubmitting}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-800/50 text-white font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center"
                >
                  {inviteSubmitting ? "Submitting Request..." : "Submit Invite Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
