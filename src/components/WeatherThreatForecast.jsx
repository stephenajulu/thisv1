import React, { useState } from 'react';
import { Thermometer, CloudRain, Droplets, AlertTriangle, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import { database } from '../data/database';

export default function WeatherThreatForecast() {
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(70);
  const [rainfall, setRainfall] = useState(150);

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
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-800 bg-white">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
          <CloudRain className="h-5.5 w-5.5 text-emerald-800" />
          Climate Weather Vector Threat Simulator
        </h2>
        <p className="text-xs text-slate-500">
          Simulate environmental parameter shifts (temperature, humidity, and rainfall) to calculate real-time biological risk profiles for vector and water-borne pathogens.
        </p>
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
              className="w-full py-2.5 bg-slate-55 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-colors mt-2"
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
              2. Outbreak Threat Level index
            </h3>

            <div className="space-y-4">
              {risks.map(r => (
                <div key={r.id} className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-750">
                    <span className="flex items-center gap-1">
                      <ChevronRight className="h-3.5 w-3.5 text-emerald-700" />
                      {r.name} Outbreak Risk
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${r.color}`}>
                      {r.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          r.text === "Severe" ? 'bg-rose-500' :
                          r.text === "High" ? 'bg-amber-50' : 'bg-sky-500'
                        }`}
                        style={{ 
                          width: `${r.score}%`,
                          backgroundColor: r.text === 'Severe' ? 'var(--color-rose-500)' : r.text === 'High' ? 'var(--color-amber-500)' : 'var(--color-sky-500)'
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 shrink-0 w-8 text-right">
                      {r.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Advisories Box */}
          <div className="glass-panel p-5 space-y-3 bg-emerald-50/15 border border-emerald-100/50">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
              Proactive Outpost Intervention Guide
            </h4>
            <div className="space-y-2.5">
              {advisories.map((act, idx) => (
                <div key={idx} className="text-xs text-slate-750 flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-slate-150 shadow-sm leading-relaxed">
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
