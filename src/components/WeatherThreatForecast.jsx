import React, { useState, useEffect } from 'react';
import { Thermometer, CloudRain, Droplets, AlertTriangle, ShieldCheck, RefreshCw, ChevronRight, MapPin, Navigation } from 'lucide-react';
import { database } from '../data/database';

const OUTPOSTS = {
  nairobi: { name: 'Nairobi (Highlands Hub)', lat: -1.2921, lon: 36.8219 },
  mombasa: { name: 'Mombasa (Coastal Wetlands)', lat: -4.0435, lon: 39.6682 },
  lodwar: { name: 'Lodwar (Turkana Arid Border)', lat: 3.1197, lon: 35.5973 },
  kakamega: { name: 'Kakamega (Tropical Rainforest)', lat: 0.2827, lon: 34.7519 },
  kisumu: { name: 'Kisumu (Lakeside Basin)', lat: -0.1022, lon: 34.7617 },
  garissa: { name: 'Garissa (Arid Savannah)', lat: -0.4536, lon: 39.6461 },
};

export default function WeatherThreatForecast({ selectedRegion }) {
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(70);
  const [rainfall, setRainfall] = useState(150);

  // Live Sync States
  const [selectedOutpost, setSelectedOutpost] = useState(() => localStorage.getItem('this_selected_outpost') || 'kakamega');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncError, setSyncError] = useState('');
  const [lastSyncedData, setLastSyncedData] = useState(null);

  const syncWeatherData = async (outpostId = selectedOutpost, forceGps = false) => {
    setIsSyncing(true);
    setSyncError('');
    setSyncStatus('Detecting outpost coordinates...');
    
    let lat, lon, labelName;

    if (outpostId === 'device-gps' || forceGps) {
      if (!navigator.geolocation) {
        setSyncError('GPS Geolocation is not supported by your device browser.');
        setIsSyncing(false);
        return;
      }
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        lat = pos.coords.latitude.toFixed(4);
        lon = pos.coords.longitude.toFixed(4);
        labelName = `Device GPS (${lat}, ${lon})`;
      } catch (err) {
        setSyncError('GPS timeout or permission denied. Falling back to pre-cached outpost.');
        setIsSyncing(false);
        return;
      }
    } else {
      const op = OUTPOSTS[outpostId];
      if (!op) {
        setSyncError('Invalid outpost selection.');
        setIsSyncing(false);
        return;
      }
      lat = op.lat;
      lon = op.lon;
      labelName = op.name;
    }

    setSyncStatus(`Connecting to Open-Meteo atmospheric servers...`);
    
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API server handshake error');
      
      const data = await response.json();
      
      const currentTemp = Math.round(data.current.temperature_2m);
      const currentHumidity = Math.round(data.current.relative_humidity_2m);
      
      // Calculate 7-day sum of precipitation and multiply by 4 to estimate monthly equivalent
      const precipArray = data.daily?.precipitation_sum || [];
      const weeklyPrecipSum = precipArray.reduce((sum, val) => sum + (Number(val) || 0), 0);
      const monthlyEquivalentPrecip = Math.round(weeklyPrecipSum * 4);

      // Update Sliders safely
      setTemperature(Math.max(10, Math.min(45, currentTemp)));
      setHumidity(Math.max(10, Math.min(100, currentHumidity)));
      setRainfall(Math.max(0, Math.min(400, monthlyEquivalentPrecip)));

      const syncStats = {
        location: labelName,
        temp: currentTemp,
        humidity: currentHumidity,
        rainfall: monthlyEquivalentPrecip,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setLastSyncedData(syncStats);
      setSyncStatus('Outbreak threat dials updated successfully!');
      localStorage.setItem('this_selected_outpost', outpostId);
    } catch (err) {
      console.error("Open-Meteo fetch failed:", err);
      setSyncError('Offline Mode: Unable to connect to Open-Meteo. Using pre-cached manual dials.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync on mount if network is active
  useEffect(() => {
    if (navigator.onLine) {
      syncWeatherData(selectedOutpost);
    } else {
      setSyncError('Offline Mode: Using cached environmental baseline sliders.');
    }
  }, []);

  const calculateDynamicVectorRisks = () => {
    const results = [];
    const climateSensitiveConditions = database.conditions.filter(c => c.climateThreatSchema);

    climateSensitiveConditions.forEach(cond => {
      const schema = cond.climateThreatSchema;
      let score = 10;

      // 1. Temperature Scoring
      if (schema.minTemp !== undefined && schema.maxTemp !== undefined) {
        if (temperature >= schema.minTemp && temperature <= schema.maxTemp) {
          score += 30;
        } else if (temperature > schema.maxTemp && schema.maxTemp === 99) {
          score += 30; // Open upper bound
        }
      }

      // 2. Humidity Scoring
      if (schema.minHumidity !== undefined) {
        if (humidity >= schema.minHumidity) {
          score += 30;
        }
      }

      // 3. Rainfall Scoring
      if (schema.minRainfall !== undefined && schema.maxRainfall !== undefined) {
        if (rainfall >= schema.minRainfall && rainfall <= schema.maxRainfall) {
          score += 30;
        } else if (rainfall > schema.maxRainfall && schema.maxRainfall === 999) {
          score += 30; // Open upper bound
        }
      }

      // Custom adjustments for specific diseases under extreme weather spikes
      if (cond.id === 'cholera') {
        if (rainfall >= 250) score = 100; // Flooding causes severe sewage mix
        else if (rainfall < 15 && temperature > 32) score = 75; // Stagnation/Drought cholera threat
      }

      const getRiskLabel = (s) => {
        if (s >= 80) return { label: "SEVERE THREAT", color: "bg-rose-500 text-white border-rose-600", text: "Severe" };
        if (s >= 50) return { label: "HIGH RISK", color: "bg-amber-500 text-white border-amber-600", text: "High" };
        if (s >= 30) return { label: "MODERATE RISK", color: "bg-sky-500 text-white border-sky-600", text: "Moderate" };
        return { label: "LOW RISK", color: "bg-emerald-500 text-white border-emerald-600", text: "Low" };
      };

      const labelDetails = getRiskLabel(score);

      results.push({
        id: cond.id,
        name: cond.name,
        category: cond.category,
        score,
        ...labelDetails,
        advisory: schema.advisory
      });
    });

    return results;
  };

  const risks = calculateDynamicVectorRisks();

  const getClinicalActions = () => {
    const actions = risks
      .filter(r => r.text === "Severe" || r.text === "High")
      .map(r => r.advisory);

    if (actions.length === 0) {
      actions.push("Routine weather surveillance. Active conditions fall within standard baseline risks. Maintain routine outpost vaccination schedules and deworming protocols.");
    }
    return actions;
  };

  const advisories = getClinicalActions();

  const handleReset = () => {
    setTemperature(28);
    setHumidity(70);
    setRainfall(150);
    setSyncError('');
    setSyncStatus('');
    setLastSyncedData(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-800 bg-white">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
          <CloudRain className="h-5.5 w-5.5 text-emerald-800" />
          Climate Weather Vector Threat Simulator
        </h2>
        <p className="text-xs text-slate-500">
          Simulate environmental parameter shifts or sync live regional meteorological REST APIs to calculate dynamic biological risk profiles for vector and water-borne pathogens.
        </p>
      </div>

      {/* ========================================================
          LIVE METEOROLOGICAL SYNC PANEL
          ======================================================== */}
      <div className="glass-panel p-5 bg-white border border-slate-200 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-700 animate-bounce" />
              Live Climate Sync (Open-Meteo API)
            </h3>
            <p className="text-xs text-slate-550 leading-relaxed">
              Auto-fetch live atmospheric parameters based on regional Kenyan clinical preset coordinates or direct device Geolocation scans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {selectedRegion && OUTPOSTS[selectedRegion] && selectedOutpost !== selectedRegion && (
              <button
                onClick={() => {
                  setSelectedOutpost(selectedRegion);
                  syncWeatherData(selectedRegion);
                }}
                className="px-3 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-250 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm font-outfit cursor-pointer"
                title={`Fast sync coordinates with active header county: ${OUTPOSTS[selectedRegion].name}`}
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                Sync with Active County ({selectedRegion})
              </button>
            )}

            <select
              value={selectedOutpost}
              onChange={(e) => {
                setSelectedOutpost(e.target.value);
                if (e.target.value !== 'device-gps') {
                  syncWeatherData(e.target.value);
                }
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex-1 md:flex-initial"
            >
              <option value="kakamega">Kakamega (Tropical Rainforest)</option>
              <option value="mombasa">Mombasa (Coastal Wetlands)</option>
              <option value="lodwar">Lodwar (Turkana Arid Border)</option>
              <option value="kisumu">Kisumu (Lakeside Basin)</option>
              <option value="garissa">Garissa (Arid Savannah)</option>
              <option value="nairobi">Nairobi (Highlands Hub)</option>
              <option value="device-gps">★ Use My Live Device GPS</option>
            </select>

            <button
              onClick={() => syncWeatherData(selectedOutpost)}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md justify-center flex-1 md:flex-initial cursor-pointer ${
                isSyncing 
                  ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-wait'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Syncing..." : "Sync Climate Data"}
            </button>
          </div>
        </div>

        {/* Sync Status Logs / Messages */}
        {syncStatus && !syncError && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-950 animate-scale-up">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
            <span>{syncStatus}</span>
          </div>
        )}

        {syncError && (
          <div className="p-3 bg-amber-50 border border-amber-250 text-amber-950 rounded-xl flex items-center gap-2 text-xs font-bold animate-scale-up">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {lastSyncedData && (
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center animate-scale-up">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Synced Post</span>
              <strong className="text-xs font-bold text-slate-800 block truncate">{lastSyncedData.location}</strong>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Live Temp</span>
              <strong className="text-xs font-bold text-rose-700 block">{lastSyncedData.temp} °C</strong>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Live Humidity</span>
              <strong className="text-xs font-bold text-sky-700 block">{lastSyncedData.humidity} %</strong>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Monthly Rain Equiv.</span>
              <strong className="text-xs font-bold text-blue-700 block">{lastSyncedData.rainfall} mm <span className="text-[9px] font-normal text-slate-400 block mt-0.5">({lastSyncedData.timestamp})</span></strong>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 space-y-5 bg-white shadow-sm border border-slate-100">
            <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Thermometer className="h-4.5 w-4.5 text-emerald-700" />
              1. Simulate Weather Sliders
            </h3>

            {/* Temp Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-slate-600">
                  <Thermometer className="h-4 w-4 text-rose-500" /> Temperature:
                </span>
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-extrabold">
                  {temperature} °C
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="45" 
                value={temperature} 
                onChange={(e) => setTemperature(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
                <span>10 °C (Cool)</span>
                <span>28 °C (Tropical)</span>
                <span>45 °C (Severe Heat)</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-slate-600">
                  <Droplets className="h-4 w-4 text-sky-500" /> Relative Humidity:
                </span>
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-extrabold">
                  {humidity} %
                </span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={humidity} 
                onChange={(e) => setHumidity(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
                <span>10% (Arid)</span>
                <span>65% (Optimal Vector)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* Rainfall Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-slate-600">
                  <CloudRain className="h-4 w-4 text-sky-650" /> Rainfall (Monthly):
                </span>
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-extrabold">
                  {rainfall} mm
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="400" 
                value={rainfall} 
                onChange={(e) => setRainfall(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
                <span>0 mm (Drought)</span>
                <span>150 mm (Monsoon)</span>
                <span>400 mm (Flash Flood)</span>
              </div>
            </div>

            <button 
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-colors mt-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Reset Parameters
            </button>
          </div>
        </div>

        {/* Threat Level Gauges & Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 space-y-4 bg-white shadow-sm border border-slate-100">
            <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-750" />
              2. Outbreak Threat Level Index
            </h3>

            <div className="space-y-4">
              {risks.map(r => (
                <div key={r.id} className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-750">
                    <span className="flex items-center gap-1">
                      <ChevronRight className="h-3.5 w-3.5 text-emerald-700 animate-pulse" />
                      {r.name} Outbreak Risk
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${r.color}`}>
                      {r.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${r.score}%`,
                          backgroundColor: r.text === 'Severe' ? '#ef4444' : r.text === 'High' ? '#f59e0b' : r.text === 'Moderate' ? '#0ea5e9' : '#10b981'
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 shrink-0 w-8 text-right font-mono">
                      {r.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Advisories Box */}
          <div className="glass-panel p-5 space-y-3 bg-emerald-50/15 border border-emerald-100/50 bg-white">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              Proactive Outpost Intervention Guide
            </h4>
            <div className="space-y-2.5">
              {advisories.map((act, idx) => (
                <div key={idx} className="text-xs text-slate-750 flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-150 shadow-sm leading-relaxed font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
