// src/components/ClinicalFlowcharts.jsx
import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Activity, 
  MapPin, 
  User, 
  Clock, 
  FileText, 
  Copy, 
  Plus, 
  Sparkles, 
  Heart, 
  Thermometer, 
  Volume2, 
  RefreshCw,
  Eye,
  Trash2,
  BookOpen
} from 'lucide-react';
import { database } from '../data/database';
import { useI18n } from '../utils/i18n';
import { getLocalizedRemedy } from '../utils/regionalHelper';

// Dynamic Decision Tree Node Definitions
const FLOWCHART_TREES = {
  malaria: {
    id: "malaria",
    title: "Malaria Triage Pathway (WHO Standard)",
    description: "Guided pediatric fever evaluation in endemic areas to distinguish severe malaria (urgent referral) from uncomplicated malaria and non-malarial fevers.",
    startNode: "q_high_risk",
    nodes: {
      q_high_risk: {
        text: "Is this a high malaria risk county context or has the child traveled to one within the last 14 days?",
        help: "Mombasa, Kakamega, and Kisumu represent highly active endemic vectors. Arid zones like Lodwar or elevated zones like Nairobi have lower local transmission but traveler risk.",
        options: [
          { text: "YES (Endemic / Travel)", nextNode: "q_danger_signs" },
          { text: "NO (Low Risk / No Travel)", nextNode: "q_non_malaria_fever" }
        ]
      },
      q_danger_signs: {
        text: "Does the child exhibit any general danger signs? (Unable to drink/breastfeed, vomits everything, convulsions during this illness, or lethargic/unconscious?)",
        help: "Check clinical responsiveness. If the child is unconscious, can they be aroused? Active convulsions indicate immediate cerebral malaria hazard.",
        options: [
          { text: "YES (Danger Signs Present)", nextNode: "outcome_severe_malaria" },
          { text: "NO (No Danger Signs)", nextNode: "q_stiff_neck" }
        ]
      },
      q_stiff_neck: {
        text: "Does the child have a stiff neck or exhibit severe photophobia / neck rigidity?",
        help: "A stiff neck is a highly critical indicator of concurrent Meningitis or extreme cerebral malaria loading.",
        options: [
          { text: "YES (Rigidity Present)", nextNode: "outcome_severe_malaria" },
          { text: "NO", nextNode: "q_respiration" }
        ]
      },
      q_respiration: {
        text: "Is there fast breathing (Tachypnea) or chest indrawing?",
        help: "Check respiratory counts. Under 2 months: >=60 breaths/min. 2-11 months: >=50 breaths/min. 12-59 months: >=40 breaths/min.",
        options: [
          { text: "YES (Fast Breathing / Indrawing)", nextNode: "outcome_pneumonia_malaria" },
          { text: "NO (Normal Respiration)", nextNode: "outcome_uncomplicated_malaria" }
        ]
      },
      q_non_malaria_fever: {
        text: "Does the child have any other localized fever sources? (Severe ear discharge, painful throat swelling, active skin abscesses, or severe measles rashes?)",
        help: "Fever in low-risk zones without travel is usually caused by non-vector infections, but requires targeted diagnostic review.",
        options: [
          { text: "YES (Other localized infection)", nextNode: "outcome_localized_fever" },
          { text: "NO (Cough or simple cold)", nextNode: "outcome_simple_cold" }
        ]
      },
      // Outcomes
      outcome_severe_malaria: {
        isOutcome: true,
        category: "red",
        name: "SEVERE MALARIA & VERY SEVERE FEBRILE DISEASE",
        directive: "URGENT BEDSIDE INTERVENTION REQUIRED. Set up immediate referral. Administer first dose of pre-referral intramuscular Artesunate immediately. If convulsing, administer rectal Diazepam. Manage severe high fever with tepid sponge bathing.",
        recommendations: [
          { drug: "IM Artesunate", dosage: "2.4 mg/kg body weight", route: "Intramuscular injection (lateral thigh)", schedule: "Give immediately (0h) before travel" },
          { drug: "Diazepam Rectal Gel", dosage: "0.5 mg/kg", route: "Rectal tube", schedule: "Give immediately if actively convulsing" }
        ],
        herbalAdvisory: "STRICT WARNING: Do not attempt to treat severe malaria with herbal decoctions or oral teas. Standard pharmaceutical ACTs and IM/IV medications are required immediately to prevent death.",
        gradeQuality: "High",
        citation: "WHO Guidelines for Malaria (2023) - Recommendation 4.2.2"
      },
      outcome_pneumonia_malaria: {
        isOutcome: true,
        category: "amber",
        name: "UNCOMPLICATED MALARIA & PNEUMONIA CO-INFECTION",
        directive: "Treat both malaria and bacterial pneumonia at the outpost. Administer a full 3-day course of first-line oral Artemether-Lumefantrine (ACT) and a 3-to-5-day course of oral Amoxicillin. Follow up in 48 hours.",
        recommendations: [
          { drug: "Artemether-Lumefantrine (20/120)", dosage: "Weight 5-14kg: 1 tab; 15-24kg: 2 tabs", route: "Oral (administer first dose under observation)", schedule: "Twice daily for 3 days" },
          { drug: "Amoxicillin Suspension (250mg/5mL)", dosage: "Weight <10kg: 5mL (250mg); Weight >=10kg: 10mL (500mg)", route: "Oral", schedule: "Twice daily for 5 days" }
        ],
        herbalAdvisory: "Supportive Care: Soothe throat and cough using standard traditional Fever Tea (Lippia javanica) in warm water. Turmeric + Black Pepper pairings may serve to reduce secondary cytokine joint inflammation, but MUST NOT replace the primary ACT/Amoxicillin regime.",
        gradeQuality: "High",
        citation: "WHO IMCI guidelines (2014) - Fever section"
      },
      outcome_uncomplicated_malaria: {
        isOutcome: true,
        category: "amber",
        name: "UNCOMPLICATED MALARIA",
        directive: "Treat malaria at the outpost. Give full 3-day course of oral Artemether-Lumefantrine (ACT) tablets. Do not give antibiotics. Provide supportive fever management.",
        recommendations: [
          { drug: "Artemether-Lumefantrine (20/120)", dosage: "Weight 5-14kg: 1 tab; 15-24kg: 2 tabs", route: "Oral with fatty food/milk", schedule: "Twice daily for 3 days" },
          { drug: "Paracetamol (120mg/5mL)", dosage: "10-15 mg/kg per dose", route: "Oral", schedule: "Every 6 hours as needed for high fever (>38.5°C)" }
        ],
        herbalAdvisory: "Supportive Care: Pair turmeric powder (curcumin) with a pinch of black pepper (piperine) to alleviate malaria-induced musculoskeletal joint pains. Keep child well hydrated.",
        gradeQuality: "High",
        citation: "WHO Guidelines for Malaria (2023)"
      },
      outcome_localized_fever: {
        isOutcome: true,
        category: "amber",
        name: "LOCALIZED BACTERIAL OR MEASLES FEVER",
        directive: "Treat the underlying localized infection. If ear discharge is present, flush ear canal and dry with wicks. If severe throat pain/wasting, review nutritional intake. If measles, give high-dose Vitamin A.",
        recommendations: [
          { drug: "Amoxicillin Suspension", dosage: "15 mg/kg per dose", route: "Oral", schedule: "Three times daily for 5 days" },
          { drug: "Vitamin A Capsules (100,000 IU)", dosage: "Weight <10kg: 100k IU; Weight >=10kg: 200k IU", route: "Oral", schedule: "Once immediately on Day 1 and Day 2" }
        ],
        herbalAdvisory: "Supportive Care: Apply cool extracts of Aloe vera gel topically for dry measles rashes to reduce skin itching. Soothe throat swelling using warm honey infusions.",
        gradeQuality: "Moderate",
        citation: "WHO IMCI Guidelines - Measles & Ear Infections Protocols"
      },
      outcome_simple_cold: {
        isOutcome: true,
        category: "green",
        name: "FEVER - COMMON COLD & SUPPORTIVE HOME CARE",
        directive: "No antibiotics or anti-malarials indicated. Educate caregiver on supportive home nursing. Clear child nasal blockages with saline drops. Watch closely for danger signs.",
        recommendations: [
          { drug: "Paracetamol Suspension", dosage: "125mg per dose (approx 5mL)", route: "Oral", schedule: "Every 6 hours strictly for high fever comfort" }
        ],
        herbalAdvisory: "Supportive Care: A warm tea prepared from Muthirithi/Fever Tea (Lippia javanica) is highly effective for soothing fever rigors and clearing upper airway congestions naturally.",
        gradeQuality: "Moderate",
        citation: "WHO IMCI Guidelines - Supportive Care Standard"
      }
    }
  },
  dehydration: {
    id: "dehydration",
    title: "Acute Dehydration & Cholera Triage",
    description: "Evaluates child hydration status during acute watery diarrhea to determine ORS schedules (Plan A/B) or urgent IV infusions (Plan C).",
    startNode: "q_dehyd_danger",
    nodes: {
      q_dehyd_danger: {
        text: "Is the patient lethargic, unconscious, or completely unable to drink/breastfeed?",
        help: "Check general responsiveness. A child with severe dehydration is too exhausted to drink and may slide into a hypovolemic coma rapidly.",
        options: [
          { text: "YES (Lethargic / Cannot Drink)", nextNode: "outcome_severe_dehyd" },
          { text: "NO", nextNode: "q_sunken_eyes" }
        ]
      },
      q_sunken_eyes: {
        text: "Are the patient's eyes clearly sunken or hollow?",
        help: "Ask the caregiver if the eyes look more sunken than usual. Hollow eyes indicate a significant loss of interstitial fluid.",
        options: [
          { text: "YES (Sunken Eyes)", nextNode: "q_skin_pinch" },
          { text: "NO", nextNode: "q_skin_pinch_no_eyes" }
        ]
      },
      q_skin_pinch: {
        text: "Perform a skin pinch test on the abdomen. Does the skin fold go back VERY slowly (strictly taking more than 2 seconds)?",
        help: "Pinch the skin of the abdomen halfway between the umbilicus and the side. Place thumb and forefinger vertically. Hold for 1 second, then release.",
        options: [
          { text: "YES (Very Slowly > 2s)", nextNode: "outcome_severe_dehyd" },
          { text: "NO (Returns quickly or slowly)", nextNode: "q_drinking_test" }
        ]
      },
      q_skin_pinch_no_eyes: {
        text: "Perform a skin pinch test on the abdomen. Does the skin fold go back slowly (taking less than 2 seconds but visible)?",
        help: "If skin pinch goes back slowly or the child drinks eagerly/thirsty, they have signs of some dehydration.",
        options: [
          { text: "YES (Slowly)", nextNode: "outcome_some_dehyd" },
          { text: "NO", nextNode: "q_diarrhea_duration" }
        ]
      },
      q_drinking_test: {
        text: "When offered water, does the patient drink eagerly or seem extremely thirsty?",
        help: "A child with 'Some Dehydration' is highly irritable and will grab the cup/spoon to drink greedily.",
        options: [
          { text: "YES (Thirsty / Drinks Eagerly)", nextNode: "outcome_some_dehyd" },
          { text: "NO (Normal drinking)", nextNode: "q_diarrhea_duration" }
        ]
      },
      q_diarrhea_duration: {
        text: "Has the acute watery diarrhea persisted for more than 14 days?",
        help: "Diarrhea lasting >=14 days is classified as Severe or Persistent Diarrhea, requiring specialized hydration, zinc, and referral gates.",
        options: [
          { text: "YES (Persistent Diarrhea)", nextNode: "outcome_persistent_diarrhea" },
          { text: "NO (Simple Diarrhea)", nextNode: "outcome_no_dehyd" }
        ]
      },
      // Outcomes
      outcome_severe_dehyd: {
        isOutcome: true,
        category: "red",
        name: "SEVERE DEHYDRATION - PLAN C INFUSION SCHEDULE",
        directive: "CRITICAL FLUID EMERGENCY. Set up intravenous access immediately. Administer Ringer's Lactate (or Normal Saline) IV infusion totaling 100 mL/kg divided into two rapid bolus phases. Check lung sounds for crackles.",
        recommendations: [
          { drug: "IV Ringer's Lactate", dosage: "30 mL/kg in 1 hour (infants) or 30 mins (children >=1yr)", route: "Intravenous cannula", schedule: "Phase 1: Immediate bolus" },
          { drug: "IV Ringer's Lactate (Phase 2)", dosage: "70 mL/kg in 5 hours (infants) or 2.5 hours (children >=1yr)", route: "Intravenous cannula", schedule: "Phase 2: Maintenance infusion" },
          { drug: "Zinc Sulfate Tablets (20mg)", dosage: "10mg (under 6m) or 20mg (over 6m) daily", route: "Oral dissolved in breastmilk/water", schedule: "Daily for 10-14 days to rebuild mucosal lining" }
        ],
        herbalAdvisory: "STRICT BEDSIDE WARNING: Do not administer any herbal laxatives, purgatives, or thick root powdered slurries. In severe dehydration, the patient's gut is ischemic and prone to necrosis. Focus entirely on sterile IV and oral ORS recovery.",
        gradeQuality: "High",
        citation: "WHO IMCI Plan C Guideline & UNICEF Diarrhea Standard (2019)"
      },
      outcome_some_dehyd: {
        isOutcome: true,
        category: "amber",
        name: "SOME DEHYDRATION - PLAN B REHYDRATION",
        directive: "Rehydrate at the outpost over 4 hours. Give recommended volume of low-osmolarity Oral Rehydration Salts (ORS) solution periodically. Encourage breastfeeding.",
        recommendations: [
          { drug: "Low-Osmolarity ORS", dosage: "75 mL per kg body weight over 4 hours", route: "Oral (use teaspoon or cup, small sips)", schedule: "Continuously for 4 hours" },
          { drug: "Zinc Sulfate (20mg)", dosage: "1 tablet (dissolved) daily", route: "Oral", schedule: "Give daily for 14 days" }
        ],
        herbalAdvisory: "Supportive Flocculant: When preparing ORS, ensure the outpost water is completely sterile. Moringa Seed powder can be utilized as a natural coagulant to precipitate mud/clay particles from river water before boiling and mixing ORS.",
        gradeQuality: "High",
        citation: "WHO low-osmolarity ORS recommendations"
      },
      outcome_persistent_diarrhea: {
        isOutcome: true,
        category: "amber",
        name: "SEVERE PERSISTENT DIARRHEA",
        directive: "PERSISTENT DIARRHEA (>14 Days). Do not treat simply at home. Risk of severe metabolic exhaustion and systemic malnutrition. Refer to clinical center for diagnostic stool cultures and recovery.",
        recommendations: [
          { drug: "Low-Osmolarity ORS", dosage: "Frequent small sips as needed", route: "Oral", schedule: "Until referral is secured" },
          { drug: "Zinc Sulfate (20mg)", dosage: "1 tablet daily", route: "Oral", schedule: "14 days course" }
        ],
        herbalAdvisory: "Dietary Support: Feed infant well-cooked pediatric rice porridge or bananas. Saponin-rich adaptogens (like Mondia whitei / Mukombero) may support gut recovery and appetite, but avoid high-tannin astringents during active severe wasting.",
        gradeQuality: "Moderate",
        citation: "WHO Persistent Diarrhea Treatment Protocols"
      },
      outcome_no_dehyd: {
        isOutcome: true,
        category: "green",
        name: "ACUTE WATERY DIARRHEA - PLAN A HOME CARE",
        directive: "Treat diarrhea at home. Give extra fluids (ORS, clean soup, or rice water) after each loose stool to prevent dehydration. Instruct mother to return immediately if child cannot drink, or develops bloody stool.",
        recommendations: [
          { drug: "Low-Osmolarity ORS (Plan A)", dosage: "Under 2 years: 50-100 mL; Over 2 years: 100-200 mL after each loose stool", route: "Oral", schedule: "After every loose bowel motion" },
          { drug: "Zinc Sulfate (20mg)", dosage: "1 tablet daily", route: "Oral", schedule: "14 days course strictly" }
        ],
        herbalAdvisory: "Supportive Care: Mild guava leaf decoctions (aqueous boiling) possess safe anti-secretory and spasmolytic effects that can naturally reduce bowel contraction frequencies without stopping toxin clearance.",
        gradeQuality: "High",
        citation: "WHO/UNICEF Diarrhea Home Care Guidelines"
      }
    }
  },
  sepsis: {
    id: "sepsis",
    title: "Neonatal Sepsis (PSBI) Pathway",
    description: "Screens young infants (under 2 months) for Possible Serious Bacterial Infection (PSBI) and critical localized neonatal sepsis markers.",
    startNode: "q_neonat_age",
    nodes: {
      q_neonat_age: {
        text: "Is the patient's age strictly under 2 months (young infant)?",
        help: "WHO PSBI guidelines specifically apply to neonates and young infants under 60 days of age. Older infants follow standard IMCI pediatric flowcharts.",
        options: [
          { text: "YES (Under 2 months)", nextNode: "q_sepsis_convulsions" },
          { text: "NO (Older infant)", nextNode: "outcome_non_neonat" }
        ]
      },
      q_sepsis_convulsions: {
        text: "Has the young infant convulsed during this illness or are they exhibiting active muscle spasms?",
        help: "Spasms and convulsions in neonates are primary indicators of severe neonatal meningitis, severe malaria, or tetanus infection.",
        options: [
          { text: "YES (Convulsions / Spasms)", nextNode: "outcome_psbi" },
          { text: "NO", nextNode: "q_sepsis_feeding" }
        ]
      },
      q_sepsis_feeding: {
        text: "Is the infant completely unable to feed, or stopping feeding/breastfeeding eagerly?",
        help: "Poor feeding or 'not feeding well' is a sensitive clinical sign of systemic sepsis in neonates.",
        options: [
          { text: "YES (Not feeding well)", nextNode: "outcome_psbi" },
          { text: "NO", nextNode: "q_sepsis_breathing" }
        ]
      },
      q_sepsis_breathing: {
        text: "Is the respiration count 60 breaths per minute or greater (Tachypnea), or is there severe chest indrawing?",
        help: "Check respiration carefully when the infant is calm and not crying. Fast breathing in neonates is strictly >=60 breaths/min.",
        options: [
          { text: "YES (Fast Breathing / Indrawing)", nextNode: "outcome_psbi" },
          { text: "NO", nextNode: "q_sepsis_temp" }
        ]
      },
      q_sepsis_temp: {
        text: "Is the infant's body temperature 37.5°C or higher (fever), or under 35.5°C (severe hypothermia)?",
        help: "Young infants struggle with thermoregulation during sepsis. Severe hypothermia (<35.5°C) is just as critical as high fever (>37.5°C).",
        options: [
          { text: "YES (Temperature anomaly)", nextNode: "outcome_psbi" },
          { text: "NO", nextNode: "q_sepsis_umbilicus" }
        ]
      },
      q_sepsis_umbilicus: {
        text: "Is the umbilicus red, discharging pus, or is there an active skin abscess surrounding the cord base?",
        help: "Omphalitis is a common gateway for systemic bacterial blood infections in rural outposts. Redness extending to the abdominal skin indicates serious localized sepsis.",
        options: [
          { text: "YES (Red / Pus Umbilicus)", nextNode: "outcome_local_sepsis" },
          { text: "NO (No Sepsis signs)", nextNode: "outcome_no_sepsis" }
        ]
      },
      // Outcomes
      outcome_psbi: {
        isOutcome: true,
        category: "red",
        name: "POSSIBLE SERIOUS BACTERIAL INFECTION (PSBI)",
        directive: "CRITICAL NEONATAL EMERGENCY. Set up urgent referral to hospital. Administer first dose of intramuscular Ampicillin and Gentamicin at the outpost before transport. Keep baby warm to prevent hypothermia.",
        recommendations: [
          { drug: "IM Ampicillin", dosage: "50 mg/kg body weight", route: "Intramuscular (lateral thigh)", schedule: "Give immediately" },
          { drug: "IM Gentamicin", dosage: "2.5 mg/kg (under 2kg) or 5 mg/kg (over 2kg)", route: "Intramuscular (opposite thigh)", schedule: "Give immediately" }
        ],
        herbalAdvisory: "STRICT BEDSIDE SHIELD: Do not administer any traditional preparations, herbal drops, or local washes to a young infant with PSBI. Sepsis spreads to the bloodstream and brain within hours. Intramuscular antibiotics are mandatory.",
        gradeQuality: "High",
        citation: "WHO Guidelines on Managing PSBI in Young Infants when Referral is Not Feasible (2015)"
      },
      outcome_local_sepsis: {
        isOutcome: true,
        category: "amber",
        name: "LOCAL BACTERIAL INFECTION (OMPHALITIS)",
        directive: "Treat at the outpost. Give oral Amoxicillin. Teach mother to clean and treat the localized umbilicus wound using sterile gentian violet or antiseptic paint twice daily.",
        recommendations: [
          { drug: "Oral Amoxicillin", dosage: "50 mg/kg/day divided into 2 doses", route: "Oral", schedule: "Twice daily for 7 days" },
          { drug: "Chlorhexidine 4% Gel", dosage: "Apply thin layer to umbilical cord stump", route: "Topical", schedule: "Twice daily after cleaning" }
        ],
        herbalAdvisory: "Wound Soothing: Topical pastes formulated from dried, powdered Kigelia africana (Muua) slices possess safe antibacterial wound-healing activities. Apply ONLY around the dry perimeter; keep the raw stump sterile.",
        gradeQuality: "Moderate",
        citation: "WHO Young Infant Local Infection Guidelines"
      },
      outcome_no_sepsis: {
        isOutcome: true,
        category: "green",
        name: "NO SIGNS OF SERIOUS BACTERIAL INFECTION",
        directive: "Young infant is stable. Encourage exclusive breastfeeding. Advise caregiver on standard thermal protection, clean cord care, and to return immediately if poor feeding, fever, or fast breathing develops.",
        recommendations: [],
        herbalAdvisory: "Caregiver Advisory: Maintain exclusive breastfeeding. Avoid introducing any traditional herbal teas, waters, or local powders to the infant before 6 months of age.",
        gradeQuality: "High",
        citation: "WHO Essential Newborn Care Guidelines"
      },
      outcome_non_neonat: {
        isOutcome: true,
        category: "amber",
        name: "PATIENT OUT OF AGE RANGE (USE STANDARD IMCI)",
        directive: "This neonatal sepsis pathway is strictly designed for infants under 60 days. Switch to the Malaria or Dehydration pathways, or the standard Clinician Quick-Ref wizard.",
        recommendations: [],
        herbalAdvisory: "Use standard botanical monographs matching the pediatric age parameters (>2 months).",
        gradeQuality: "Low",
        citation: "WHO IMCI age constraints"
      }
    }
  }
};

