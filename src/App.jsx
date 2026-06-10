import React, { useState, useEffect } from 'react';
import { ShieldCheck, Layers, ShieldAlert, Stethoscope, Activity, Sprout, Settings, Calculator, CloudRain, ChevronDown, MapPin, Sparkles, BookOpen, GitBranch, Sun, Moon, CloudUpload, RefreshCw, AlertCircle, X, Globe, Eye } from 'lucide-react';
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
import SynergyMatrix from './components/SynergyMatrix';
import ClinicalFlowcharts from './components/ClinicalFlowcharts';

// New master features
import Blog from './components/Blog';
import CommunityVault from './components/CommunityVault';
import EthnobotanyPipeline from './components/EthnobotanyPipeline';
import LandingPage from './components/LandingPage';
import { database } from './data/database';
import { useI18n } from './utils/i18n';

export default function App() {
  const { lang, changeLanguage, t } = useI18n();
  const [activePage, setActivePage] = useState(() => {
    if (typeof window === 'undefined') return 'landing';
    const path = window.location.pathname;
    const params = path.split('/').filter(Boolean);
    if (params.length > 0) return 'dashboard'; // Handled by handleUrlChange
    const hasVisited = localStorage.getItem('this_landing_visited');
    return hasVisited === 'true' ? 'dashboard' : 'landing';
  });
  const [activeEntityId, setActiveEntityId] = useState(null);
  const [clinicianMode, setClinicianMode] = useState(false);
  const [showToolkit, setShowToolkit] = useState(false);
  const [proUnlocked, setProUnlocked] = useState(() => isProUnlocked());
  const [selectedRegion, setSelectedRegion] = useState(() => {
    return localStorage.getItem('this_selected_region') || 'nairobi';
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('this_high_contrast') === 'active';
  });

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Navigator state persistence
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [navActiveTab, setNavActiveTab] = useState('all');
  const [navVisibleCount, setNavVisibleCount] = useState(12);
  const [navScrollPosition, setNavScrollPosition] = useState(0);

  // Sync Queue States
  const [syncQueue, setSyncQueue] = useState([]);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'pending' | 'syncing' | 'error'
  const [showSyncDrawer, setShowSyncDrawer] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [syncSuccess, setSyncSuccess] = useState('');

  const reloadSyncQueue = () => {
    const queue = localStorage.getItem('this_pending_sync_queue');
    if (queue) {
      try {
        const parsed = JSON.parse(queue);
        setSyncQueue(parsed);
        if (parsed.length > 0) {
          setSyncStatus('pending');
        } else {
          setSyncStatus('synced');
        }
      } catch (e) {
        setSyncQueue([]);
        setSyncStatus('synced');
      }
    } else {
      setSyncQueue([]);
      setSyncStatus('synced');
    }
  };

  useEffect(() => {
    reloadSyncQueue();
    window.addEventListener('this_sync_queue_changed', reloadSyncQueue);
    return () => window.removeEventListener('this_sync_queue_changed', reloadSyncQueue);
  }, []);

  const triggerSync = async () => {
    if (syncQueue.length === 0) return;
    
    if (typeof window.netlifyIdentity === 'undefined') {
      setSyncError('Netlify Identity is not initialized. Please verify your internet connection.');
      setSyncStatus('error');
      return;
    }

    const currentUser = window.netlifyIdentity.currentUser();
    if (!currentUser) {
      setSyncError('You must be logged in as an administrator to sync. Opening login gateway...');
      setSyncStatus('error');
      window.netlifyIdentity.open('login');
      return;
    }

    setSyncStatus('syncing');
    setSyncError('');
    setSyncSuccess('');

    try {
      const tokenObj = await currentUser.jwt();
      const jwtToken = tokenObj;

      const payload = {
        outpostCounty: selectedRegion,
        userName: currentUser.user_metadata?.full_name || currentUser.email || 'Outpost Administrator',
        syncQueue: syncQueue
      };

      const response = await fetch('/.netlify/functions/sync-gateway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Sync gateway returned ${response.status}`);
      }

      const responseData = await response.json();
      
      localStorage.removeItem('this_pending_sync_queue');
      reloadSyncQueue();
      setSyncStatus('synced');
      setSyncSuccess(`Synchronized successfully! Created PR #${responseData.prNumber || 'Audit Queue'}.`);
      
      const currentLogs = localStorage.getItem('this_admin_audit_logs');
      let parsedLogs = [];
      if (currentLogs) {
        try { parsedLogs = JSON.parse(currentLogs); } catch(e) {}
      }
      const newAudit = {
        id: Date.now(),
        action: "Cloud Sync Completed",
        user: currentUser.email || "Auditing Officer",
        timestamp: new Date().toLocaleString(),
        details: `Synchronized ${payload.syncQueue.length} records. Unique PR #${responseData.prNumber || 'N/A'}.`
      };
      localStorage.setItem('this_admin_audit_logs', JSON.stringify([newAudit, ...parsedLogs]));
      window.dispatchEvent(new Event('this_admin_audit_logs_changed'));

    } catch (e) {
      setSyncError(e.message || 'An error occurred during synchronization.');
      setSyncStatus('error');
    }
  };

  // Toggle high-contrast accessibility class on document body
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
      localStorage.setItem('this_high_contrast', 'active');
    } else {
      document.body.classList.remove('high-contrast');
      localStorage.setItem('this_high_contrast', 'inactive');
    }
  }, [highContrast]);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('this_dark_mode') === 'active';
  });

  // Toggle dark mode class on document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('this_dark_mode', 'active');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('this_dark_mode', 'inactive');
    }
  }, [darkMode]);

  // Dynamic page document title update for SEO & History utility (Task 3.1)
  useEffect(() => {
    let title = "THIS - Tropical Health Information System";
    if (activePage === 'condition' && activeEntityId) {
      const name = database.conditions?.find(c => c.id === activeEntityId)?.name || "Condition";
      title = `${name} | THIS Outpost Triage`;
    } else if (activePage === 'remedy' && activeEntityId) {
      const name = database.remedies?.find(r => r.id === activeEntityId)?.name || "Remedy";
      title = `${name} | THIS Outpost Triage`;
    } else if (activePage !== 'dashboard' && activePage !== 'landing') {
      const capitalized = activePage.charAt(0).toUpperCase() + activePage.slice(1);
      title = `${capitalized} | THIS Outpost Triage`;
    }
    document.title = title;
  }, [activePage, activeEntityId]);

  // Focus trapping logic for accessible modal drawers (Task 2.3)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const activeDrawer = document.querySelector('.focus-trap-drawer');
      if (!activeDrawer) return;

      const focusables = activeDrawer.querySelectorAll('button, select, input, textarea, a, [tabindex="0"]');
      if (focusables.length === 0) return;

      const firstFocusable = focusables[0];
      const lastFocusable = focusables[focusables.length - 1];

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    if (showSettingsDrawer || showSyncDrawer) {
      window.addEventListener('keydown', handleKeyDown);
      // Auto focus the close button or first element in the drawer on open
      const timeoutId = setTimeout(() => {
        const activeDrawer = document.querySelector('.focus-trap-drawer');
        const firstBtn = activeDrawer?.querySelector('button');
        firstBtn?.focus();
      }, 50);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timeoutId);
      };
    }
  }, [showSettingsDrawer, showSyncDrawer]);

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
      } else if (['landing', 'dashboard', 'matrix', 'safety', 'dosage', 'weather', 'atlas', 'clinician', 'heatmap', 'synergy', 'blog', 'vault', 'submissions', 'flowcharts'].includes(params[0])) {
        setActivePage(params[0]);
        setActiveEntityId(null);
      } else {
        const hasVisited = localStorage.getItem('this_landing_visited');
        if (hasVisited === 'true') {
          setActivePage('dashboard');
        } else {
          setActivePage('landing');
        }
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
    if (page === 'dashboard') {
      url = '/dashboard';
    } else if (page === 'landing') {
      url = '/landing';
      // Reset dashboard search/scroll when going to landing page
      setNavSearchQuery('');
      setNavActiveTab('all');
      setNavVisibleCount(12);
      setNavScrollPosition(0);
    } else {
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
              onClick={() => navigateTo('landing')}
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
                { id: 'dashboard', label: t('search'), icon: Activity },
                { id: 'matrix', label: t('matrix'), icon: Layers },
                { id: 'safety', label: t('safety'), icon: ShieldAlert }
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
                    ['dosage', 'weather', 'clinician', 'synergy', 'atlas', 'heatmap', 'blog', 'vault', 'submissions', 'flowcharts'].includes(activePage)
                      ? 'bg-white text-[hsl(var(--primary-green))] shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>{t('toolkit')}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showToolkit ? 'rotate-180' : ''}`} />
                </button>

                {/* Floating Absolute Dropdown */}
                {showToolkit && (
                  <div className="absolute top-[90%] right-0 lg:left-0 pt-2.5 w-52 z-50 animate-fade-in no-print">
                    <div className="bg-white/95 border border-slate-200/60 shadow-lg rounded-xl py-1.5 flex flex-col backdrop-blur-md">
                      {[
                        { id: 'dosage', label: t('dosage') || 'Dosage Calculator', icon: Calculator },
                        { id: 'weather', label: t('weatherForecast') || 'Weather Forecast', icon: CloudRain },
                        { id: 'atlas', label: t('atlas') || 'Visual Medical Atlas', icon: Layers },
                        { id: 'heatmap', label: t('outbreakMap') || 'Epidemic Outbreak Map', icon: Activity },
                        { id: 'synergy', label: t('synergyMatrix') || 'Synergy Explorer', icon: Sparkles },
                        { id: 'flowcharts', label: t('flowcharts') || 'Bedside Decision Trees', icon: GitBranch },
                        { id: 'clinician', label: t('clinicianRef') || 'Clinician Quick-Ref', icon: Stethoscope },
                        { id: 'blog', label: t('blog') || 'Clinical Blog', icon: BookOpen },
                        { id: 'vault', label: t('vault') || 'Community Vault', icon: Layers },
                        { id: 'submissions', label: t('submissions') || 'Ethnobotany Pipeline', icon: Sprout }
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
            <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-3 lg:pt-0 pl-0 lg:pl-4">
              {/* Sync Status Badge */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSyncDrawer(true)}
                  aria-expanded={showSyncDrawer}
                  aria-haspopup="dialog"
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black border transition-all flex items-center gap-1.5 ${
                    syncStatus === 'synced' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/50 shadow-sm' :
                    syncStatus === 'syncing' ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-850 dark:text-sky-400 border-sky-200 dark:border-sky-900/50 animate-pulse' :
                    syncStatus === 'error' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-455 border-rose-250 dark:border-rose-900/50' :
                    'bg-amber-50 dark:bg-amber-950/20 text-amber-850 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 shadow animate-pulse'
                  }`}
                  title="Open Clinical Sync Drawer"
                >
                  <span className={`h-2 w-2 rounded-full inline-block ${
                    syncStatus === 'synced' ? 'bg-emerald-600' :
                    syncStatus === 'syncing' ? 'bg-sky-600 animate-ping' :
                    syncStatus === 'error' ? 'bg-rose-600' :
                    'bg-amber-500 animate-ping'
                  }`} />
                  <span className="font-outfit uppercase">
                    {syncStatus === 'synced' ? t('synced') || 'Synced' :
                     syncStatus === 'syncing' ? t('syncing') || 'Syncing...' :
                     syncStatus === 'error' ? t('syncError') || 'Sync Error' :
                     `${syncQueue.length} ${t('pending') || 'Staged'}`}
                  </span>
                </button>
              </div>

              {/* Settings Gear trigger button */}
              <button
                onClick={() => setShowSettingsDrawer(true)}
                aria-expanded={showSettingsDrawer}
                aria-haspopup="dialog"
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 relative group"
                title="Open Outpost Settings Hub"
              >
                <Settings className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-emerald-700" />
                {/* Visual notification dot showing active overrides */}
                {(selectedRegion !== 'nairobi' || lang !== 'en' || clinicianMode || highContrast || darkMode) && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-800 animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {activePage === 'landing' && (
            <LandingPage onNavigate={navigateTo} />
          )}

          {activePage === 'dashboard' && (
            <Navigator 
              onNavigate={navigateTo} 
              selectedRegion={selectedRegion} 
              searchQuery={navSearchQuery}
              setSearchQuery={setNavSearchQuery}
              activeTab={navActiveTab}
              setActiveTab={setNavActiveTab}
              visibleCount={navVisibleCount}
              setVisibleCount={setNavVisibleCount}
              scrollPosition={navScrollPosition}
              setScrollPosition={setNavScrollPosition}
            />
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

          {activePage === 'synergy' && (
            proUnlocked ? <SynergyMatrix /> : <ProPaywall onUnlockSuccess={handleUnlockSuccess} />
          )}

          {activePage === 'flowcharts' && (
            proUnlocked ? <ClinicalFlowcharts selectedRegion={selectedRegion} /> : <ProPaywall onUnlockSuccess={handleUnlockSuccess} />
          )}

          {activePage === 'blog' && (
            <Blog onNavigate={navigateTo} />
          )}

          {activePage === 'vault' && (
            <CommunityVault onNavigate={navigateTo} />
          )}

          {activePage === 'submissions' && (
            <EthnobotanyPipeline />
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

      {/* Glassmorphic Sync Status Drawer overlay */}
      {showSyncDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in no-print bg-slate-900/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowSyncDrawer(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col justify-between animate-slide-in p-6 border-l border-slate-200 dark:border-slate-800 focus-trap-drawer">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <CloudUpload className="h-5 w-5 text-emerald-800 dark:text-emerald-400" />
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-outfit text-base uppercase tracking-wider">
                    Outpost Cloud Sync
                  </h3>
                </div>
                <button
                  onClick={() => setShowSyncDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {syncError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-950 dark:text-rose-200 text-xs font-bold flex items-start gap-2 mb-4">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black uppercase text-[10px] tracking-wider mb-0.5 text-rose-800 dark:text-rose-400">Sync Warning Alert</span>
                    {syncError}
                  </div>
                </div>
              )}

              {syncSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-xl text-emerald-950 dark:text-emerald-200 text-xs font-bold flex items-start gap-2 mb-4">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black uppercase text-[10px] tracking-wider mb-0.5 text-emerald-800 dark:text-emerald-400">Sync Completed Successfully</span>
                    {syncSuccess}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Outpost Region:</span>
                    <span className="text-slate-700 dark:text-slate-200 uppercase">{selectedRegion}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Pending Staged Updates:</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-extrabold">{syncQueue.length} items</span>
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[350px]">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staged Records Queue</h4>
                  {syncQueue.length > 0 ? (
                    syncQueue.map((item, index) => (
                      <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800/50 rounded-xl flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50 mr-2">
                            {item.collection}
                          </span>
                          <span className="font-extrabold">{item.data.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono italic">Staged</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      No unstaged changes cached in this browser. Approved traditional submissions are synchronized immediately.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 space-y-3">
              <p className="text-[10px] leading-relaxed text-slate-400">
                Outpost Cloud Sync pushes staged crowdsourced recipes into draft GitHub Pull Requests. Vetting boards evaluate medical claims according to WHO standard guidelines before committing to main registry files.
              </p>
              
              <button
                onClick={triggerSync}
                disabled={syncQueue.length === 0 || syncStatus === 'syncing'}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synchronizing Batch Staging...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" />
                    <span>Synchronize {syncQueue.length} Staged Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphic Outpost Settings Hub Drawer overlay */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in no-print bg-slate-900/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowSettingsDrawer(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col justify-between animate-slide-in p-6 border-l border-slate-200 dark:border-slate-800 focus-trap-drawer">
            <div className="overflow-y-auto pr-1">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-800 dark:text-emerald-400 animate-spin-slow" />
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-outfit text-base uppercase tracking-wider">
                    {t('settings') || 'Outpost Settings Hub'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Settings Sections */}
              <div className="space-y-6">
                {/* 1. Clinical Outpost Location */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/50">
                  <label 
                    htmlFor="settings-region-select"
                    className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{t('countyContext') || 'Clinical Outpost Location'}</span>
                  </label>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mb-3 leading-relaxed">
                    Select the active county region to overlay localized botanical names, local abundance scales, and regional ecological warnings.
                  </p>
                  <div className="relative">
                    <select
                      id="settings-region-select"
                      value={selectedRegion}
                      onChange={(e) => {
                        const reg = e.target.value;
                        setSelectedRegion(reg);
                        localStorage.setItem('this_selected_region', reg);
                        window.dispatchEvent(new Event('this_region_changed'));
                      }}
                      className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 hover:border-emerald-500 rounded-lg pl-3 pr-9 py-2 text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 transition-all font-outfit"
                    >
                      <option value="nairobi">Nairobi (Highlands)</option>
                      <option value="mombasa">Mombasa (Coast)</option>
                      <option value="lodwar">Lodwar (Turkana Arid)</option>
                      <option value="kakamega">Kakamega (Western)</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Language Translation Portal */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {t('language') || 'Bedside Translation Portal'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mb-3 leading-relaxed">
                    Translate clinical guidelines, matrix indexes, and warnings instantly into regional dialects.
                  </p>
                  <div 
                    role="group" 
                    aria-label="Bedside Translation Dialect options"
                    className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    {[
                      { code: 'en', flag: '🇬🇧', label: 'English' },
                      { code: 'sw', flag: '🇰🇪', label: 'Swahili' },
                      { code: 'fr', flag: '🇫🇷', label: 'French' }
                    ].map(item => (
                      <button
                        key={item.code}
                        onClick={() => changeLanguage(item.code)}
                        aria-pressed={lang === item.code}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          lang === item.code 
                            ? 'bg-white dark:bg-slate-800 text-[hsl(var(--primary-green))] dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100'
                        }`}
                        title={item.label}
                      >
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Clinician Mode Switcher */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/50">
                  <div className="flex justify-between items-center mb-2">
                    <label 
                      htmlFor="settings-clinician-switch"
                      className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200"
                    >
                      <Stethoscope className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{t('clinicianMode') || 'Authorized Clinician Mode'}</span>
                    </label>
                    <button 
                      id="settings-clinician-switch"
                      role="switch"
                      aria-checked={clinicianMode}
                      onClick={() => {
                        setClinicianMode(!clinicianMode);
                        if (!clinicianMode) {
                          navigateTo('clinician');
                        } else {
                          navigateTo('dashboard');
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        clinicianMode ? 'bg-emerald-600' : 'bg-slate-350 dark:bg-slate-700'
                      }`}
                    >
                      <span 
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          clinicianMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 leading-relaxed">
                    Unlocks guided WHO IMCI pediatric triage algorithms, RUCAM hepatotoxicity scoring metrics, and local patient record logs.
                  </p>
                </div>

                {/* 4. Accessibility and Reading Prefs (Contrast + Theme) */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-emerald-600 shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Visual & Reading Preferences
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Visual & Reading Preferences options">
                    {/* Contrast Toggle */}
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      aria-pressed={highContrast}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        highContrast 
                          ? 'bg-yellow-400 text-slate-950 border-yellow-500 shadow'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                      title={highContrast ? t('standardContrast') : t('highContrast')}
                    >
                      <span>👁</span>
                      <span>{highContrast ? "AAA Contrast" : "Low Vision"}</span>
                    </button>
 
                    {/* Dark Mode Toggle */}
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      aria-pressed={darkMode}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        darkMode 
                          ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-inner'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                      {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" /> : <Moon className="h-3.5 w-3.5 text-sky-600 shrink-0" />}
                      <span>{darkMode ? "Light Theme" : "Dark Theme"}</span>
                    </button>
                  </div>
                </div>

                {/* 5. Billing and License details */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      NGO Billing & Licensing
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mb-3 leading-relaxed">
                    Bedside tools are unlocked for non-governmental organizations via geofenced GPS waivers or regional community sponsorships.
                  </p>
                  
                  <div className="flex items-center justify-between bg-white dark:bg-slate-850 p-3 rounded-lg border border-slate-200 dark:border-slate-750">
                    <div className="flex items-center gap-2">
                      {proUnlocked ? (
                        <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm border border-amber-600 animate-scale-up">
                          ★ {getProBadgeText()}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-inner">
                          Free Version
                        </span>
                      )}
                    </div>
                    
                    {proUnlocked && (
                      <button 
                        onClick={() => {
                          clearProMembership();
                          setProUnlocked(false);
                          navigateTo('dashboard');
                        }}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-extrabold uppercase hover:underline tracking-wider transition-colors"
                        title="Reset PRO status to test the Paywall/GPS waiver flow again"
                      >
                        Reset Status
                      </button>
                    )}
                  </div>
                </div>

                {/* 6. Landing Page Link */}
                <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Product Home
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mb-3 leading-relaxed">
                    View the product landing page featuring the interactive outbreak vector simulator and humanitarian geofence sandbox.
                  </p>
                  <button
                    onClick={() => {
                      setShowSettingsDrawer(false);
                      navigateTo('landing');
                    }}
                    className="w-full py-2 bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    View Product Page
                  </button>
                </div>
              </div>
            </div>

            {/* Footer inside settings drawer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
              <p className="text-[9px] leading-relaxed text-slate-400 dark:text-slate-500 text-center font-mono">
                THIS v1.8.2 • Outpost Terminal ID: {selectedRegion.toUpperCase()}-OP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
