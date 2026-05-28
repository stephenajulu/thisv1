import React, { useState, useEffect } from 'react';
import { ShieldCheck, Layers, ShieldAlert, Stethoscope, Activity, Sprout, Settings, Calculator, CloudRain, ChevronDown, MapPin } from 'lucide-react';
import Navigator from './components/Navigator';
import EvidenceMatrix from './components/EvidenceMatrix';
import SafetyChecker from './components/SafetyChecker';
import ClinicianReference from './components/ClinicianReference';
import DosageCalculator from './components/DosageCalculator';
import WeatherThreatForecast from './components/WeatherThreatForecast';
import { ConditionPage, RemedyPage } from './components/PageTemplates';
import { isProUnlocked, clearProMembership } from './utils/membership';
import ProPaywall from './components/ProPaywall';
import VisualAtlas from './components/VisualAtlas';
import EpidemicHeatmap from './components/EpidemicHeatmap';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeEntityId, setActiveEntityId] = useState(null);
  const [clinicianMode, setClinicianMode] = useState(false);
  const [showToolkit, setShowToolkit] = useState(false);
  const [proUnlocked, setProUnlocked] = useState(() => isProUnlocked());
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem('this_selected_region') || 'nairobi';
  });

  const getProBadgeText = () => {
    if (localStorage.getItem('this_pro_waiver') === 'active') {
      const gpsLog = localStorage.getItem('this_pro_waiver_gps');
      if (gpsLog) {
        try {
          const log = JSON.parse(gpsLog);
          if (log.keyRedeemed) return `NGO (${log.keyRedeemed})`;
        } catch (e) {}
      }
      return 'Waiver Active';
    }
    if (localStorage.getItem('this_pro_paid') === 'active') {
      return 'BOGO Licensed';
    }
    return 'PRO Active';
  };

  const handleUnlockSuccess = () => {
    setProUnlocked(true);
  };

  // Sync browser back-button history and dynamic shareable URLs
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const params = path.split('/').filter(Boolean);
      
      if (params[0] === 'admin') {
        window.location.href = '/admin/index.html';
        return;
      }
      
      if (params[0] === 'condition' && params[1]) {
        setActivePage('condition');
        setActiveEntityId(params[1]);
      } else if (params[0] === 'remedy' && params[1]) {
        setActivePage('remedy');
        setActiveEntityId(params[1]);
      } else if (['matrix', 'safety', 'dosage', 'weather', 'atlas', 'clinician', 'heatmap'].includes(params[0])) {
        setActivePage(params[0]);
        setActiveEntityId(null);
      } else {
        setActivePage('dashboard');
        setActiveEntityId(null);
      }
    };

    // Listen to history pop events
    window.addEventListener('popstate', handleUrlChange);
    
    // Initial parse
    handleUrlChange();

    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const navigateTo = (page, id = null) => {
    let url = '/';
    if (page !== 'dashboard') {
      url = id ? `/${page}/${id}` : `/${page}`;
    }
    
    window.history.pushState(null, '', url);
    setActivePage(page);
    setActiveEntityId(id);
  };

  // Toggle clinician mode class on body
  useEffect(() => {
    if (clinicianMode) {
      document.body.classList.add('clinician-mode');
    } else {
      document.body.classList.remove('clinician-mode');
    }
  }, [clinicianMode]);

  return (
    <div className="min-h-screen pb-16 flex flex-col justify-between">
      {/* Header and Branding */}
      <div>
        <header className="sticky top-0 z-50 no-print glass-panel !rounded-none border-t-0 border-x-0 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div 
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="bg-[hsl(var(--primary-green))] p-2 rounded-lg text-white shadow-md">
                <Sprout className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[hsl(var(--primary-green))] leading-none tracking-tight m-0">
                  THIS
                </h1>
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-600 block mt-0.5">
                  Tropical Health Information System
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap justify-center">
              {[
                { id: 'dashboard', label: 'Search', icon: Activity },
                { id: 'matrix', label: 'Evidence Matrix', icon: Layers },
                { id: 'safety', label: 'Safety Checker', icon: ShieldAlert }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activePage === tab.id || (tab.id === 'dashboard' && ['condition', 'remedy'].includes(activePage))
                      ? 'bg-white text-[hsl(var(--primary-green))] shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}

              {/* Grouped Clinical Toolkit Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowToolkit(true)}
                onMouseLeave={() => setShowToolkit(false)}
              >
                <button
                  onClick={() => setShowToolkit(!showToolkit)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    ['dosage', 'weather', 'clinician'].includes(activePage)
                      ? 'bg-white text-[hsl(var(--primary-green))] shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>Clinical Toolkit</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showToolkit ? 'rotate-180' : ''}`} />
                </button>

                {/* Floating Absolute Dropdown */}
                {showToolkit && (
                  <div className="absolute top-[90%] right-0 lg:left-0 pt-2.5 w-48 z-50 animate-fade-in no-print">
                    <div className="bg-white/95 border border-slate-200/60 shadow-lg rounded-xl py-1.5 flex flex-col backdrop-blur-md">
                      {[
                        { id: 'dosage', label: 'Dosage Calculator', icon: Calculator },
                        { id: 'weather', label: 'Weather Forecast', icon: CloudRain },
                        { id: 'atlas', label: 'Visual Medical Atlas', icon: Layers },
                        { id: 'heatmap', label: 'Epidemic Outbreak Map', icon: Activity },
                        { id: 'clinician', label: 'Clinician Quick-Ref', icon: Stethoscope }
                      ].map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            navigateTo(sub.id);
                            setShowToolkit(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-emerald-50 hover:text-[hsl(var(--primary-green))] transition-colors ${
                            activePage === sub.id ? 'text-[hsl(var(--primary-green))] bg-emerald-50/50 font-bold' : 'text-slate-600'
                          }`}
                        >
                          <sub.icon className="h-3.5 w-3.5" />
                          <span>{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Switcher & Membership Indicators */}
            <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 pl-0 lg:pl-4">
              {/* Active Region County Context Selector */}
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-outfit">
                  County Context:
                </span>
                <div className="relative">
                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      const reg = e.target.value;
                      setSelectedRegion(reg);
                      localStorage.setItem('this_selected_region', reg);
                      window.dispatchEvent(new Event('this_region_changed'));
                    }}
                    className="appearance-none bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-lg pl-2 pr-7 py-1 text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 text-slate-700 transition-all font-outfit"
                  >
                    <option value="nairobi">Nairobi (Highlands)</option>
                    <option value="mombasa">Mombasa (Coast)</option>
                    <option value="lodwar">Lodwar (Turkana Arid)</option>
                    <option value="kakamega">Kakamega (Western)</option>
                  </select>
                  <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Clinician Mode Switcher */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${clinicianMode ? 'text-emerald-800' : 'text-slate-400'}`}>
                  Clinician Mode
                </span>
                <button 
                  onClick={() => {
                    setClinicianMode(!clinicianMode);
                    if (!clinicianMode) {
                      navigateTo('clinician');
                    } else {
                      navigateTo('dashboard');
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    clinicianMode ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span 
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      clinicianMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Membership Status Badge */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                {proUnlocked ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center shadow-sm border border-amber-600">
                      ★ {getProBadgeText()}
                    </span>
                    <button 
                      onClick={() => {
                        clearProMembership();
                        setProUnlocked(false);
                        navigateTo('dashboard');
                      }}
                      className="text-[9px] text-slate-400 hover:text-rose-600 hover:underline cursor-pointer transition-colors"
                      title="Reset PRO status to test the Paywall/GPS waiver flow again"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shadow-inner">
                    Free Version
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {activePage === 'dashboard' && (
            <Navigator onNavigate={navigateTo} selectedRegion={selectedRegion} />
          )}

          {activePage === 'matrix' && (
            <EvidenceMatrix onNavigate={navigateTo} selectedRegion={selectedRegion} />
          )}

          {activePage === 'safety' && (
            <SafetyChecker selectedRegion={selectedRegion} />
          )}

          {activePage === 'dosage' && (
            proUnlocked ? <DosageCalculator selectedRegion={selectedRegion} /> : <ProPaywall onUnlockSuccess={handleUnlockSuccess} />
          )}

          {activePage === 'weather' && (
            proUnlocked ? <WeatherThreatForecast selectedRegion={selectedRegion} /> : <ProPaywall onUnlockSuccess={handleUnlockSuccess} />
          )}

          {activePage === 'atlas' && (
            proUnlocked ? <VisualAtlas selectedRegion={selectedRegion} /> : <ProPaywall onUnlockSuccess={handleUnlockSuccess} />
          )}

          {activePage === 'clinician' && (
            proUnlocked ? <ClinicianReference selectedRegion={selectedRegion} /> : <ProPaywall onUnlockSuccess={handleUnlockSuccess} />
          )}

          {activePage === 'heatmap' && (
            proUnlocked ? <EpidemicHeatmap selectedRegion={selectedRegion} /> : <ProPaywall onUnlockSuccess={handleUnlockSuccess} />
          )}

          {activePage === 'condition' && (
            <ConditionPage 
              id={activeEntityId} 
              onBack={() => navigateTo('dashboard')} 
              onNavigate={navigateTo}
              selectedRegion={selectedRegion}
            />
          )}

          {activePage === 'remedy' && (
            <RemedyPage 
              id={activeEntityId} 
              onBack={() => navigateTo('dashboard')} 
              onNavigate={navigateTo}
              selectedRegion={selectedRegion}
            />
          )}
        </main>
      </div>

      {/* Modern Scientific Footer */}
      <footer className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-200/50 w-full text-center space-y-4 no-print">
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Evidence Graded (GRADE)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers className="h-4 w-4 text-sky-500" /> Relational Cross-links
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Stethoscope className="h-4 w-4 text-amber-500" /> Clinician Triaged
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Settings className="h-4 w-4 text-emerald-700 animate-spin-slow" /> PWA Cached Offline
          </span>
        </div>
        <p className="text-[10px] text-slate-400 max-w-lg mx-auto leading-relaxed">
          THIS (Tropical Health Information System) is an educational documentation database referencing peer-reviewed ethnobotanical and clinical studies. Always consult an expert medical practitioner before initiating severe tropical treatment plans.
        </p>
      </footer>
    </div>
  );
}
