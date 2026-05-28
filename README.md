# THIS — Tropical Health Information System

> **A Clinical-Grade, 100% Offline-Sovereign Outpost Triage Portal for Tropical Medicine and Traditional Ethnobotanical Remedies.**

THIS (Tropical Health Information System) is a highly specialized documentation database and clinical support system designed specifically for healthcare practitioners operating in remote, resource-poor tropical outposts. Built as a Progressive Web App (PWA), the system operates entirely client-side without requiring external server calls, ensuring 100% operational sovereignty in regions lacking active internet access.

---

## 🌟 Clinical Features

### 1. WHO-Aligned GRADE Evidence Matrix
*   **Scientific Quality Rating**: Every remedy outcome is rigorously evaluated against the global **GRADE framework** (Grading of Recommendations Assessment, Development and Evaluation), displaying quality tiers (`High`, `Moderate`, `Low`, `Very Low`).
*   **Strength of Recommendation**: Differentiates treatment interventions based on clear clinical boundaries (`Strong For`, `Conditional For`, `Conditional Against`, `Strong Against`) to guide actual bedside triage.
*   **Indigenous Respect & Traditional Alignment**: Traditional botanical preparations (e.g. Moringa, Baobab, Guava) are integrated side-by-side with modern pharmaceutical trial data, marked with **Traditional Alignment** indicators (`High`, `Emerging`, `Unaligned`).

### 2. Weight-Based Outpost Dosage Calculator
*   **WHO ORS Pediatric Rehydration (Plan A/B/C)**: Automatically calculates dehydration fluid intake targets over a 4-hour timeline based on patient weight ($75\text{ml} \times \text{kg}$), providing interactive caregiver checklists and clinical red flags.
*   **Artemether-Lumefantrine (ACT) 6-Dose Hour-By-Hour Timeline**: Pre-schedules all 6 doses (0h, 8h, 24h, 36h, 48h, 60h) based on a designated initial intake time. Tracks course completion, fat-absorption guidelines, and vomiting recovery protocols.
*   **Dewormer & Supplement Calibration**: Computes precise adjusted pediatric dosages for Albendazole deworming and dispersible Zinc Sulfate solutions.

### 3. Climate Vector Outbreak Simulator
*   **Interactive Parameters**: Adjust **Temperature**, **Humidity**, and **Rainfall** parameters using granular dials.
*   **Vector Propagation Indexes**: Computes real-time risk gauges for Anopheles vector breeding, Aedes Dengue spikes, and fecal Cholera water-well contamination levels.
*   **Preventative Action Plans**: Automatically alerts clinicians with preventative outpost tasks when severe weather triggers active threat scores.

### 4. Fuzzy Synonym Search Engine
*   **Spelling Error Resiliency**: Utilizes a fast, client-side **Levenshtein Distance** string parsing engine to match searches despite local spelling errors (e.g., matching "quiniformim" to Quinine or "bilharza" to Schistosomiasis).
*   **Synonym & Botanical Aliases**: Automatically indexes common synonyms and local names (e.g., matching "pawpaw" or "mugongo" to Papaya Leaf Extract).

### 5. Printable A4 PDF Clinic Exports
*   Customized `@media print` style overrides hide sidebar controls and layout headers.
*   Formulates diagnostic checklists, rehydration guidelines, and condition-specific reference sheets into clean, black-and-white grids optimized for physical paper printouts.

---

## 🛠️ Technology Stack

*   **Core**: React (Vite-powered) + ES6 Javascript
*   **Styling**: Modern CSS + Tailwind CSS v4
*   **Offline Support**: `vite-plugin-pwa` precaching PWA assets (sw.js + Workbox)
*   **Icons**: Lucide React
*   **Hosting**: Netlify with integrated Invite-Only **Netlify Identity** authentication for CMS editors

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/stephenajulu/thisv1.git
   cd thisv1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server locally:
   ```bash
   npm run dev
   ```
4. Build the PWA optimized bundle for production:
   ```bash
   npm run build
   ```

---

## 📋 Governance & Clinical Integrity
THIS adopts a strict peer-review moderation and PR pipeline. To maintain clinical accuracy and prevent maternal/pediatric toxicities:
*   Changes to the relational database require peer-review under guidelines documented in `medical_pr_moderation.md`.
*   Netlify CMS settings are restricted to invite-only medical editors under workflows detailed in `netlify_identity_guide.md`.