export default function ClinicalFlowcharts({ selectedRegion }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'reports'
  
  // Pathway setup state
  const [selectedTree, setSelectedTree] = useState(null);
  const [patientProfile, setPatientProfile] = useState({
    name: '',
    ageMonths: 12,
    weightKg: 10,
    tempCelsius: 37.0,
    respirationRate: 30,
    heartRate: 100
  });
  const [profileConfirmed, setProfileConfirmed] = useState(false);

  // Stateful Node Player state
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [historyNodeIds, setHistoryNodeIds] = useState([]);
  
  // Saved logs state
  const [savedReports, setSavedReports] = useState([]);
  const [showFhirPayload, setShowFhirPayload] = useState(null); // stores reportId
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Load saved local triage flowcharts on mount
  useEffect(() => {
    const records = localStorage.getItem('this_flowchart_reports');
    if (records) {
      try {
        setSavedReports(JSON.parse(records));
      } catch (e) {
        console.error("Failed to load local triage flowchart records:", e);
      }
    }
  }, []);

  // Set default vital threshold warnings based on age
  const age = Number(patientProfile.ageMonths) || 12;
  const temp = Number(patientProfile.tempCelsius) || 37.0;
  const respiration = Number(patientProfile.respirationRate) || 30;
  const heart = Number(patientProfile.heartRate) || 100;
  const weight = Number(patientProfile.weightKg) || 10;

  const isTachypnea = () => {
    if (age < 2 && respiration >= 60) return true;
    if (age >= 2 && age < 12 && respiration >= 50) return true;
    if (age >= 12 && age < 60 && respiration >= 40) return true;
    return false;
  };

  const isFever = temp >= 38.5;
  const isHypothermia = temp < 35.5;
  const isTachycardia = heart > 160;

  const handleStartTree = (treeId) => {
    setSelectedTree(FLOWCHART_TREES[treeId]);
    setCurrentNodeId(FLOWCHART_TREES[treeId].startNode);
    setHistoryNodeIds([]);
    setProfileConfirmed(true);
  };

  const handleResetTree = () => {
    setSelectedTree(null);
    setCurrentNodeId(null);
    setHistoryNodeIds([]);
    setProfileConfirmed(false);
  };

  const handleOptionSelect = (nextNode) => {
    setHistoryNodeIds(prev => [...prev, currentNodeId]);
    setCurrentNodeId(nextNode);
  };

  const handleGoBackNode = () => {
    if (historyNodeIds.length === 0) return;
    const prevNodeId = historyNodeIds[historyNodeIds.length - 1];
    setHistoryNodeIds(prev => prev.slice(0, -1));
    setCurrentNodeId(prevNodeId);
  };

  const handleLogReport = (outcomeNode) => {
    const newReport = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      county: selectedRegion || 'nairobi',
      patientName: patientProfile.name || 'Anonymous Outpost Patient',
      ageMonths: age,
      weightKg: weight,
      tempCelsius: temp,
      respirationRate: respiration,
      heartRate: heart,
      pathwayTitle: selectedTree.title,
      diagnosisName: outcomeNode.name,
      severity: outcomeNode.category,
      directive: outcomeNode.directive,
      recommendations: outcomeNode.recommendations || []
    };

    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem('this_flowchart_reports', JSON.stringify(updated));
    
    // Add dynamic Clinician Audit logs
    const currentLogs = localStorage.getItem('this_admin_audit_logs');
    let parsedLogs = [];
    if (currentLogs) {
      try { parsedLogs = JSON.parse(currentLogs); } catch(e) {}
    }
    const newAudit = {
      id: Date.now(),
      action: "Bedside Decision Logged",
      user: "Authorized Outpost Practitioner",
      timestamp: new Date().toLocaleString(),
      details: `Logged flowchart triage report for ${newReport.patientName}. Diagnosis: ${newReport.diagnosisName}.`
    };
    localStorage.setItem('this_admin_audit_logs', JSON.stringify([newAudit, ...parsedLogs]));
    window.dispatchEvent(new Event('this_admin_audit_logs_changed'));

    // Automatically stage report in Sync Queue if offline contribution triggers
    const syncQueueStr = localStorage.getItem('this_pending_sync_queue');
    let syncQueue = [];
    if (syncQueueStr) {
      try { syncQueue = JSON.parse(syncQueueStr); } catch(e) {}
    }
    const syncRecord = {
      type: "flowchart_report",
      id: newReport.id,
      patientName: newReport.patientName,
      diagnosis: newReport.diagnosisName,
      severity: newReport.severity,
      county: newReport.county,
      timestamp: newReport.timestamp
    };
    localStorage.setItem('this_pending_sync_queue', JSON.stringify([...syncQueue, syncRecord]));
    window.dispatchEvent(new Event('this_sync_queue_changed'));

    alert("Bedside Diagnostic Report successfully logged locally! Staged for next admin sync.");
    handleResetTree();
    setActiveTab('reports');
  };

  const handleDeleteReport = (id) => {
    if (!window.confirm("Are you sure you want to delete this bedside diagnostic record from local logs?")) return;
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem('this_flowchart_reports', JSON.stringify(updated));
  };

  // Compile standard HL7 FHIR DiagnosticReport payload
  const getFhirPayload = (report) => {
    return JSON.stringify({
      resourceType: "DiagnosticReport",
      id: `this-report-${report.id}`,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0074",
              code: "GE",
              display: "General Practice"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "386344002",
            display: "Clinical Decision Support diagnosis"
          }
        ],
        text: report.pathwayTitle
      },
      subject: {
        reference: `Patient/outpost-pediatric-${report.id}`,
        display: report.patientName
      },
      effectiveDateTime: new Date(report.id).toISOString(),
      issued: new Date(report.id).toISOString(),
      performer: [
        {
          display: "Outpost Health Worker"
        }
      ],
      conclusion: report.diagnosisName,
      conclusionCode: [
        {
          text: report.directive
        }
      ],
      result: [
        {
          display: `Temperature: ${report.tempCelsius}°C (${report.tempCelsius >= 38.5 ? 'FEVER' : 'NORMAL'})`
        },
        {
          display: `Respiration Rate: ${report.respirationRate} breaths/min`
        },
        {
          display: `Heart Rate: ${report.heartRate} bpm`
        },
        {
          display: `Weight: ${report.weightKg} kg`
        }
      ]
    }, null, 2);
  };

  const handleCopyFhir = (report) => {
    const payload = getFhirPayload(report);
    navigator.clipboard.writeText(payload);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Render current node inside pathway player
  const renderCurrentNode = () => {
    if (!selectedTree || !currentNodeId) return null;
    const node = selectedTree.nodes[currentNodeId];
    if (!node) return null;

    if (node.isOutcome) {
      // Diagnostic Outcome screen
      return (
        <div className="glass-panel p-6 bg-white border border-slate-200 shadow-xl space-y-6 animate-scale-up">
          {/* Outcome Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                node.category === 'red' ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse' :
                node.category === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                'bg-emerald-50 text-emerald-800 border-emerald-250'
              }`}>
                WHO Triage classification: {node.category === 'red' ? 'Severe / Urgent Referral' : node.category === 'amber' ? 'Treat at Outpost' : 'Supportive Care'}
              </span>
              <h3 className={`text-xl md:text-2xl font-black font-outfit mt-2 ${
                node.category === 'red' ? 'text-rose-600' :
                node.category === 'amber' ? 'text-amber-600' :
                'text-emerald-700'
              }`}>
                {node.name}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${
              node.category === 'red' ? 'bg-rose-100 text-rose-600' :
              node.category === 'amber' ? 'bg-amber-100 text-amber-600' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              <Stethoscope className="h-6 w-6" />
            </div>
          </div>

          {/* Outpost Directive */}
          <div className={`p-4 rounded-2xl border-l-4 leading-relaxed text-sm ${
            node.category === 'red' ? 'bg-rose-50/20 border-l-rose-600 text-slate-700' :
            node.category === 'amber' ? 'bg-amber-50/10 border-l-amber-500 text-slate-700' :
            'bg-emerald-50/10 border-l-emerald-600 text-slate-700'
          }`}>
            <strong className="font-extrabold uppercase text-[10px] block mb-1 tracking-wider">Bedside Outpost Directive:</strong>
            <p className="font-semibold leading-relaxed">{node.directive}</p>
          </div>

          {/* Vitals Summary Alert Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 border border-slate-200/50 rounded-2xl">
            <div className="text-center space-y-0.5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Temperature</span>
              <span className={`text-sm font-extrabold block ${isFever ? 'text-rose-600 font-black' : isHypothermia ? 'text-blue-600 font-black' : 'text-slate-700'}`}>
                {temp}°C {isFever ? '⚠️' : isHypothermia ? '❄️' : ''}
              </span>
            </div>
            <div className="text-center space-y-0.5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Respiration</span>
              <span className={`text-sm font-extrabold block ${isTachypnea() ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
                {respiration}/m {isTachypnea() ? '⚠️' : ''}
              </span>
            </div>
            <div className="text-center space-y-0.5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Heart Rate</span>
              <span className={`text-sm font-extrabold block ${isTachycardia ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
                {heart} bpm {isTachycardia ? '⚠️' : ''}
              </span>
            </div>
            <div className="text-center space-y-0.5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Weight</span>
              <span className="text-sm font-extrabold block text-slate-700">{weight} kg</span>
            </div>
          </div>

          {/* Drug & Dosing tables */}
          {node.recommendations && node.recommendations.length > 0 && (
            <div className="space-y-3 bg-white p-4 border border-slate-150 rounded-2xl">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Clock className="h-4 w-4 text-emerald-800" /> Prescriptive Dosage Directives
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="py-2">Medication</th>
                      <th className="py-2">Calculated Dosage</th>
                      <th className="py-2">Route</th>
                      <th className="py-2">Frequency & Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {node.recommendations.map((rec, idx) => (
                      <tr key={idx} className="text-slate-650">
                        <td className="py-3 font-bold text-slate-800">{rec.drug}</td>
                        <td className="py-3 text-emerald-700 font-bold">{rec.dosage}</td>
                        <td className="py-3 text-slate-500">{rec.route}</td>
                        <td className="py-3 text-slate-600 font-semibold">{rec.schedule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Supportive Botanical Synergy Panels */}
          {node.herbalAdvisory && (
            <div className="p-4 bg-emerald-50/10 border border-emerald-100/60 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100/40 pb-2 font-outfit">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Supportive Bedside Botanicals
              </h4>
              <p className="text-xs text-slate-655 leading-relaxed font-semibold">
                {node.herbalAdvisory}
              </p>
              <div className="flex gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100/40 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200/50">
                  GRADE quality: {node.gradeQuality}
                </span>
                <span className="text-[9px] font-bold text-slate-450 italic truncate flex items-center gap-1">
                  <BookOpen className="h-3 w-3 shrink-0" /> {node.citation}
                </span>
              </div>
            </div>
          )}

          {/* Action controls */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => handleLogReport(node)}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/10 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" /> Log & Stage Report
            </button>
            <button
              onClick={handleResetTree}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
            >
              <RefreshCw className="h-4 w-4" /> Exit Wizard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-panel p-6 bg-white border border-slate-200 shadow-md space-y-5 animate-scale-up">
        {/* Node Question header */}
        <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
              Active Triage Step
            </span>
            <h4 className="text-lg font-extrabold text-slate-800 leading-tight font-outfit">
              {node.text}
            </h4>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
            <Stethoscope className="h-5 w-5 text-emerald-800" />
          </div>
        </div>

        {/* Clinical helper card */}
        {node.help && (
          <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex gap-2 text-xs text-slate-500 leading-normal">
            <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-semibold">{node.help}</p>
          </div>
        )}

        {/* Dynamic Vitals Alert during selection */}
        {(currentNodeId === 'q_respiration' && isTachypnea()) && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-xs flex gap-2 items-center animate-pulse">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <strong className="font-bold uppercase tracking-wider text-[10px]">Tachypnea Triggered:</strong>
            <span className="font-semibold">Respiration counts are in extreme danger ranges for a {age}-month old.</span>
          </div>
        )}
        {(currentNodeId === 'q_sepsis_temp' && (isFever || isHypothermia)) && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-xs flex gap-2 items-center animate-pulse">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <strong className="font-bold uppercase tracking-wider text-[10px]">Temperature Alarm:</strong>
            <span className="font-semibold">Temperature ({temp}°C) indicates high sepsis danger.</span>
          </div>
        )}

        {/* Options buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {node.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(opt.nextNode)}
              className="px-4 py-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-250 text-slate-700 hover:text-[hsl(var(--primary-green))] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between gap-2 shadow-xs group cursor-pointer"
            >
              <span>{opt.text}</span>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>

        {/* Footer controls (Back / Exit) */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
          <button
            onClick={handleGoBackNode}
            disabled={historyNodeIds.length === 0}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              historyNodeIds.length > 0
                ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'text-slate-350 bg-slate-50/50 border border-transparent'
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button
            onClick={handleResetTree}
            className="px-3 py-1.5 bg-rose-50 border border-rose-150 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
          >
            Cancel Triage
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Title */}
      <div className="text-center py-6 no-print">
        <span className="text-[10px] tracking-widest font-black uppercase text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block mb-2">
          ★ WHO IMCI Decision Desk
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--primary-green))] leading-tight font-outfit">
          Guided Bedside Diagnostic Flowcharts
        </h2>
        <p className="text-slate-500 max-w-3xl mx-auto mt-2 text-sm">
          Node-based clinical triage wizards mapped to WHO IMCI standards. Enter patient vitals, screen symptoms, and unlock calculated drug dosages and traditional support directives fully offline.
        </p>
      </div>

      {/* Primary Tab Selectors */}
      <div className="flex justify-center border-b border-slate-200/60 pb-1 max-w-md mx-auto no-print">
        <button
          onClick={() => setActiveTab('player')}
          className={`px-6 py-2 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'player'
              ? 'text-[hsl(var(--primary-green))] border-b-2 border-b-emerald-850 font-extrabold'
              : 'text-slate-450 hover:text-slate-700'
          }`}
        >
          Active Pathway Player
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-2 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1 ${
            activeTab === 'reports'
              ? 'text-[hsl(var(--primary-green))] border-b-2 border-b-emerald-850 font-extrabold'
              : 'text-slate-450 hover:text-slate-700'
          }`}
        >
          Saved Reports 
          {savedReports.length > 0 && (
            <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
              {savedReports.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab views */}
      {activeTab === 'player' ? (
        <div className="max-w-4xl mx-auto">
          {!profileConfirmed ? (
            // Phase 1: Vitals & Profile Setup
            <div className="glass-panel p-6 bg-white border border-slate-200/80 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-extrabold text-[hsl(var(--primary-green))] font-outfit">
                    1. Set Up Bedside Patient Profile
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input patient age and metrics to calculate fast-breathing alerts and dosage parameters automatically.
                  </p>
                </div>
                <User className="h-5 w-5 text-emerald-850 shrink-0" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Patient Name / Initials</label>
                  <input
                    type="text"
                    value={patientProfile.name}
                    onChange={e => setPatientProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. S.K. pediatric"
                    className="w-full text-xs font-bold text-slate-750 px-3.5 py-2 rounded-xl border border-slate-250 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Age (Months)</label>
                  <input
                    type="number"
                    value={patientProfile.ageMonths}
                    onChange={e => setPatientProfile(prev => ({ ...prev, ageMonths: e.target.value }))}
                    className="w-full text-xs font-bold text-slate-750 px-3.5 py-2 rounded-xl border border-slate-250 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    value={patientProfile.weightKg}
                    onChange={e => setPatientProfile(prev => ({ ...prev, weightKg: e.target.value }))}
                    className="w-full text-xs font-bold text-slate-750 px-3.5 py-2 rounded-xl border border-slate-250 bg-slate-50/50 outline-none focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              {/* Vitals metrics */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/50 space-y-4">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                  <Activity className="h-4 w-4 text-emerald-800" /> Active Bedside Vitals (Optional but Advised)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5 text-slate-500" /> Temp (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={patientProfile.tempCelsius}
                      onChange={e => setPatientProfile(prev => ({ ...prev, tempCelsius: e.target.value }))}
                      className="w-full text-xs font-bold text-slate-750 px-3.5 py-2 rounded-xl border border-slate-250 bg-white outline-none focus:border-emerald-400 transition-all"
                    />
                    {isFever && <span className="text-[9px] text-rose-600 font-extrabold block">⚠️ FEVER DETECTED</span>}
                    {isHypothermia && <span className="text-[9px] text-sky-600 font-extrabold block">❄️ HYPOTHERMIA</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Respiration (breaths/m)</label>
                    <input
                      type="number"
                      value={patientProfile.respirationRate}
                      onChange={e => setPatientProfile(prev => ({ ...prev, respirationRate: e.target.value }))}
                      className="w-full text-xs font-bold text-slate-750 px-3.5 py-2 rounded-xl border border-slate-250 bg-white outline-none focus:border-emerald-400 transition-all"
                    />
                    {isTachypnea() && <span className="text-[9px] text-rose-600 font-extrabold block animate-pulse">⚠️ TACHYPNEA ALERT</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pulse Rate (bpm)</label>
                    <input
                      type="number"
                      value={patientProfile.heartRate}
                      onChange={e => setPatientProfile(prev => ({ ...prev, heartRate: e.target.value }))}
                      className="w-full text-xs font-bold text-slate-750 px-3.5 py-2 rounded-xl border border-slate-250 bg-white outline-none focus:border-emerald-400 transition-all"
                    />
                    {isTachycardia && <span className="text-[9px] text-rose-600 font-extrabold block animate-pulse">⚠️ TACHYCARDIA</span>}
                  </div>
                </div>
              </div>

              {/* Pathway select buttons */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  2. Select Active Diagnostic Pathway
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(FLOWCHART_TREES).map(tree => (
                    <button
                      key={tree.id}
                      onClick={() => handleStartTree(tree.id)}
                      className="p-5 bg-slate-50 hover:bg-emerald-50/20 border border-slate-200/80 hover:border-emerald-400/50 rounded-2xl transition-all text-left space-y-2 group flex flex-col justify-between shadow-xs cursor-pointer h-full"
                    >
                      <div className="space-y-1">
                        <span className="p-2 bg-white rounded-lg border border-slate-200 text-slate-650 group-hover:text-emerald-750 inline-block">
                          <Stethoscope className="h-4 w-4" />
                        </span>
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-800 uppercase tracking-wide pt-1">
                          {tree.title}
                        </h4>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                          {tree.description}
                        </p>
                      </div>
                      <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform self-end">
                        Launch <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Phase 2: Active Pathway player rendering
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-100 p-3 rounded-2xl border border-slate-200/50">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                  <User className="h-4 w-4 text-emerald-850" />
                  <span>Patient: <strong className="text-slate-800">{patientProfile.name || 'Anonymous'}</strong> ({age}m, {weight}kg, {temp}°C)</span>
                </div>
                <button
                  onClick={handleResetTree}
                  className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  Change Profile
                </button>
              </div>

              {renderCurrentNode()}
            </div>
          )}
        </div>
      ) : (
        // Saved reports tab
        <div className="max-w-5xl mx-auto space-y-4">
          {savedReports.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-150 rounded-3xl space-y-3">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">No Diagnostic Logs Recorded</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Complete a guided flowchart wizard and click "Log & Stage" to save reports locally.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedReports.map(report => (
                <div 
                  key={report.id}
                  className="glass-panel p-5 bg-white border border-slate-200 shadow-sm rounded-3xl space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Severity ribbon/badge */}
                  <div className={`absolute top-0 right-0 px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b ${
                    report.severity === 'red' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    report.severity === 'amber' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-emerald-50 text-emerald-800 border-emerald-250'
                  }`}>
                    {report.severity === 'red' ? 'Urgent Referral' : report.severity === 'amber' ? 'Outpost Treat' : 'Supportive Care'}
                  </div>

                  <div className="flex flex-wrap justify-between items-start gap-4 pr-24 pt-1">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-800 font-outfit flex items-center gap-2">
                        {report.patientName}
                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          {report.ageMonths} months
                        </span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1 uppercase">
                          <MapPin className="h-3.5 w-3.5 text-emerald-800" /> {report.county} Context
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {report.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals check info */}
                  <div className="flex gap-4 flex-wrap text-[10px] font-bold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-150/60 max-w-lg">
                    <span>Temp: <strong className="text-slate-700">{report.tempCelsius}°C</strong></span>
                    <span>Respiration: <strong className="text-slate-700">{report.respirationRate}/m</strong></span>
                    <span>Pulse: <strong className="text-slate-700">{report.heartRate} bpm</strong></span>
                    <span>Weight: <strong className="text-slate-700">{report.weightKg} kg</strong></span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <strong className="text-slate-400 text-[9px] font-black uppercase tracking-wider block">Flowchart Diagnosis Verdict:</strong>
                    <span className={`font-extrabold text-sm block ${
                      report.severity === 'red' ? 'text-rose-600 font-black' :
                      report.severity === 'amber' ? 'text-amber-600 font-black' :
                      'text-emerald-700 font-black'
                    }`}>
                      {report.diagnosisName}
                    </span>
                    <p className="text-slate-600 leading-relaxed font-semibold mt-1 bg-slate-50/20 p-3 rounded-lg border border-slate-100">
                      {report.directive}
                    </p>
                  </div>

                  {/* Recommendations */}
                  {report.recommendations && report.recommendations.length > 0 && (
                    <div className="space-y-1 pt-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Administered Outpost Dosages:</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {report.recommendations.map((rec, idx) => (
                          <span key={idx} className="text-[10px] font-extrabold bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                            <span className="font-black text-slate-700">{rec.drug}:</span> {rec.dosage} ({rec.route})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HL7 FHIR Output panel */}
                  {showFhirPayload === report.id && (
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 animate-scale-up no-print">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 animate-pulse" /> FHIR DiagnosticReport Resource Payload
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyFhir(report)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[9px] font-extrabold uppercase tracking-wide transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" /> {copiedSuccess ? "Copied!" : "Copy JSON"}
                          </button>
                          <button
                            onClick={() => setShowFhirPayload(null)}
                            className="text-slate-400 hover:text-slate-200 text-xs font-black"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                      <pre className="text-[10px] font-semibold font-mono text-sky-200 overflow-x-auto leading-relaxed max-h-56 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {getFhirPayload(report)}
                      </pre>
                    </div>
                  )}

                  {/* Report action controls */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 no-print">
                    <button
                      onClick={() => setShowFhirPayload(showFhirPayload === report.id ? null : report.id)}
                      className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> {showFhirPayload === report.id ? "Hide FHIR Payload" : "View FHIR Payload"}
                    </button>
                    <button
                      onClick={() => handleCopyFhir(report)}
                      className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy FHIR JSON
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="px-3.5 py-1.5 bg-rose-50 border border-rose-150 hover:bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
