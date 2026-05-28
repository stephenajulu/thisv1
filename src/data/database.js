// Dynamic loading of collections via Vite glob imports (100% Offline-Sovereign)
const conditionFiles = import.meta.glob('./collections/conditions/*.json', { eager: true });
const remedyFiles = import.meta.glob('./collections/remedies/*.json', { eager: true });
const outcomeFiles = import.meta.glob('./collections/outcomes/*.json', { eager: true });
const interactionFiles = import.meta.glob('./collections/interactions/*.json', { eager: true });

const conditions = Object.values(conditionFiles).map(module => module.default);
const remedies = Object.values(remedyFiles).map(module => module.default);
const outcomesMatrix = Object.values(outcomeFiles).map(module => module.default);
const interactions = Object.values(interactionFiles).map(module => module.default);

export const database = {
  conditions,
  remedies,
  interactions,
  symptoms: [
    { id: "high-fever", name: "High Fever", description: "Elevated core body temperature (>38.5°C). Primary defense indicator." },
    { id: "joint-pain", name: "Severe Joint & Muscle Pain", description: "Excruciating skeletal pain and muscular aches." },
    { id: "platelet-drop", name: "Thrombocytopenia", description: "Severe depletion of blood platelets, triggering bleeding risks." },
    { id: "dehydration", name: "Fluid & Salt Depletion", description: "Dehydration marked by dry tongue, rapid pulse, and dark sunken eyes." },
    { id: "fatigue", name: "Profound Fatigue", description: "Systemic muscle weakness, lethargy, and tissue hypoxia." },
    { id: "jaundice", name: "Jaundice & Yellowing", description: "Yellowing of skin/eyes from liver and renal complications." },
    { id: "skin-ulcer", name: "Skin Ulcers & Lesions", description: "Debilitating cutaneous ulcers, open sores, or eschar scabs." },
    { id: "vomiting", name: "Vomiting & Nausea", description: "Severe gastric distress, vomiting, and inability to retain fluids." },
    { id: "blindness", name: "Visual Impairment / Blindness", description: "Progressive ocular damage leading to severe visual impairment or blindness." },
    { id: "cough", name: "Cough & Dyspnea", description: "Chest distress, acute coughing, and labored breathing." },
    { id: "severe-rigors", name: "Severe Rigors & Chills", description: "Intense shivering and alternating hot/cold chills typical in cyclic parasitemia." },
    { id: "abdominal-pain", name: "Acute Abdominal Pain", description: "Severe stomach cramps, mesenteric congestion, or intestinal spasms." },
    { id: "watery-diarrhea", name: "Profuse Watery Diarrhea", description: "Frequent liquid bowel movements causing rapid fluid volume depletion." },
    { id: "bloody-stool", name: "Bloody Stool (Dysentery)", description: "Stools containing blood, mucus, or cellular debris indicating invasive infection." },
    { id: "neck-stiffness", name: "Neck Stiffness & Meningism", description: "Rigid neck flexors, nuchal rigidity, or inability to touch chin to chest." },
    { id: "pruritus", name: "Intense Pruritus & Itching", description: "Severe cutaneous itching, burning sensations, or night scratching." },
    { id: "photophobia", name: "Photophobia", description: "Extreme sensitivity to light causing severe ocular discomfort or avoidance." },
    { id: "muscle-spasms", name: "Muscle Spasms & Lockjaw", description: "Painful, uncontrolled muscle contractions, jaw tightness, or rigid body arches." },
    { id: "hydrophobia", name: "Hydrophobia & Foaming", description: "Violent laryngeal spasms when attempting to swallow fluids, plus thick foaming saliva." }
  ],
  populations: [
    {
      id: "pregnant-women",
      name: "Pregnant Women",
      description: "High immunological susceptibility. Malaria or vector infections present severe risks of maternal death and low birth weights.",
      criticalAlerts: [
        "NEEM LEAVES are strictly contraindicated (documented abortifacient properties).",
        "Moringa root and bark preparations must be avoided due to uterine stimulants.",
        "Albendazole dewormer is contraindicated in the first trimester."
      ]
    },
    {
      id: "children-under-5",
      name: "Children (Under 5 Years)",
      description: "Immature immune system. Highly vulnerable to rapid cerebral malaria and fatal dehydration from cholera in under 24 hours.",
      criticalAlerts: [
        "Neem seed oil is highly toxic in infants (induces encephalopathy).",
        "ORS formulation must be mixed with absolute precision to prevent tissue damage.",
        "Zinc Sulfate is crucial to administer concurrently with ORS in diarrheal episodes."
      ]
    },
    {
      id: "subsistence-farmers",
      name: "Subsistence Farmers",
      description: "High occupational exposure to agricultural fields, damp soils, vectors, and peak ultraviolet radiation.",
      criticalAlerts: [
        "Extreme risk of heat exhaustion during humid solar noon (11:00 - 15:00).",
        "Parasitic soil hookworms require footwear to prevent chronic iron anemia."
      ]
    }
  ],
  outcomesMatrix
};
