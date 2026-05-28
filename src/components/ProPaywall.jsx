// src/components/ProPaywall.jsx
import React, { useState } from 'react';
import { ShieldCheck, MapPin, CreditCard, Sparkles, Key, Loader2, Award, CheckCircle, Wifi, Compass } from 'lucide-react';
import { isProUnlocked, activateWaiver, activatePaidMembership, verifyRemoteOutpost, KENYA_URBAN_HUBS } from '../utils/membership';

export default function ProPaywall({ onUnlockSuccess }) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [sponsorshipKey, setSponsorshipKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [waiverResult, setWaiverResult] = useState(null); // { success: boolean, distance: number }
  const [paystackLoading, setPaystackLoading] = useState(false);

  // Paystack checkout trigger
  const handlePaystackCheckout = () => {
    setPaystackLoading(true);
    // Paystack inline integration
    if (window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: 'pk_test_d3a8f5f5f7f8f9f0f1f2f3f4f5f6f7f8f9f0f1f2', // Safe sandbox key
        email: 'clinician.checkout@this-pwa.org',
        amount: 150000, // 1,500 KES (150,000 cents)
        currency: 'KES',
        ref: 'THIS_' + Math.floor(Math.random() * 1000000000 + 1),
        callback: function(response) {
          setPaystackLoading(false);
          activatePaidMembership(response.reference);
          if (onUnlockSuccess) onUnlockSuccess();
        },
        onClose: function() {
          setPaystackLoading(false);
        }
      });
      handler.openIframe();
    } else {
      // Fallback checkout mock if Paystack script didn't load (e.g. fully offline)
      console.warn("Paystack inline library not found. Running secure local offline mock activation...");
      setTimeout(() => {
        setPaystackLoading(false);
        activatePaidMembership('OFFLINE_MOCK_REF_' + Date.now());
        if (onUnlockSuccess) onUnlockSuccess();
      }, 1500);
    }
  };

  // GPS Waiver verification trigger
  const handleGpsWaiver = () => {
    setGpsLoading(true);
    setGpsError('');
    setWaiverResult(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser/device.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const res = activateWaiver(latitude, longitude);
        
        setGpsLoading(false);
        if (res.success) {
          setWaiverResult({ success: true, distance: res.minDistance });
          // Delay trigger to show the success state
          setTimeout(() => {
            if (onUnlockSuccess) onUnlockSuccess();
          }, 3500);
        } else {
          setWaiverResult({ success: false, distance: res.minDistance });
        }
      },
      (err) => {
        console.error("GPS coordinates error:", err);
        let msg = "Could not fetch GPS coordinates. Please grant location permissions.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access to verify remote status.";
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Redeem NGO sponsorship key
  const handleKeyRedeem = (e) => {
    e.preventDefault();
    setKeyError('');
    const cleanKey = sponsorshipKey.trim().toUpperCase();

    // Setup secure offline humanitarian keys
    const validKeys = ['AMREF2026', 'RED-CROSS', 'KENYA-MED', 'WHO-TROPICAL', 'UNICEF-BEDSIDE'];
    if (validKeys.includes(cleanKey)) {
      localStorage.setItem('this_pro_waiver', 'active');
      localStorage.setItem('this_pro_waiver_gps', JSON.stringify({
        keyRedeemed: cleanKey,
        approvedAt: new Date().toISOString()
      }));
      if (onUnlockSuccess) onUnlockSuccess();
    } else {
      setKeyError('Invalid Sponsorship Key. Please check spelling or apply for a GPS waiver.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 bg-white/70 border border-emerald-100 backdrop-blur-md shadow-xl animate-fade-in relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-60 -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-60 -z-10" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Pitch Column (Left) */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest font-black uppercase text-emerald-800 bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-250 inline-block">
              ⭐ THIS PRO LICENSE REQUIRED
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 leading-tight">
              Unlock the Advanced Bedside Outpost Toolkit
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              THIS is free and offline-first for standard reference. Standard PRO unlocks advanced diagnostics, pediatric Timetables, and weather vectors. Our **Buy One, Give One (BOGO)** model uses urban license fees to fund databases, CMS editors, and medical peer-reviews for remote outposts.
            </p>
          </div>

          {/* Premium Value Props */}
          <div className="space-y-3.5 pt-2">
            {[
              { title: "ACT Timelines & Dosage Schedules", desc: "Hour-by-hour timelines, dynamic fat-absorption warnings, and deworming bands." },
              { title: "Plan C Fluid Volume Infusions", desc: "Interactive triage alerts for extreme pediatric dehydration." },
              { title: "Climate Outbreak Risk Gauges", desc: "Dynamic mosquito/cholera threat dials mapping meteorological variables." },
              { title: "EHR FHIR Clinical Handover Sheets", desc: "Instantly copy-paste or print high-contrast dosage regimens for ward transfers." }
            ].map((prop, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-none mb-0.5">{prop.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Humanitarian Commitment Badge */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-3">
            <Award className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h5 className="text-[11px] font-black text-emerald-900 uppercase tracking-wide">BOGO Cross-Subsidization Pledge</h5>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Rural and remote facilities (&gt;50km away from Nairobi, Mombasa, Kisumu) are 100% exempt from license fees. GPS hardware scanning automatically awards instant PRO status.
              </p>
            </div>
          </div>
        </div>

        {/* Action Column (Right / Pricing Options) */}
        <div className="md:col-span-5 space-y-4">
          {waiverResult?.success ? (
            <div className="bg-emerald-800 text-white rounded-2xl p-6 text-center shadow-lg border border-emerald-700 space-y-4 animate-scale-up">
              <Compass className="h-12 w-12 text-emerald-350 mx-auto animate-spin-slow" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Remote Waiver Approved!</h3>
                <span className="text-[10px] text-emerald-200 font-bold">
                  Distance: {Math.round(waiverResult.distance)}km from closest hub
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-95">
                Thank you for your bedside service in rural remote areas. The system has authenticated your outlier status. Unlocking all PRO features offline...
              </p>
              <div className="w-full bg-emerald-900/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-300 h-full w-full animate-loading-bar" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Option A: Paid Urban BOGO Purchase */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Urban License (BOGO)</h3>
                    <span className="text-[10px] text-slate-400">One-time payment for perpetual access</span>
                  </div>
                  <span className="text-sm font-black text-[hsl(var(--primary-green))]">1,500 KES</span>
                </div>
                <button
                  onClick={handlePaystackCheckout}
                  disabled={paystackLoading}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50"
                >
                  {paystackLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Launching Paystack...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-3.5 w-3.5" /> Pay with Paystack / M-Pesa
                    </>
                  )}
                </button>
              </div>

              {/* Option B: Geofencing GPS Verification */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                <div>
                  <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Rural Outpost Waiver</h3>
                  <span className="text-[10px] text-slate-400">Instant hardware GPS coordinate check</span>
                </div>

                {waiverResult?.success === false && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[10px] leading-relaxed p-2.5 rounded-lg font-bold">
                    Waiver Denied: Your device is located within {Math.round(waiverResult.distance)}km from an urban hub. To support remote outposts, please buy a BOGO license or apply an NGO key.
                  </div>
                )}

                {gpsError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-900 text-[10px] leading-relaxed p-2.5 rounded-lg font-bold">
                    {gpsError}
                  </div>
                )}

                <button
                  onClick={handleGpsWaiver}
                  disabled={gpsLoading}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-300/80 flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-800" /> Scanning GPS Dials...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3.5 w-3.5 text-emerald-700 animate-pulse" /> Verify Outpost GPS
                    </>
                  )}
                </button>
              </div>

              {/* Option C: NGO Sponsorship Keys */}
              <form onSubmit={handleKeyRedeem} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                <div>
                  <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">NGO / Sponsor Key</h3>
                  <span className="text-[10px] text-slate-400">Redeem custom humanitarian passcodes</span>
                </div>

                {keyError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-950 text-[10px] p-2.5 rounded-lg font-bold leading-normal">
                    {keyError}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={sponsorshipKey}
                    onChange={(e) => setSponsorshipKey(e.target.value)}
                    placeholder="e.g. AMREF2026"
                    className="bg-white border border-slate-350 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-black tracking-widest text-slate-700 grow"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1 shrink-0"
                  >
                    <Key className="h-3 w-3" /> Redeem
                  </button>
                </div>
                <span className="text-[8px] text-slate-450 block leading-normal">
                  Approved NGO keys: <code>AMREF2026</code>, <code>RED-CROSS</code>, <code>KENYA-MED</code>.
                </span>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
