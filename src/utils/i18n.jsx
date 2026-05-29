import React, { createContext, useContext, useState } from 'react';

const I18nContext = createContext(null);

export const dictionaries = {
  en: {
    // Navigation & Common
    search: "Search & Navigator",
    matrix: "Evidence Matrix",
    safety: "Safety Checker",
    toolkit: "Clinical Toolkit",
    countyContext: "County Context",
    clinicianMode: "Clinician Mode",
    active: "Active",
    inactive: "Inactive",
    proActive: "PRO Active",
    proPaywall: "Unlock Clinical Access",
    dosage: "Dosage Calculator",
    weatherForecast: "Weather Forecast",
    outbreakMap: "Epidemic Outbreak Map",
    synergyMatrix: "Synergy Explorer",
    atlas: "Visual Medical Atlas",
    clinicianRef: "Clinician Quick-Ref",
    blog: "Clinical Blog",
    vault: "Community Vault",
    submissions: "Ethnobotany Pipeline",
    adminConsole: "Admin Center",
    highContrast: "High Contrast (Low Vision)",
    standardContrast: "Standard Contrast",
    language: "Language",
    
    // Safety Checker
    remedySafetyTitle: "Interactive Botanical & Clinical Safety Checker",
    safetyAdvisorDesc: "Cross-reference natural remedies and pharmaceutical compounds against specific vulnerable patient demographics to prevent toxicity and drug-herb interactions.",
    targetDemographic: "1. Vulnerable Demographic",
    selectTargetGroup: "-- Select Target Group --",
    targetRemedy: "2. Remedy or Botanical",
    selectTreatment: "-- Select Treatment --",
    reset: "Reset",
    safetyAlert: "Safety Alert",
    contraindications: "CONTRAINDICATIONS & SAFETY ALERTS",
    drugInteractions: "KNOWN DRUG INTERACTIONS",
    specs: "Remedy Specs",
    demographicProfile: "Demographic Profile",
    criticalAdvisories: "CRITICAL CLINICAL ADVISORIES",
    diliTitle: "DILI & RUCAM Auditor",
    diliDescription: "Assess patient drug-induced liver injury risks using the Roussel Uclaf Causality Assessment Method (RUCAM).",
    labCalculators: "Hepatic Injury & R-Value Calculator",
    patientAlt: "Patient ALT (U/L)",
    altUln: "ALT ULN (U/L)",
    patientAlp: "Patient ALP (U/L)",
    alpUln: "ALP ULN (U/L)",
    activePattern: "Active Hepatic Pattern",
    rRatio: "R-Ratio",
    rucamScore: "RUCAM Score",
    causalityBadge: "Causality Grade",
    gradeDirective: "GRADE Outpost Directive",
    printReport: "Print Report",
    resetAudit: "Reset Audit",

    // Navigator
    searchPlaceholder: "Search conditions, remedies, Swahili/Luhya plant names...",
    endemicBadge: "Endemic in Region",
    vernacularTitle: "Dialect / Vernacular Plant Names",
    allPrevalentTitle: "County Context Prevalent Conditions First",
    otherConditionsTitle: "All Remaining Registered Conditions",
    synced: "Synced",
    syncing: "Syncing...",
    syncError: "Sync Error",
    pending: "Staged",
  },
  sw: {
    // Navigation & Common
    search: "Tafuta na Navigeta",
    matrix: "Jedwali la Ushahidi",
    safety: "Kikagua Usalama",
    toolkit: "Zana za Kliniki",
    countyContext: "Muktadha wa Kaunti",
    clinicianMode: "Njia ya Daktari",
    active: "Inafanya kazi",
    inactive: "Haifanyi kazi",
    proActive: "PRO Imewezeshwa",
    proPaywall: "Fungua Huduma za Kliniki",
    dosage: "Kikokotoo cha Kipimo",
    weatherForecast: "Utabiri wa Hali ya Hewa",
    outbreakMap: "Ramani ya Magonjwa",
    synergyMatrix: "Kikagua Mwingiliano",
    atlas: "Ramani ya Picha ya Tiba",
    clinicianRef: "Rejea ya Haraka ya Daktari",
    blog: "Blogu ya Kliniki",
    vault: "Kuhifadhi Jamii (Vault)",
    submissions: "Uwasilishaji wa Dawa za Asili",
    adminConsole: "Kituo cha Utawala",
    highContrast: "Tofauti ya Juu (Uoni Hafifu)",
    standardContrast: "Tofauti ya Kawaida",
    language: "Lugha",
    
    // Safety Checker
    remedySafetyTitle: "Kikagua Usalama wa Dawa za Asili na Vidonge",
    safetyAdvisorDesc: "Linganisha dawa za asili na za hospitali dhidi ya makundi ya wagonjwa walio katika hatari ili kuzuia sumu na mwingiliano hatari.",
    targetDemographic: "1. Kundi la Wagonjwa",
    selectTargetGroup: "-- Chagua Kundi la Wagonjwa --",
    targetRemedy: "2. Aina ya Dawa",
    selectTreatment: "-- Chagua Matibabu --",
    reset: "Weka Upya",
    safetyAlert: "Tahadhari ya Usalama",
    contraindications: "MAONYO & TAHADHARI ZA USALAMA",
    drugInteractions: "MWINGILIANO WA DAWA UNAOJULIKANA",
    specs: "Vigezo vya Dawa",
    demographicProfile: "Wasifu wa Kundi la Wagonjwa",
    criticalAdvisories: "TAHADHARI MUHIMU ZA KLINIKI",
    diliTitle: "Kikagua Uharibifu wa Ini (DILI)",
    diliDescription: "Kadiria hatari ya uharibifu wa ini unaosababishwa na dawa kwa kutumia mfumo wa RUCAM.",
    labCalculators: "Kikokotoo cha R-Value cha Ini",
    patientAlt: "ALT ya Mgonjwa (U/L)",
    altUln: "ALT ULN ya Kawaida (U/L)",
    patientAlp: "ALP ya Mgonjwa (U/L)",
    alpUln: "ALP ULN ya Kawaida (U/L)",
    activePattern: "Mfumo wa Uharibifu wa Ini",
    rRatio: "Kiwango cha R-Ratio",
    rucamScore: "Alama za RUCAM",
    causalityBadge: "Daraja la Uhusiano",
    gradeDirective: "Mwongozo wa GRADE wa Kliniki",
    printReport: "Chapisha Ripoti",
    resetAudit: "Weka Upya Ukaguzi",

    // Navigator
    searchPlaceholder: "Tafuta magonjwa, dawa, majina ya Kiswahili/Luhya...",
    endemicBadge: "Ugonjwa wa Eneo Hili",
    vernacularTitle: "Majina ya Kienyeji na Lahaja",
    allPrevalentTitle: "Magonjwa ya Kawaida Katika Kaunti Hii Kwanza",
    otherConditionsTitle: "Magonjwa Mengine Yote Yaliyosajiliwa",
    synced: "Imesawazishwa",
    syncing: "Inasawazisha...",
    syncError: "Itilafu ya Kazi",
    pending: "Iliyosubirishwa",
  },
  fr: {
    // Navigation & Common
    search: "Recherche & Navigateur",
    matrix: "Matrice des Preuves",
    safety: "Vérificateur de Sécurité",
    toolkit: "Boîte à Outils Cliniques",
    countyContext: "Contexte du Comté",
    clinicianMode: "Mode Clinicien",
    active: "Actif",
    inactive: "Inactif",
    proActive: "PRO Activé",
    proPaywall: "Débloquer l'Accès Clinique",
    dosage: "Calculateur de Dosage",
    weatherForecast: "Prévisions Météo",
    outbreakMap: "Carte des Épidémies",
    synergyMatrix: "Explorateur de Synergie",
    atlas: "Atlas Médical Visuel",
    clinicianRef: "Réf Rapide du Clinicien",
    blog: "Blog Clinique",
    vault: "Coffre-fort Communautaire",
    submissions: "Soumission d'Ethnobotanique",
    adminConsole: "Centre d'Administration",
    highContrast: "Contraste Élevé (Basse Vision)",
    standardContrast: "Contraste Standard",
    language: "Langue",
    
    // Safety Checker
    remedySafetyTitle: "Vérificateur Interactif de Sécurité Botanique & Clinique",
    safetyAdvisorDesc: "Comparez les remèdes naturels et les composés pharmaceutiques avec des groupes de patients vulnérables pour éviter la toxicité et les interactions.",
    targetDemographic: "1. Groupe Démographique Vulnérable",
    selectTargetGroup: "-- Sélectionner le Groupe Cible --",
    targetRemedy: "2. Remède ou Plante",
    selectTreatment: "-- Sélectionner le Traitement --",
    reset: "Réinitialiser",
    safetyAlert: "Alerte de Sécurité",
    contraindications: "CONTRE-INDICATIONS & ALERTES DE SÉCURITÉ",
    drugInteractions: "INTERACTIONS MÉDICAMENTEUSES CONNUES",
    specs: "Spécifications du Remède",
    demographicProfile: "Profil Démographique",
    criticalAdvisories: "ALERTES CLINIQUES CRITIQUES",
    diliTitle: "Auditeur DILI & RUCAM",
    diliDescription: "Évaluez les risques de lésions hépatiques toxiques induites par les médicaments à l'aide du score RUCAM.",
    labCalculators: "Calculateur de R-Value et Lésion Hépatique",
    patientAlt: "ALT du Patient (U/L)",
    altUln: "ALT LSN (U/L)",
    patientAlp: "ALP du Patient (U/L)",
    alpUln: "ALP LSN (U/L)",
    activePattern: "Type d'Atteinte Hépatique",
    rRatio: "R-Ratio",
    rucamScore: "Score RUCAM",
    causalityBadge: "Niveau de Causalité",
    gradeDirective: "Directive Clinique GRADE",
    printReport: "Imprimer le Rapport",
    resetAudit: "Réinitialiser l'Audit",

    // Navigator
    searchPlaceholder: "Rechercher des maladies, remèdes, noms Swahili/Luhya...",
    endemicBadge: "Endémique dans la Région",
    vernacularTitle: "Noms en Dialecte / Vernaculaires",
    allPrevalentTitle: "Maladies Prévalentes du Comté d'Abord",
    otherConditionsTitle: "Toutes les Autres Maladies Enregistrées",
    synced: "Synchronisé",
    syncing: "Synchronisation...",
    syncError: "Erreur de Synchro",
    pending: "Stoppé",
  }
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('this_language') || 'en';
  });

  const changeLanguage = (newLang) => {
    if (dictionaries[newLang]) {
      setLang(newLang);
      localStorage.setItem('this_language', newLang);
    }
  };

  const t = (key) => {
    return dictionaries[lang][key] || dictionaries['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
