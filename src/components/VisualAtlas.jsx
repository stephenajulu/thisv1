// src/components/VisualAtlas.jsx
import React, { useState } from 'react';
import { Layers, Activity, Sprout, AlertCircle, CheckCircle, ChevronRight, Eye, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

export default function VisualAtlas() {
  const [activeTab, setActiveTab] = useState('dermatology'); // 'dermatology' | 'botanical'
  const [selectedItem, setSelectedItem] = useState('scabies');
  const [showLookAlike, setShowLookAlike] = useState(false);

  // Reset look-alike toggle when swapping items
  const handleItemSelect = (id) => {
    setSelectedItem(id);
    setShowLookAlike(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header and Atlas Pitch */}
      <div className="text-center py-6">
        <span className="text-[10px] tracking-widest font-black uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-250 inline-block mb-2">
          ★ Outpost Diagnostic Atlas
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--primary-green))] leading-tight">
          Offline Visual Medical Atlas
        </h2>
        <p className="text-slate-500 max-w-3xl mx-auto mt-2 text-sm md:text-base">
          Bedside clinical-grade vector drawings and botanical taxonomy indexes designed for offline field diagnostics. Verify anatomical presentations, processing steps, and critical toxic look-alikes with infinite zoom and zero network dependencies.
        </p>
      </div>

      {/* Directory Tab Selectors */}
      <div className="flex justify-center border-b border-slate-200/60 pb-1 max-w-md mx-auto">
        <button
          onClick={() => {
            setActiveTab('dermatology');
            handleItemSelect('scabies');
          }}
          className={`px-6 py-2 text-xs font-bold transition-all relative ${
            activeTab === 'dermatology'
              ? 'text-[hsl(var(--primary-green))] border-b-2 border-b-emerald-850 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Anatomical Directory
        </button>
        <button
          onClick={() => {
            setActiveTab('botanical');
            handleItemSelect('neem');
          }}
          className={`px-6 py-2 text-xs font-bold transition-all relative ${
            activeTab === 'botanical'
              ? 'text-[hsl(var(--primary-green))] border-b-2 border-b-emerald-850 font-extrabold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Botanical Taxonomy Index
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Index (Left - 4 columns) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-panel p-4 bg-white space-y-2">
            <h3 className="text-xs font-black text-slate-405 uppercase tracking-widest border-b border-slate-50 pb-1.5 flex items-center gap-1.5">
              {activeTab === 'dermatology' ? (
                <>
                  <Activity className="h-4 w-4 text-emerald-800" />
                  Pathology Maps
                </>
              ) : (
                <>
                  <Sprout className="h-4 w-4 text-emerald-800" />
                  Botanical Species
                </>
              )}
            </h3>

            <div className="flex flex-col gap-1">
              {activeTab === 'dermatology' ? (
                // Dermatology Index
                [
                  { id: 'scabies', name: 'Scabies Mites & Burrows', subtitle: 'Sarcoptes scabiei' },
                  { id: 'buruli', name: 'Buruli Undermined Ulcer', subtitle: 'Mycobacterium ulcerans' },
                  { id: 'dengue', name: 'Dengue Hemorrhagic Petechiae', subtitle: 'Capillary extravasation' },
                  { id: 'chagas', name: "Romana's Sign (Chagas)", subtitle: 'Trypanosoma cruzi' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className={`text-left px-3 py-2.5 rounded-lg text-xs transition-all flex flex-col gap-0.5 border ${
                      selectedItem === item.id
                        ? 'bg-emerald-50 text-[hsl(var(--primary-green))] border-emerald-200/60 font-bold shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-655 border-transparent'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[9px] italic opacity-75 font-normal">{item.subtitle}</span>
                  </button>
                ))
              ) : (
                // Botanical Index
                [
                  { id: 'neem', name: 'Neem L. (Mwarubaini)', subtitle: 'Azadirachta indica' },
                  { id: 'artemisia', name: 'Sweet Wormwood (Artemisia)', subtitle: 'Artemisia annua L.' },
                  { id: 'moringa', name: 'Drumstick Tree (Moringa)', subtitle: 'Moringa oleifera L.' },
                  { id: 'aloe', name: 'Soothing Aloe Succulent', subtitle: 'Aloe vera L.' },
                  { id: 'warburgia', name: 'Muthiga (Pepper-bark)', subtitle: 'Warburgia salutaris' },
                  { id: 'kigelia', name: 'Muua (Sausage Tree)', subtitle: 'Kigelia africana' },
                  { id: 'mondia', name: 'Mukombero (White Ginger)', subtitle: 'Mondia whitei' },
                  { id: 'prunus', name: 'Muiri (Red Stinkwood)', subtitle: 'Prunus africana' },
                  { id: 'astragalus', name: 'Huangqi (Astragalus)', subtitle: 'Astragalus membranaceus' },
                  { id: 'turmeric', name: 'Turmeric (Curcumin)', subtitle: 'Curcuma longa L.' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className={`text-left px-3 py-2.5 rounded-lg text-xs transition-all flex flex-col gap-0.5 border ${
                      selectedItem === item.id
                        ? 'bg-sky-50 text-[hsl(var(--primary-green))] border-sky-200/60 font-bold shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-655 border-transparent'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[9px] italic opacity-75 font-normal">{item.subtitle}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick Guidance Alert */}
          <div className="p-4 bg-emerald-800 text-white rounded-2xl shadow space-y-2">
            <h4 className="text-[11px] font-black text-emerald-200 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> Bedside Reference Standard
            </h4>
            <p className="text-[10px] leading-relaxed opacity-95">
              Toggle comparative overlays to train clinical observations. These drawings are designed as primary structural mappings; always cross-reference diagnostic outputs with WHO standard laboratory Smears and Rapid Diagnostic Tests (RDTs) where available.
            </p>
          </div>
        </div>

        {/* Detailed Illustration Workspace (Right - 8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'dermatology' ? (
            // Dermatology View Screen
            <DermatologyDetail id={selectedItem} />
          ) : (
            // Botanical View Screen
            <BotanicalDetail 
              id={selectedItem} 
              showLookAlike={showLookAlike} 
              onToggleLookAlike={() => setShowLookAlike(!showLookAlike)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DERMATOLOGY PATHOLOGY DETAIL VIEWER
// -------------------------------------------------------------
function DermatologyDetail({ id }) {
  const getPathologyData = () => {
    switch (id) {
      case 'scabies':
        return {
          title: "Scabies Sarcoptes Mite & Burrows",
          scientific: "Sarcoptes scabiei infestation",
          description: "Microscopic burrowing of female mites in the upper stratum corneum of human skin. Spikes severe itching (pruritus) at night, triggering scratch lesions and secondary staphylococcal bacterial ulcers.",
          markers: [
            "Interdigital webbing (between fingers) is the primary site of infestation",
            "Linear or S-shaped burrows representing mite egg-laying tunnels",
            "Pruritic papules around wrists, elbow bends, and groin folds"
          ],
          differential: {
            disease: "Dyshidrotic Eczema",
            differentiation: "Eczema causes fluid-filled vesicles on palm margins but completely lacks linear egg-laying burrows and is not highly contagious."
          },
          bedsideAction: "Apply Permethrin 5% cream neck-down. Treat all household contacts simultaneously. Hot-wash all bedding/linens.",
          svg: (
            <svg viewBox="0 0 400 240" className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Epidermal Layers */}
              <rect x="0" y="160" width="400" height="80" fill="#f8cfb3" /> {/* Dermis */}
              <rect x="0" y="80" width="400" height="80" fill="#fbc39d" /> {/* Epidermis */}
              <rect x="0" y="60" width="400" height="20" fill="#e89e73" /> {/* Stratum Corneum */}
              
              {/* Burrows in Stratum Corneum */}
              <path d="M 50 70 Q 150 55, 230 72 T 330 65" fill="none" stroke="#be123c" strokeWidth="4" strokeDasharray="3,3" />
              
              {/* Eggs inside burrow */}
              <circle cx="90" cy="66" r="4" fill="#ffedd5" stroke="#f43f5e" strokeWidth="1" />
              <circle cx="130" cy="62" r="4" fill="#ffedd5" stroke="#f43f5e" strokeWidth="1" />
              <circle cx="170" cy="68" r="4" fill="#ffedd5" stroke="#f43f5e" strokeWidth="1" />
              <circle cx="210" cy="71" r="4" fill="#ffedd5" stroke="#f43f5e" strokeWidth="1" />
              
              {/* Burrowing Mite drawing */}
              <g transform="translate(290, 52) scale(0.6)">
                <ellipse cx="40" cy="30" rx="26" ry="20" fill="#fff" stroke="#475569" strokeWidth="2.5" />
                {/* Bristles */}
                <path d="M 15 30 L 2 30 M 18 15 L 6 8 M 18 45 L 6 52 M 64 30 L 76 30 M 60 15 L 72 8 M 60 45 L 72 52" stroke="#475569" strokeWidth="2" />
                {/* Legs */}
                <path d="M 28 12 Q 22 2, 26 -6 M 52 12 Q 58 2, 54 -6 M 28 48 Q 22 58, 26 66 M 52 48 Q 58 58, 54 66" fill="none" stroke="#475569" strokeWidth="2.5" />
                <circle cx="26" cy="-6" r="2" fill="#475569" />
                <circle cx="54" cy="-6" r="2" fill="#475569" />
                <circle cx="26" cy="66" r="2" fill="#475569" />
                <circle cx="54" cy="66" r="2" fill="#475569" />
                {/* Head */}
                <circle cx="40" cy="4" r="8" fill="#fff" stroke="#475569" strokeWidth="2" />
                <path d="M 37 -2 L 35 -10 M 43 -2 L 45 -10" stroke="#475569" strokeWidth="2" />
              </g>

              {/* Labels */}
              <text x="15" y="30" fill="#0f172a" className="text-[10px] font-black uppercase tracking-wider" fontStyle="normal">Epidermal Burrow Cross-Section</text>
              <line x1="230" y1="72" x2="230" y2="120" stroke="#475569" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="200" y="132" fill="#be123c" className="text-[9px] font-bold">Mite egg-laying path</text>
              
              <line x1="310" y1="35" x2="310" y2="15" stroke="#475569" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="250" y="12" fill="#475569" className="text-[9px] font-bold">Burrowing Sarcoptes mite</text>

              <line x1="130" y1="62" x2="130" y2="105" stroke="#475569" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="110" y="117" fill="#e11d48" className="text-[9px] font-bold">Mite eggs</text>
            </svg>
          )
        };

      case 'buruli':
        return {
          title: "Buruli Undermined Ulcer Margin",
          scientific: "Mycobacterium ulcerans ulceration",
          description: "A slow-developing mycobacterial ulceration characterized by deeply 'undermined' skin margins (the ulcer extends widely under the visible edge of intact skin). Caused by mycolactone toxin which suppresses local pain and immune responses.",
          markers: [
            "Highly distinctive undermined edge (cotton swab can be slid under the margin)",
            "Ulcer is completely painless (mycolactone destroys local cutaneous nerves)",
            "Yellowish-white necrotic slough at the center, surrounded by skin induration"
          ],
          differential: {
            disease: "Venous Stasis Ulcers",
            differentiation: "Venous ulcers have sloped, irregular, non-undermined borders, are highly painful, and are associated with varicose veins on lower extremities."
          },
          bedsideAction: "Initiate Rifampicin + Clarithromycin therapy immediately under strict review. Keep clean, surgically debride tissue if necrotic.",
          svg: (
            <svg viewBox="0 0 400 240" className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Healthy Skin Sides */}
              <rect x="0" y="40" width="80" height="200" fill="#fbc39d" />
              <rect x="320" y="40" width="80" height="200" fill="#fbc39d" />
              <rect x="0" y="30" width="80" height="10" fill="#e89e73" />
              <rect x="320" y="30" width="80" height="10" fill="#e89e73" />
              
              {/* Undermined cavern under skin */}
              <path d="M 80 40 C 60 70, 70 140, 110 140 L 290 140 C 330 140, 340 70, 320 40 L 320 240 L 80 240 Z" fill="#7f1d1d" opacity="0.1" />
              <path d="M 80 40 C 60 70, 70 140, 110 140 L 290 140 C 330 140, 340 70, 320 40" fill="none" stroke="#991b1b" strokeWidth="3" />
              
              {/* Ulcer Base */}
              <rect x="110" y="130" width="180" height="110" fill="#fee2e2" />
              {/* Yellow Necrotic slough */}
              <ellipse cx="200" cy="160" rx="60" ry="25" fill="#fef08a" opacity="0.9" stroke="#eab308" strokeWidth="1.5" />

              {/* Labels */}
              <text x="15" y="20" fill="#0f172a" className="text-[10px] font-black uppercase tracking-wider">Deeply Undermined Margin Map</text>
              
              {/* Undermined margin indicators */}
              <line x1="60" y1="85" x2="35" y2="85" stroke="#991b1b" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="15" y="98" fill="#991b1b" className="text-[9px] font-black leading-tight text-center">UNDERMINED<br/>CAVERN</text>

              <line x1="200" y1="160" x2="200" y2="210" stroke="#854d0e" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="145" y="222" fill="#854d0e" className="text-[9px] font-bold">Yellow Necrotic Slough Base</text>

              <line x1="80" y1="40" x2="160" y2="40" stroke="#475569" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="165" y="44" fill="#475569" className="text-[9px] font-bold">Visible Intact Edge</text>
            </svg>
          )
        };

      case 'dengue':
        return {
          title: "Dengue Hemorrhagic Petechiae Map",
          scientific: "Capillary extravasation / thrombocytopenia",
          description: "Pinpoint round non-blanching red spots (petechiae) caused by intradermal bleeding. Triggered by endothelial dysfunction and a rapid depletion of blood platelets during severe Dengue episodes.",
          markers: [
            "Pinpoint hemorrhagic bleeding spots (does not turn white when pressed)",
            "Typically clusters around lower extremities (legs, forearms) in secondary phase",
            "Positive Tourniquet Test: >20 petechiae per square inch indicates systemic capillary leakage"
          ],
          differential: {
            disease: "Meningococcal Septicemia",
            differentiation: "Meningococcemia causes rapidly expanding purpuric spots with high fever and acute neck stiffness. Petechiae is systemic, flat, and accompanied by platelet count crash in Dengue."
          },
          bedsideAction: "Perform a baseline complete blood count (CBC). Monitor platelet drop carefully. Implement aggressive oral rehydration. DO NOT administer aspirin/ibuprofen (increases hemorrhage risks).",
          svg: (
            <svg viewBox="0 0 400 240" className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Forearm or Leg silhouette */}
              <path d="M 40 80 C 120 70, 280 70, 360 85 C 360 170, 280 185, 120 185 C 40 170, 40 80, 40 80" fill="#fbc39d" stroke="#e89e73" strokeWidth="2" />
              
              {/* Pinpoint Petechiae dots */}
              <circle cx="80" cy="110" r="1.5" fill="#be123c" />
              <circle cx="95" cy="125" r="1.5" fill="#be123c" />
              <circle cx="110" cy="100" r="1.5" fill="#be123c" />
              <circle cx="115" cy="115" r="1.5" fill="#be123c" />
              <circle cx="120" cy="130" r="1.5" fill="#be123c" />
              <circle cx="140" cy="105" r="1.5" fill="#be123c" />
              
              {/* Tourniquet Test Square (1x1 inch reference) */}
              <rect x="180" y="90" width="80" height="80" fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeDasharray="4,4" />
              
              {/* 20+ dense petechiae inside square box */}
              <circle cx="190" cy="100" r="1.5" fill="#e11d48" />
              <circle cx="205" cy="105" r="1.5" fill="#e11d48" />
              <circle cx="210" cy="120" r="1.5" fill="#e11d48" />
              <circle cx="195" cy="130" r="1.5" fill="#e11d48" />
              <circle cx="200" cy="145" r="1.5" fill="#e11d48" />
              <circle cx="225" cy="110" r="1.5" fill="#e11d48" />
              <circle cx="230" cy="125" r="1.5" fill="#e11d48" />
              <circle cx="240" cy="135" r="1.5" fill="#e11d48" />
              <circle cx="220" cy="140" r="1.5" fill="#e11d48" />
              <circle cx="245" cy="105" r="1.5" fill="#e11d48" />
              <circle cx="215" cy="155" r="1.5" fill="#e11d48" />
              <circle cx="235" cy="150" r="1.5" fill="#e11d48" />
              <circle cx="250" cy="120" r="1.5" fill="#e11d48" />
              <circle cx="205" cy="160" r="1.5" fill="#e11d48" />
              <circle cx="185" cy="140" r="1.5" fill="#e11d48" />
              <circle cx="190" cy="120" r="1.5" fill="#e11d48" />
              <circle cx="220" cy="100" r="1.5" fill="#e11d48" />
              <circle cx="240" cy="160" r="1.5" fill="#e11d48" />
              <circle cx="245" cy="145" r="1.5" fill="#e11d48" />
              <circle cx="230" cy="138" r="1.5" fill="#e11d48" />
              <circle cx="250" cy="155" r="1.5" fill="#e11d48" />

              {/* Labels */}
              <text x="15" y="30" fill="#0f172a" className="text-[10px] font-black uppercase tracking-wider">Hemorrhagic Petechiae & Tourniquet Grid</text>
              
              <line x1="260" y1="130" x2="310" y2="130" stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="315" y="128" fill="#1e3a8a" className="text-[9px] font-black uppercase tracking-wide leading-tight">Positive test<br/>&gt;20 petechiae<br/>per sq. inch</text>

              <line x1="100" y1="120" x2="100" y2="200" stroke="#be123c" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="45" y="213" fill="#be123c" className="text-[9px] font-bold">Non-blanching capillary leakage dots</text>
            </svg>
          )
        };

      default: // chagas
        return {
          title: "Romana's Sign & Chagoma Vector Bite",
          scientific: "Trypanosoma cruzi acute bite phase",
          description: "Romana's sign is a classic clinical indicator of acute Chagas disease. Features painless unilateral periocular swelling, palpebral edema, and conjunctivitis, developing when kissing bug (Triatominae) feces contaminate the eye membrane.",
          markers: [
            "Painless unilateral eyelid swelling and inflammation (usually single eye)",
            "Chagoma: Swollen, hardened vector entry bite lesion on nearby cheek/face",
            "Local preauricular lymphadenopathy (swollen lymph nodes behind ear)"
          ],
          differential: {
            disease: "Allergic Blepharitis / Conjunctivitis",
            differentiation: "Allergies affect both eyes symmetrically, spurn severe itching/tearing, and completely lack unilateral indurated bite chagomas."
          },
          bedsideAction: "Initiate standard Nifurtimox or Benznidazole. Support swelling. Avoid scratching vector area.",
          svg: (
            <svg viewBox="0 0 400 240" className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Symmetric Face silhouette outline */}
              <path d="M 120 40 Q 200 10, 280 40 Q 320 100, 280 180 Q 200 230, 120 180 Q 80 100, 120 40" fill="#fbc39d" stroke="#e89e73" strokeWidth="2" />
              
              {/* Normal Left Eye (viewer's right) */}
              <ellipse cx="230" cy="100" rx="18" ry="8" fill="#fff" stroke="#475569" strokeWidth="1.5" />
              <circle cx="230" cy="100" r="6" fill="#1e3a8a" />
              
              {/* Painless Swollen Right Eye - Romana's Sign (viewer's left) */}
              {/* Swollen Eyelids outer shell */}
              <path d="M 140 100 Q 170 65, 200 100 Q 170 120, 140 100" fill="#f43f5e" opacity="0.25" />
              <path d="M 132 100 C 132 80, 208 80, 208 100 C 208 122, 132 122, 132 100" fill="none" stroke="#be123c" strokeWidth="3" />
              
              {/* Pupil slit inside swelling */}
              <ellipse cx="170" cy="100" rx="14" ry="4" fill="#fff" stroke="#be123c" strokeWidth="1.5" />
              <circle cx="170" cy="100" r="3" fill="#1e3a8a" />

              {/* Bite Chagoma on Cheek */}
              <circle cx="150" cy="150" r="10" fill="#f43f5e" opacity="0.3" />
              <circle cx="150" cy="150" r="4" fill="#e11d48" />
              <circle cx="150" cy="150" r="1" fill="#9f1239" />

              {/* Labels */}
              <text x="15" y="35" fill="#0f172a" className="text-[10px] font-black uppercase tracking-wider">Romana's Sign Diagnostic Face Map</text>
              
              <line x1="140" y1="90" x2="60" y2="90" stroke="#be123c" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="15" y="76" fill="#be123c" className="text-[9px] font-black uppercase tracking-wide leading-tight text-right">Romana's Sign:<br/>Painless Unilateral<br/>Eye Swelling</text>

              <line x1="150" y1="150" x2="60" y2="150" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="15" y="136" fill="#e11d48" className="text-[9px] font-black uppercase tracking-wide text-right">Chagoma:<br/>Entry Bite Lesion</text>

              <line x1="230" y1="90" x2="310" y2="90" stroke="#475569" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="315" y="93" fill="#475569" className="text-[9px] font-bold">Uninfected Eye</text>
            </svg>
          )
        };
    }
  };

  const data = getPathologyData();

  return (
    <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-md space-y-6 animate-scale-up">
      {/* Header Info */}
      <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-4">
        <div>
          <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 inline-block mb-1">
            Pathological Indication
          </span>
          <h3 className="text-xl font-extrabold text-[hsl(var(--primary-green))] leading-tight font-outfit">
            {data.title}
          </h3>
          <p className="text-xs italic text-slate-400 font-medium">
            {data.scientific}
          </p>
        </div>
        <Activity className="h-6 w-6 text-emerald-800 shrink-0" />
      </div>

      {/* SVG Image container */}
      <div className="relative w-full overflow-hidden border border-slate-150 rounded-2xl shadow-inner bg-slate-50 flex items-center justify-center p-1">
        {data.svg}
      </div>

      <div className="space-y-4">
        {/* Core Description */}
        <p className="text-xs text-slate-655 leading-relaxed">
          {data.description}
        </p>

        {/* Clinical Identifiers List */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/40">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-emerald-700" /> Primary Clinical Identifiers
          </h4>
          <ul className="space-y-1.5 pt-1">
            {data.markers.map((item, idx) => (
              <li key={idx} className="text-[11px] text-slate-650 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Differential diagnosis comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-sky-50/20 border border-sky-100 rounded-xl space-y-1">
            <h5 className="text-[10px] font-black text-sky-900 uppercase tracking-widest">Differential Diagnosis</h5>
            <span className="text-[11px] font-extrabold text-slate-800 block">{data.differential.disease}</span>
            <p className="text-[10px] text-slate-500 leading-normal">{data.differential.differentiation}</p>
          </div>
          <div className="p-3.5 bg-rose-50/20 border border-rose-100 rounded-xl space-y-1">
            <h5 className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Outpost Action Protocol</h5>
            <p className="text-[10px] text-slate-650 font-bold leading-relaxed">{data.bedsideAction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// BOTANICAL TAXONOMY & PROCESSING VIEWER
// -------------------------------------------------------------
function BotanicalDetail({ id, showLookAlike, onToggleLookAlike }) {
  const getBotanicalData = () => {
    switch (id) {
      case 'neem':
        return {
          title: "Neem Tree (Mwarubaini)",
          scientific: "Azadirachta indica L. taxonomy",
          description: "A fast-growing evergreen tree revered across the tropics. Rich in Azadirachtin and other triterpenoids, it possesses powerful natural antibacterial, anti-scabies, and vector-larvicide properties. It is crucial to distinguish Neem from toxic Chinaberry before preparational use.",
          parts: [
            { part: "Seeds / Kernels", use: "Cold-press extraction of neem oil for scabies mites and organic pest larvicide dials." },
            { part: "Leaves", use: "Aqueous boiling infusions for topical wound washing and mild bacterial skin rashes." }
          ],
          processing: [
            { step: "Harvest seed kernels during fruiting and thoroughly dry in shade to prevent moisture rot.", time: "Day 1-5" },
            { step: "Crush kernels using a local wooden hand-mortar or oil-expeller to extract thick green oil.", time: "Day 6" },
            { step: "Dilute the seed oil to a maximum of 10% inside a carrier oil (such as coconut water/sesame oil) before topical bedside use.", time: "Day 7" }
          ],
          lookAlikeName: "Chinaberry (Melia azedarach)",
          lookAlikeWarning: "Chinaberry leaf/fruit is highly toxic, causing neurological paralysis and gastrointestinal shock. Contrast Neem serrations against Chinaberry lobed compound leaflets.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Neem Leaf stem */}
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#65a30d" strokeWidth="3.5" />
              
              {/* Serrated Leaflet pair 1 */}
              <path d="M 120 120 C 130 90, 150 90, 170 100 C 150 115, 140 115, 120 120" fill="#3f6212" stroke="#1e293b" strokeWidth="1" />
              <path d="M 115 125 C 100 135, 95 145, 90 160 C 105 155, 115 145, 115 125" fill="#3f6212" stroke="#1e293b" strokeWidth="1" />
              {/* Serrations dots */}
              <circle cx="140" cy="93" r="1" fill="#a3e635" /><circle cx="155" cy="96" r="1" fill="#a3e635" />
              <circle cx="102" cy="148" r="1" fill="#a3e635" /><circle cx="96" cy="154" r="1" fill="#a3e635" />

              {/* Serrated Leaflet pair 2 */}
              <path d="M 180 80 C 195 55, 215 55, 230 65 C 210 80, 200 80, 180 80" fill="#3f6212" stroke="#1e293b" strokeWidth="1" />
              <path d="M 175 85 C 160 100, 155 110, 150 125 C 165 120, 175 110, 175 85" fill="#3f6212" stroke="#1e293b" strokeWidth="1" />

              {/* Terminal Leaflet */}
              <path d="M 270 42 C 285 25, 298 22, 305 20 C 298 32, 285 45, 270 42" fill="#3f6212" stroke="#1e293b" strokeWidth="1" />

              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Therapeutic Neem Leaflet</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Deeply serrate saw-like margins</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Chinaberry Leaf stem - bipinnate splits */}
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#0284c7" strokeWidth="3" />
              {/* Secondary splits */}
              <path d="M 120 120 Q 95 90, 80 80 M 180 80 Q 155 50, 140 40" fill="none" stroke="#0284c7" strokeWidth="2" />
              
              {/* Smooth lobed leaflets on splitting stems */}
              <ellipse cx="80" cy="80" rx="14" ry="9" fill="#0369a1" stroke="#0f172a" strokeWidth="1" transform="rotate(30, 80, 80)" />
              <ellipse cx="140" cy="40" rx="14" ry="9" fill="#0369a1" stroke="#0f172a" strokeWidth="1" transform="rotate(30, 140, 40)" />
              
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">TOXIC LOOK-ALIKE (Chinaberry)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Bipinnate splits, smooth lobed leaflets</text>
            </svg>
          )
        };

      case 'artemisia':
        return {
          title: "Sweet Wormwood (Artemisia)",
          scientific: "Artemisia annua L. leaf structure",
          description: "An annual herbaceous plant originating in temperate-warm zones. Produces the potent sesquiterpene lactone *Artemisinin*, the cornerstone compound of malaria ACT therapies. Standard high-heat boiling collapses the active artemisinin molecules, demanding low-temperature infusions.",
          parts: [
            { part: "Dried Leaves", use: "Used in low-temperature aqueous infusions to treat mild/uncomplicated vector fever (where pharmaceutical ACT tablets are unavailable)." }
          ],
          processing: [
            { step: "Harvest feathery leaves just prior to the plant flowering (when active artemisinin concentration peaks).", time: "Day 1" },
            { step: "Dry leaves completely in shadow out of direct solar radiation to protect the delicate molecules.", time: "Day 2-6" },
            { step: "Steep dried leaves in warm water strictly below 60°C. Do not boil. High heat destroys active artemisinin.", time: "Bedside" }
          ],
          lookAlikeName: "Common Ragweed (Ambrosia artemisiifolia)",
          lookAlikeWarning: "Ragweed produces highly allergenic pollen causing severe respiratory asthma and contact dermatitis. Ragweed has dense bipinnatifid leaflets without the sweet camphor scent of therapeutic Artemisia.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Feathery leaves stem */}
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#65a30d" strokeWidth="3" />
              {/* Finely dissected fronds */}
              <path d="M 120 120 C 150 90, 160 100, 175 105" fill="none" stroke="#3f6212" strokeWidth="2" />
              <path d="M 140 105 C 130 90, 120 85, 110 80" fill="none" stroke="#3f6212" strokeWidth="2" />
              {/* Fine sub-dissections */}
              <path d="M 145 110 L 155 105 M 165 108 L 170 102 M 135 100 L 130 95 M 125 90 L 120 85" stroke="#3f6212" strokeWidth="1.5" />
              
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Therapeutic Sweet Wormwood</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Finely dissected, feathery pinnate leaves</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Ragweed stem */}
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#0284c7" strokeWidth="3.5" />
              {/* Dense thick lobed leaf plates */}
              <path d="M 120 120 Q 150 110, 180 125 L 170 135 Q 140 125, 120 120" fill="#0369a1" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 180 80 Q 210 70, 240 85 L 230 95 Q 200 85, 180 80" fill="#0369a1" stroke="#0f172a" strokeWidth="1.5" />

              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">ALLERGENIC LOOK-ALIKE (Ragweed)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Thick, dense bipinnatifid lobes, no scent</text>
            </svg>
          )
        };

      case 'moringa':
        return {
          title: "Drumstick Tree (Moringa)",
          scientific: "Moringa oleifera L. taxonomy",
          description: "A highly resilient, drought-resistant tropical tree. Compound leaves are packed with iron, Vitamin C, Vitamin A, and highly concentrated essential proteins. Bark and roots contain toxic uterine stimulants and must be strictly avoided during pregnancy.",
          parts: [
            { part: "Leaves", use: "Harvested and dried for highly nutritive pediatric dietary powder to prevent severe malnutrition (SAM)." },
            { part: "Seeds", use: "Crushed seed powder acts as a reliable natural flocculant to purify muddy river water at outposts." }
          ],
          processing: [
            { step: "Harvest fresh green compound leaves from branch stems and rinse in clean purified water.", time: "Day 1" },
            { step: "Dry leaves inside a dark, well-ventilated room. Direct solar UV radiation destroys active vitamins.", time: "Day 2-5" },
            { step: "Grind dried crisp leaves in a dry mortar to compile a fine green powder. Dose into pediatric porridge.", time: "Day 6" }
          ],
          lookAlikeName: "African Moringa (Moringa stenopetala)",
          lookAlikeWarning: "African Moringa has significantly larger, oval-pointed leaves and wider ribbed seed pods, but possesses similar nutritional profiles.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Moringa tripinnate stem */}
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#65a30d" strokeWidth="3" />
              {/* Leaflet splits */}
              <path d="M 120 120 Q 155 100, 160 90 M 180 80 Q 215 60, 220 50" fill="none" stroke="#65a30d" strokeWidth="1.5" />
              
              {/* Symmetrical oval smooth leaflets */}
              <ellipse cx="140" cy="110" rx="10" ry="7" fill="#3f6212" stroke="#1e293b" strokeWidth="1" transform="rotate(-20, 140, 110)" />
              <ellipse cx="150" cy="95" rx="10" ry="7" fill="#3f6212" stroke="#1e293b" strokeWidth="1" transform="rotate(-20, 150, 95)" />
              <ellipse cx="200" cy="70" rx="10" ry="7" fill="#3f6212" stroke="#1e293b" strokeWidth="1" transform="rotate(-20, 200, 70)" />
              <ellipse cx="210" cy="55" rx="10" ry="7" fill="#3f6212" stroke="#1e293b" strokeWidth="1" transform="rotate(-20, 210, 55)" />

              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Therapeutic Moringa Leaflet</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Small, oval compound leaves with smooth edges</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* African Moringa larger leaflets */}
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#0284c7" strokeWidth="3" />
              <path d="M 120 120 Q 160 90, 170 80" fill="none" stroke="#0284c7" strokeWidth="1.5" />
              
              {/* Distinctly larger pointed leaflets */}
              <ellipse cx="145" cy="100" rx="18" ry="11" fill="#0369a1" stroke="#0f172a" strokeWidth="1" transform="rotate(-15, 145, 100)" />
              
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">African Moringa (M. stenopetala)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Significantly larger, pointed oval leaflets</text>
            </svg>
          )
        };

      case 'aloe':
        return {
          title: "Soothing Succulent (Aloe)",
          scientific: "Aloe vera L. structural taxonomy",
          description: "A stemless succulent with fleshy, water-storing green leaves. The inner clear mucilaginous gel contains potent anti-inflammatory glycoproteins. The yellow sap (aloin latex) directly beneath the leaf rind is a powerful anthraquinone purgative that must be fully drained.",
          parts: [
            { part: "Inner Clear Gel", use: "Applied topically for solar actinic dermatitis (sunburns), wound soothing, and localized skin ulcers." }
          ],
          processing: [
            { step: "Sever a mature leaf from the base and stand it vertically in a clean jar to drain the yellow, bitter aloin latex.", time: "15 Mins" },
            { step: "Surgically slice off the spiny leaf margins using a clean, sharp scalpel or blade.", time: "Bedside" },
            { step: "Fillet the top green rind off, scrape the pure clear inner gel, and apply directly to affected skin surfaces.", time: "Bedside" }
          ],
          lookAlikeName: "Cape Aloe (Aloe ferox)",
          lookAlikeWarning: "Cape Aloe leaves have sharp spines running along the middle surfaces of the leaf, and contain significantly higher levels of purgative aloin latex.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Fleshy sword-shaped succulent leaf */}
              <path d="M 60 180 Q 90 80, 160 50 Q 110 110, 80 180" fill="#3f6212" stroke="#1e293b" strokeWidth="1.5" />
              {/* Spines along edges */}
              <path d="M 72 140 L 76 138 M 85 110 L 89 108 M 102 85 L 106 83 M 122 68 L 126 66" stroke="#a3e635" strokeWidth="2" />
              
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Therapeutic Aloe vera Leaf</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Fleshy rosette, spikes restricted ONLY to edges</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Cape Aloe spiked leaf faces */}
              <path d="M 60 180 Q 90 80, 160 50 Q 110 110, 80 180" fill="#0369a1" stroke="#0f172a" strokeWidth="1.5" />
              {/* Spines on leaf center */}
              <circle cx="85" cy="140" r="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
              <circle cx="95" cy="120" r="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
              <circle cx="110" cy="95" r="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
              <circle cx="120" cy="80" r="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />

              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">CAPE ALOE (Aloe ferox)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Sharp thorns running along leaf surface faces</text>
            </svg>
          )
        };

      case 'warburgia':
        return {
          title: "Muthiga (Pepper-bark Tree)",
          scientific: "Warburgia salutaris L. taxonomy",
          description: "A highly valued indigenous East African evergreen tree. The pepper-tasting leaves and red-brown bark yield powerful sesquiterpene dialdehydes (such as warburganal) which have robust antibacterial and bronchial anti-inflammatory activities. Must be carefully distinguished from the cardiotoxic Ordeal Tree.",
          parts: [
            { part: "Inner Bark Slabs", use: "Boiled in water or milk to treat respiratory distress, severe dry coughs, and fevers." },
            { part: "Glossy Leaves", use: "Chewed directly or brewed in warm water as an active antipyretic throat-soothing wash." }
          ],
          processing: [
            { step: "Harvest small, sustainable bark strips from the trunk. Never ring-bark or girdle the tree.", time: "Day 1" },
            { step: "Scrape the rough grey outer bark to reveal the aromatic, pepper-tasting red-brown inner bark layer.", time: "Day 1" },
            { step: "Dry bark slabs thoroughly in shade, grind into a coarse powder, and store in airtight glass jars.", time: "Day 2-6" }
          ],
          lookAlikeName: "Ordeal Tree (Erythrophleum suaveolens)",
          lookAlikeWarning: "Ordeal Tree bark contains highly cardiotoxic alkaloids (erythrophleine) causing rapid heart failure. Muthiga bark is easily distinguished by its strong, peppery, burning taste, completely absent in the Ordeal Tree.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#65a30d" strokeWidth="3" />
              <path d="M 120 120 C 140 100, 165 95, 185 105 C 160 120, 140 120, 120 120" fill="#15803d" stroke="#166534" strokeWidth="1" />
              <path d="M 170 85 C 190 65, 215 60, 235 70 C 210 85, 190 85, 170 85" fill="#15803d" stroke="#166534" strokeWidth="1" />
              <rect x="200" y="110" width="80" height="40" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
              <path d="M 205 120 L 275 120 M 205 130 L 275 130 M 205 140 L 275 140" stroke="#b45309" strokeWidth="1.5" />
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Muthiga (Peppery Bark)</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Alternate leaves, aromatic red-brown inner bark</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#0284c7" strokeWidth="3" />
              <ellipse cx="120" cy="110" rx="12" ry="7" fill="#0369a1" stroke="#0f172a" strokeWidth="1" transform="rotate(20, 120, 110)" />
              <ellipse cx="135" cy="115" rx="12" ry="7" fill="#0369a1" stroke="#0f172a" strokeWidth="1" transform="rotate(20, 135, 115)" />
              <rect x="200" y="110" width="80" height="40" rx="4" fill="#4b5563" stroke="#1f2937" strokeWidth="2" />
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">ORDEAL TREE (Highly Toxic)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Opposite leaflets, odorless grey bark</text>
            </svg>
          )
        };

      case 'kigelia':
        return {
          title: "Muua (Sausage Tree)",
          scientific: "Kigelia africana L. structure",
          description: "A famous sub-Saharan tropical tree producing enormous, heavy grey woody sausage-like fruits hanging from long rope-like stalks. Fleshy fruit pulp contains active iridoids, flavonoids, and quinones that act as potent antibacterial and cicatrizant wound healers. Raw green fruit is toxic and highly purgative.",
          parts: [
            { part: "Hanging Sausage Fruit", use: "Slices are dried and ground to formulate topical pastes for severe tropical skin ulcers, syphilitic lesions, and eczema." },
            { part: "Red Trumpet Flowers", use: "Crushed and applied topically to relieve localized swelling and spider bites." }
          ],
          processing: [
            { step: "Harvest fully mature grey hanging fruits. Never use green or rotting fallen specimens.", time: "Day 1" },
            { step: "Slice the dense fibrous sausage fruit into thin rounds and dry completely under intense tropical sun.", time: "Day 2-6" },
            { step: "Grind dried slices into a fine grey powder. Mix with clean water to formulate a thick wound paste.", time: "Day 7" }
          ],
          lookAlikeName: "Toxic Fruit Climber (Spathelia)",
          lookAlikeWarning: "Spathelia produces hanging clusters of small red-orange toxic berries rather than enormous, single grey woody sausage-like fruits.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 160 10 L 160 100" fill="none" stroke="#71717a" strokeWidth="2.5" />
              <ellipse cx="160" cy="135" rx="22" ry="42" fill="#71717a" stroke="#3f3f46" strokeWidth="2.5" />
              <path d="M 152 110 C 150 130, 150 150, 155 165 M 168 105 C 170 125, 172 145, 170 160" fill="none" stroke="#52525b" strokeWidth="1.5" />
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Muua (Hanging Sausage Fruit)</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Massive grey woody sausage shape on rope-like stem</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 160 10 L 160 100" fill="none" stroke="#0284c7" strokeWidth="2.5" />
              <circle cx="145" cy="110" r="5" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />
              <circle cx="160" cy="115" r="5" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />
              <circle cx="175" cy="110" r="5" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />
              <circle cx="150" cy="130" r="5" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />
              <circle cx="165" cy="135" r="5" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">TOXIC CLIMBER FRUIT</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Small red berry clusters, completely lacking woody sausage shape</text>
            </svg>
          )
        };

      case 'mondia':
        return {
          title: "Mukombero (White's Ginger)",
          scientific: "Mondia whitei root taxonomy",
          description: "A woody climbing vine popular throughout East and Southern Africa. Fleshy, sweet vanilla-scented roots are packed with aromatic aldehydes, zinc, and saponins. Serves as a powerful natural adaptogen, fatigue booster, and digestive aid. Must be carefully distinguished from cardiotoxic Wild Silk Vine.",
          parts: [
            { part: "Fleshy Roots", use: "Chewed fresh or dried and brewed as an organic adaptogen, appetite stimulant, and stress reliever." }
          ],
          processing: [
            { step: "Surgically harvest lateral roots from mature vines, leaving the main taproot intact to preserve the plant.", time: "Day 1" },
            { step: "Rinse roots thoroughly in clean water and peel away the thin, outer bark layer to expose the white inner root core.", time: "Day 1" },
            { step: "Slice white cores into strips, dry completely in shade, and store in sealed containers.", time: "Day 2-5" }
          ],
          lookAlikeName: "Wild Silk Vine (Periploca linearifolia)",
          lookAlikeWarning: "Wild Silk Vine roots contain cardiotoxic cardiac glycosides. Mondia leaves are broad and heart-shaped, whereas Wild Silk Vine has extremely thin, needle-like linear leaves.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 40 180 C 80 120, 160 80, 280 60" fill="none" stroke="#65a30d" strokeWidth="2.5" />
              <path d="M 120 120 C 110 100, 120 90, 135 90 C 150 90, 160 100, 150 120 C 140 135, 130 135, 120 120" fill="#15803d" stroke="#166534" strokeWidth="1" />
              <path d="M 220 120 Q 240 140, 220 170 M 230 120 Q 210 145, 240 175 M 240 125 Q 260 150, 235 180" fill="none" stroke="#d97706" strokeWidth="3" />
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Mukombero (Broad Heart Leaf)</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Broad heart-shaped leaves, vanilla-scented fibrous roots</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 40 180 C 80 120, 160 80, 280 60" fill="none" stroke="#0284c7" strokeWidth="2.5" />
              <line x1="120" y1="120" x2="160" y2="105" stroke="#0369a1" strokeWidth="2" />
              <line x1="180" y1="90" x2="220" y2="80" stroke="#0369a1" strokeWidth="2" />
              <path d="M 220 120 Q 240 140, 220 170" fill="none" stroke="#4b5563" strokeWidth="3" />
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">WILD SILK VINE (Cardiotoxic)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Needle-like linear leaves, odorless toxic roots</text>
            </svg>
          )
        };

      case 'prunus':
        return {
          title: "Muiri (Red Stinkwood)",
          scientific: "Prunus africana tree taxonomy",
          description: "An iconic montane forest tree native to high-elevation tropical Africa. The aromatic inner bark contains powerful phytosterols (such as beta-sitosterol) and pentacyclic triterpenes that inhibit growth factors to reduce prostatic swellings, fevers, and urinary distress.",
          parts: [
            { part: "Red Inner Bark", use: "Standardized aqueous boiling decoction to treat benign prostatic hyperplasia (BPH) fevers and urinary discomfort." }
          ],
          processing: [
            { step: "Harvest bark using strict opposite-quarter panels to protect cambium and prevent tree death.", time: "Day 1" },
            { step: "Rinse and peel outer grey mossy bark to isolate the aromatic, red-brown, almond-scented inner bark layers.", time: "Day 1" },
            { step: "Chop into small slabs, dry fully in shaded well-ventilated outposts, and grind into a red-brown powder.", time: "Day 2-7" }
          ],
          lookAlikeName: "Wild Coca (Erythroxylum)",
          lookAlikeWarning: "Wild Coca has dull odorless bark completely lacking the distinct almond-like scent of therapeutic Muiri, and produces small red berries.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#65a30d" strokeWidth="3.5" />
              <path d="M 120 120 C 145 105, 160 105, 175 110 C 150 125, 135 125, 120 120" fill="#166534" stroke="#14532d" strokeWidth="1" />
              <path d="M 180 85 C 205 70, 220 70, 235 75 C 210 90, 195 90, 180 85" fill="#166534" stroke="#14532d" strokeWidth="1" />
              <rect x="220" y="115" width="70" height="40" rx="3" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
              <path d="M 225 125 C 235 125, 255 125, 285 125 M 225 135 C 235 135, 255 135, 285 135" stroke="#fca5a5" strokeWidth="1" />
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Muiri (Almond-Scented Bark)</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Glossy alternate leaves, deep red almond-scented inner bark</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 60 170 C 120 120, 200 70, 280 40" fill="none" stroke="#0284c7" strokeWidth="3.5" />
              <path d="M 120 120 C 145 110, 160 110, 175 115" fill="none" stroke="#0369a1" strokeWidth="1.5" />
              <circle cx="130" cy="130" r="4.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
              <circle cx="140" cy="132" r="4.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
              <rect x="220" y="115" width="70" height="40" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="2" />
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">WILD COCA (No Scent)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Odorless dry brown bark, small red toxic berries</text>
            </svg>
          )
        };

      case 'astragalus':
        return {
          title: "Huangqi (Astragalus)",
          scientific: "Astragalus membranaceus root taxonomy",
          description: "A premier adaptogen in traditional medicine. The thick yellow taproot is dense in astragaloside saponins and polysaccharides. Indicated as a powerful immune stimulant in SAM recovery, increasing white blood cell count. Must be distinguished from toxic sweetvetches.",
          parts: [
            { part: "Fibrous Yellow Taproot", use: "Sliced and boiled in clinical soups or decoctions to treat chronic fatigue, anemia, and boost immune responses." }
          ],
          processing: [
            { step: "Harvest mature roots from 4-5 year old plants during autumn to maximize active saponin content.", time: "Year 4" },
            { step: "Wash thoroughly, slice transversely into thin rounds (4mm thick), and shade-dry completely.", time: "Day 1-4" }
          ],
          lookAlikeName: "Wild Sweetvetch (Hedysarum)",
          lookAlikeWarning: "Wild Sweetvetch roots look visually identical but contain solid white cores that completely lack the distinctive radial spokewheel yellow rays of therapeutic Huangqi.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <circle cx="160" cy="100" r="45" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
              <circle cx="160" cy="100" r="25" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="160" y1="100" x2="160" y2="58" stroke="#d97706" strokeWidth="2.5" />
              <line x1="160" y1="100" x2="160" y2="142" stroke="#d97706" strokeWidth="2.5" />
              <line x1="160" y1="100" x2="118" y2="100" stroke="#d97706" strokeWidth="2.5" />
              <line x1="160" y1="100" x2="202" y2="100" stroke="#d97706" strokeWidth="2.5" />
              <line x1="160" y1="100" x2="130" y2="70" stroke="#d97706" strokeWidth="2" />
              <line x1="160" y1="100" x2="190" y2="130" stroke="#d97706" strokeWidth="2" />
              <line x1="160" y1="100" x2="130" y2="130" stroke="#d97706" strokeWidth="2" />
              <line x1="160" y1="100" x2="190" y2="70" stroke="#d97706" strokeWidth="2" />
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Huangqi (Radial Spokewheel Rays)</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Circular taproot slice showing distinct radial spoke-like grain</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <circle cx="160" cy="100" r="45" fill="#f8fafc" stroke="#475569" strokeWidth="3" />
              <circle cx="160" cy="100" r="30" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">SWEETVETCH (Solid Core)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Solid white-grey root cross-section lacking radial spoke rays</text>
            </svg>
          )
        };

      case 'turmeric':
        return {
          title: "Turmeric Rhizome Root",
          scientific: "Curcuma longa L. taxonomy",
          description: "A highly potent rhizomatous perennial herb of the ginger family. The rich orange-yellow inner flesh is packed with active Curcuminoids, serving as a robust anti-inflammatory agent that works concurrently with black pepper to relieve severe joint pain. Must be distinguished from pale-fleshed Wild Cannas.",
          parts: [
            { part: "Knobby Rhizome Root", use: "Dried and ground to formulate a vibrant orange powder for inflammatory arthritis and joint fevers." }
          ],
          processing: [
            { step: "Dig up mature orange rhizomes after the leaf stalks dry down completely.", time: "Month 9" },
            { step: "Boil fresh rhizomes in water for 45 minutes to gelatinize starch and lock in curcuminoids, then slice.", time: "Day 1" },
            { step: "Sun-dry sliced rounds completely for 5-7 days until extremely hard and brittle. Mill into a fine powder.", time: "Day 2-8" }
          ],
          lookAlikeName: "Wild Canna Rhizome (Curcuma aromatica)",
          lookAlikeWarning: "Wild Canna rhizomes look identical externally, but have dull white-green or pale grey inner flesh completely lacking the deep, vibrant orange-yellow curcumin pigmentation.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 80 130 C 90 90, 130 90, 150 110 C 170 95, 210 95, 230 130 C 200 160, 110 160, 80 130 Z" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
              <path d="M 120 102 C 122 80, 140 80, 145 95" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
              <path d="M 175 102 C 178 80, 195 80, 200 95" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
              <path d="M 100 120 Q 105 140, 110 150 M 140 120 Q 142 145, 142 152 M 190 120 Q 185 145, 180 152" fill="none" stroke="#ea580c" strokeWidth="1.5" />
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Therapeutic Turmeric Rhizome</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Vibrant orange-yellow inner core flesh, segmented knobs</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 80 130 C 90 90, 130 90, 150 110 C 170 95, 210 95, 230 130 C 200 160, 110 160, 80 130 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">WILD CANNA RHIZOME</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Dull green-grey or pale white inner core flesh, no curcumin pigment</text>
            </svg>
          )
        };

      default:
        return {
          title: "Soothing Succulent (Aloe)",
          scientific: "Aloe vera L. structural taxonomy",
          description: "A stemless succulent with fleshy, water-storing green leaves. The inner clear mucilaginous gel contains potent anti-inflammatory glycoproteins. The yellow sap (aloin latex) directly beneath the leaf rind is a powerful anthraquinone purgative that must be fully drained.",
          parts: [
            { part: "Inner Clear Gel", use: "Applied topically for solar actinic dermatitis (sunburns), wound soothing, and localized skin ulcers." }
          ],
          processing: [
            { step: "Sever a mature leaf from the base and stand it vertically in a clean jar to drain the yellow, bitter aloin latex.", time: "15 Mins" },
            { step: "Surgically slice off the spiny leaf margins using a clean, sharp scalpel or blade.", time: "Bedside" },
            { step: "Fillet the top green rind off, scrape the pure clear inner gel, and apply directly to affected skin surfaces.", time: "Bedside" }
          ],
          lookAlikeName: "Cape Aloe (Aloe ferox)",
          lookAlikeWarning: "Cape Aloe leaves have sharp spines running along the middle surfaces of the leaf, and contain significantly higher levels of purgative aloin latex.",
          svgTherapeutic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 60 180 Q 90 80, 160 50 Q 110 110, 80 180" fill="#3f6212" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 72 140 L 76 138 M 85 110 L 89 108 M 102 85 L 106 83 M 122 68 L 126 66" stroke="#a3e635" strokeWidth="2" />
              <text x="15" y="25" fill="#15803d" className="text-[10px] font-black uppercase tracking-wider">Therapeutic Aloe vera Leaf</text>
              <text x="15" y="40" fill="#475569" className="text-[9px] font-bold">Fleshy rosette, spikes restricted ONLY to edges</text>
            </svg>
          ),
          svgToxic: (
            <svg viewBox="0 0 320 200" className="w-full h-full bg-slate-50 rounded-xl" xmlns="http://www.w3.org/2000/svg">
              <path d="M 60 180 Q 90 80, 160 50 Q 110 110, 80 180" fill="#0369a1" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="85" cy="140" r="1.5" fill="#ef4444" stroke="#7f1d1d" stroke="0.5" strokeWidth="0.5" />
              <circle cx="95" cy="120" r="1.5" fill="#ef4444" stroke="#7f1d1d" stroke="0.5" strokeWidth="0.5" />
              <circle cx="110" cy="95" r="1.5" fill="#ef4444" stroke="#7f1d1d" stroke="0.5" strokeWidth="0.5" />
              <circle cx="120" cy="80" r="1.5" fill="#ef4444" stroke="#7f1d1d" stroke="0.5" strokeWidth="0.5" />
              <text x="15" y="25" fill="#e11d48" className="text-[10px] font-black uppercase tracking-wider">CAPE ALOE (Aloe ferox)</text>
              <text x="15" y="40" fill="#e11d48" className="text-[9px] font-bold">Sharp thorns running along leaf surface faces</text>
            </svg>
          )
        };
    }
  };

  const data = getBotanicalData();

  return (
    <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-md space-y-6 animate-scale-up">
      {/* Header Info */}
      <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-4">
        <div>
          <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-block mb-1">
            Botanical Taxonomy Map
          </span>
          <h3 className="text-xl font-extrabold text-[hsl(var(--primary-green))] leading-tight font-outfit">
            {data.title}
          </h3>
          <p className="text-xs italic text-slate-400 font-medium">
            {data.scientific}
          </p>
        </div>
        <Sprout className="h-6 w-6 text-emerald-800 shrink-0" />
      </div>

      {/* SVG Image container with Toggle */}
      <div className="space-y-3">
        <div className="relative w-full overflow-hidden border border-slate-150 rounded-2xl shadow-inner bg-slate-50 flex items-center justify-center p-1">
          {showLookAlike ? data.svgToxic : data.svgTherapeutic}
        </div>

        {/* Toxic look-alike interactive slider/toggle */}
        <div className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600 animate-pulse" /> Critical Look-Alike Warning
            </span>
            <p className="text-[10px] text-slate-500 font-medium leading-normal">
              Compare with toxic: <strong className="font-bold text-slate-700">{data.lookAlikeName}</strong>.
            </p>
          </div>
          <button
            onClick={onToggleLookAlike}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
              showLookAlike 
                ? 'bg-rose-650 hover:bg-rose-750 text-white shadow-md' 
                : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> {showLookAlike ? "Show Healing Species" : "Show Toxic Look-Alike"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Core Description */}
        <p className="text-xs text-slate-655 leading-relaxed">
          {data.description}
        </p>

        {/* Parts used & preparation checklists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/40">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sprout className="h-4 w-4 text-emerald-700" /> Active Parts Utilized
            </h4>
            <div className="space-y-3 pt-1">
              {data.parts.map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px] leading-relaxed">
                  <span className="font-bold text-slate-850 block">{item.part}</span>
                  <p className="text-slate-500 leading-normal">{item.use}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/40">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-700" /> Shade/Processing steps
            </h4>
            <div className="space-y-3 pt-1">
              {data.processing.map((item, idx) => (
                <div key={idx} className="flex gap-2 text-[10px] leading-normal">
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded h-fit self-start shrink-0">
                    {item.time}
                  </span>
                  <p className="text-slate-555 leading-normal">{item.step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showLookAlike && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-xs space-y-1 animate-scale-up leading-relaxed">
            <span className="font-extrabold block">⚠️ TOXIC LOOK-ALIKE ADVISORY</span>
            <p className="text-[11px] opacity-90">{data.lookAlikeWarning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
