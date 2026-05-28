// Central Structured Relational Database for THIS
// Extended for Phase 1 with 22 Conditions, 18 Remedies, 5 Symptoms, 3 Populations,
// and 22 outcomes matrix records adopting the WHO-aligned GRADE Framework.

module.exports = {
  conditions: [
    {
      id: "malaria",
      name: "Malaria",
      scientificName: "Plasmodium falciparum / vivax infection",
      icd11: "1F40",
      category: "Vector-borne Disease",
      description: "A life-threatening parasitic disease transmitted through female Anopheles mosquitoes. Causes high fever, severe rigors, and anemia. Exacerbated by humid monsoon rains.",
      symptoms: ["high-fever", "chills", "fatigue"],
      climateLinks: [
        { trigger: "Monsoon Rainfall", impact: "Creates massive breeding pools for Anopheles larvae." }
      ],
      prevention: ["Insecticide-treated bed nets (ITNs)", "Indoor residual spraying", "Clearing stagnant pools"],
      climateThreatSchema: {
        minTemp: 22,
        maxTemp: 32,
        minHumidity: 60,
        minRainfall: 80,
        maxRainfall: 250,
        advisory: "MALARIA ACTIVE THREAT: Deploy LLIN bed nets to all households, initiate vector-larvicide treatment of stagnant pools, and stock Artemether-Lumefantrine (ACT) tablets at outposts."
      },
      triageAdvisory: "Highly suggestive of Malaria. Run a Rapid Diagnostic Test (RDT) or thick blood smear immediately. If positive, initiate standard Artemisinin-based Combination Therapy (ACT)."
    },
    {
      id: "dengue",
      name: "Dengue Fever",
      scientificName: "Dengue virus (DENV 1-4)",
      icd11: "1D20",
      category: "Vector-borne Disease",
      description: "A viral infection transmitted by Aedes aegypti mosquitoes. Features rapid high fever, excruciating skeletal pain ('breakbone fever'), and critical platelet depletion.",
      symptoms: ["high-fever", "joint-pain", "platelet-drop", "fatigue"],
      climateLinks: [
        { trigger: "Warm Humidity Spikes", impact: "Accelerates Aedes viral replication and biting frequency." }
      ],
      prevention: ["Eliminating artificial water standing pools", "Topical repellents", "Larvicides"],
      climateThreatSchema: {
        minTemp: 25,
        maxTemp: 34,
        minHumidity: 50,
        minRainfall: 31,
        maxRainfall: 999,
        advisory: "DENGUE OUTBREAK ADVISORY: Conduct community campaign to cover water barrels, spray Aedes vector habitats, and warn caregivers to avoid NSAID painkillers (use Paracetamol only)."
      },
      triageAdvisory: "High risk of Dengue Fever. Platelet count monitoring required. Do NOT administer NSAIDs (Ibuprofen, Aspirin) as they increase hemorrhagic risk. Use Paracetamol for fever control."
    },
    {
      id: "dehydration",
      name: "Severe Dehydration",
      scientificName: "Hypovolemia",
      icd11: "5C80.1",
      category: "Climate-linked Health Issue",
      description: "Severe loss of bodily fluids and vital salts. Triggered by humid hot seasons or clinical diarrheal illnesses like Cholera. Fatal within hours in infants if untreated.",
      symptoms: ["dehydration", "fatigue"],
      climateLinks: [
        { trigger: "Extreme Heatwaves", impact: "Forces extreme sweat rates, exceeding normal hydration buffer limits." }
      ],
      prevention: ["Immediate electrolyte replenishment", "Shaded midday labor rests"],
      climateThreatSchema: {
        minTemp: 35,
        maxTemp: 99,
        minHumidity: 10,
        minRainfall: 0,
        maxRainfall: 30,
        advisory: "DEHYDRATION WATCH: Extreme heatwaves spike sweat rates. Maintain rehydration centers, distribute ORS, and counsel shaded rests."
      },
      triageAdvisory: "Severe dehydration. Administer ORS solution immediately (Plan B or Plan C). Evaluate for hypovolemic shock. Administer dispersible Zinc."
    },
    {
      id: "iron-anemia",
      name: "Iron-Deficiency Anemia",
      scientificName: "Microcytic anemia",
      icd11: "3A00",
      category: "Nutrition-related Condition",
      description: "A chronic lack of healthy red blood cells due to low iron. Exacerbated in tropical zones by parasitic hookworm blood loss and malaria-induced red blood cell lysis.",
      symptoms: ["fatigue"],
      climateLinks: [
        { trigger: "Flooded Farming Fields", impact: "Damp soil triggers extreme hookworm larval density, increasing skin penetration." }
      ],
      prevention: ["Regular mass deworming campaigns", "Dietary iron enhancers", "Use of protective farm boots"],
      triageAdvisory: "Iron-Deficiency Anemia suspected. Investigate dietary intake and hookworm exposure. Recommend iron-rich Moringa and regular Albendazole deworming."
    },
    {
      id: "cholera",
      name: "Cholera",
      scientificName: "Vibrio cholerae infection",
      icd11: "1A00",
      category: "Water-borne Pathogen",
      description: "An acute diarrheal infection caused by ingestion of food or water contaminated with Vibrio cholerae. Induces rapid, severe watery stools ('rice-water stool') and profound hypovolemic shock.",
      symptoms: ["dehydration", "fatigue"],
      climateLinks: [
        { trigger: "Flooding & Inundated Wells", impact: "Floods mix surface sewage into shallow drinking wells, triggering immediate outbreak spikes." }
      ],
      prevention: ["Chlorination of water sources", "Safe waste disposal", "Oral Cholera Vaccine (OCV)"],
      climateThreatSchema: {
        minTemp: 28,
        maxTemp: 99,
        minHumidity: 0,
        minRainfall: 250,
        maxRainfall: 999,
        advisory: "FLOOD CHOLERA ALERT: Surface sewage mixes into shallow wells. Distribute chlorine tablets, ban usage of untreated shallow wells, and mobilize immediate Oral Rehydration Salts (ORS) buffer stocks."
      },
      triageAdvisory: "Water-borne cholera suspected. Immediate aggressive low-osmolarity ORS administration. Use IV fluids (Ringer's Lactate) if severe dehydration is diagnosed."
    },
    {
      id: "typhoid",
      name: "Typhoid Fever",
      scientificName: "Salmonella enterica serovar Typhi",
      icd11: "1A07",
      category: "Water-borne Pathogen",
      description: "A systemic bacterial infection contracted through contaminated food or water. Features high step-ladder fever, abdominal distress, delirium, and life-threatening intestinal perforation.",
      symptoms: ["high-fever", "fatigue"],
      climateLinks: [
        { trigger: "Drought & Water Scarcity", impact: "Forces usage of contaminated, stagnant micro-dams and unsafe shared sources." }
      ],
      prevention: ["Typhoid conjugate vaccine (TCV)", "Strict food hygiene", "Handwashing with clean water"],
      climateThreatSchema: {
        minTemp: 32,
        maxTemp: 99,
        minHumidity: 10,
        minRainfall: 0,
        maxRainfall: 15,
        advisory: "DROUGHT TYPHOID WARNING: Drought forces usage of stagnant, contaminated water sources. Mandate boiling of all drinking water and monitor for step-ladder fevers."
      },
      triageAdvisory: "Suspected Typhoid Fever. Run blood cultures. Administer Ciprofloxacin for sensitive strains. Monitor for signs of intestinal perforation."
    },
    {
      id: "schistosomiasis",
      name: "Schistosomiasis",
      scientificName: "Schistosoma haematobium / mansoni",
      icd11: "1F80",
      category: "Water-borne Pathogen",
      description: "A parasitic worm disease also known as Bilharzia. Larvae are released by freshwater snails, penetrating the skin of individuals swimming or washing clothes in infested rivers.",
      symptoms: ["fatigue"],
      climateLinks: [
        { trigger: "Dam Construction & Irrigation", impact: "Slow-moving agricultural irrigation canals dramatically expand habitats for vector snails." }
      ],
      prevention: ["Mass Drug Administration (Praziquantel)", "Snail control using molluscicides", "Safe sanitation facilities"],
      triageAdvisory: "Schistosomiasis / Bilharzia suspected. Conduct urine/stool microscopy. Administer single dose Praziquantel (40mg/kg) under clinical supervision."
    },
    {
      id: "hookworm",
      name: "Hookworm Infection",
      scientificName: "Necator americanus / Ancylostoma duodenale",
      icd11: "1F64",
      category: "Water-borne Pathogen",
      description: "A soil-transmitted intestinal nematode. Hookworm larvae live in warm, damp soil and penetrate bare feet, migrating to the intestine where they feed on blood, causing severe iron deficiency.",
      symptoms: ["fatigue"],
      climateLinks: [
        { trigger: "Humid Soil & High Rainfall", impact: "Damp soil matches larval moisture requirements, extending hookworm survival up to weeks." }
      ],
      prevention: ["Wearing enclosed rubber shoes", "Sanitation infrastructure", "Mass Albendazole distribution"],
      triageAdvisory: "Hookworm infestation. Run stool microscopy. Administer single dose Albendazole (400mg) to arrest blood loss and microcytic anemia."
    },
    {
      id: "chagas",
      name: "Chagas Disease",
      scientificName: "Trypanosoma cruzi infection",
      icd11: "1F53",
      category: "Vector-borne Disease",
      description: "A parasitic infection transmitted by triatomine bugs ('kissing bugs') in rural mud-walled homes. Can lead to chronic life-threatening cardiac enlargement and megacolon years after infection.",
      symptoms: ["fatigue", "high-fever"],
      climateLinks: [
        { trigger: "Substandard Housing Humidity", impact: "Triatomine bugs proliferate in warm, dark cracks of mud and thatch structures." }
      ],
      prevention: ["Spraying cracks with residual insecticides", "Plastering mud walls", "Using bed nets"],
      triageAdvisory: "Chagas disease suspected. Perform serological testing. Administer Nifurtimox under active clinical observation."
    },
    {
      id: "leishmaniasis",
      name: "Leishmaniasis",
      scientificName: "Leishmania donovani / tropica",
      icd11: "1F54",
      category: "Vector-borne Disease",
      description: "A disease caused by protozoan parasites transmitted through the bites of infected sandflies. Cutaneous form causes severe disfiguring skin ulcers; Visceral form (Kala-azar) is fatal, attacking the spleen and liver.",
      symptoms: ["high-fever", "fatigue"],
      climateLinks: [
        { trigger: "Deforestation & Warming", impact: "Changes sandfly distribution, shifting vector breeding habitats closer to rural settlements." }
      ],
      prevention: ["Insecticide-treated bed nets", "Vector control spraying", "Immediate clinical diagnosis and therapy"],
      triageAdvisory: "Leishmaniasis suspected. Perform skin biopsy or splenic aspirate. Initiate specialized antiprotozoal treatment."
    },
    {
      id: "lymphatic-filariasis",
      name: "Lymphatic Filariasis",
      scientificName: "Wuchereria bancrofti infection",
      icd11: "1F66",
      category: "Vector-borne Disease",
      description: "A parasitic infection transmitted by mosquitoes, leading to chronic swelling of tissues (Elephantiasis). Causes severe physical disfigurement, social stigma, and painful lymphadenitis outbreaks.",
      symptoms: ["fatigue", "joint-pain"],
      climateLinks: [
        { trigger: "Urban Stagnant Water Pools", impact: "Culex mosquitoes breed aggressively in open drains and dirty puddles in urban tropical margins." }
      ],
      prevention: ["Mass chemotherapy (DEC + Albendazole)", "Vector control", "Community lymphatic hygiene education"],
      triageAdvisory: "Lymphatic Filariasis (Elephantiasis). Administer mass chemotherapy (DEC + Albendazole) and initiate strict local hygiene routines."
    },
    {
      id: "onchocerciasis",
      name: "Onchocerciasis",
      scientificName: "Onchocerca volvulus (River Blindness)",
      icd11: "1F68",
      category: "Vector-borne Disease",
      description: "A parasitic infection transmitted by the bites of infected blackflies breeding in fast-flowing rivers. Causes severe skin itching, depigmentation, and permanent blindness due to microfilariae in the eye.",
      symptoms: ["fatigue"],
      climateLinks: [
        { trigger: "Turbulent Rapid Rivers", impact: "Blackfly larvae require highly oxygenated, fast-flowing water to complete development." }
      ],
      prevention: ["Mass administration of Ivermectin (Mectizan)", "Aerial larvicide spraying of fast rivers"],
      triageAdvisory: "Onchocerca volvulus infection. Administer single dose Ivermectin (Mectizan) annually to clear microfilariae and prevent eye lesions."
    },
    {
      id: "yellow-fever",
      name: "Yellow Fever",
      scientificName: "Yellow fever virus (YFV)",
      icd11: "1D22",
      category: "Vector-borne Disease",
      description: "An acute viral hemorrhagic disease transmitted by infected Haemagogus or Aedes mosquitoes. Causes severe jaundice ('yellow' skin/eyes due to liver damage), vomiting, and hemorrhaging.",
      symptoms: ["high-fever", "fatigue"],
      climateLinks: [
        { trigger: "Forest Fringe Warming", impact: "Elevates viral transmission cycle between jungle monkeys and forest mosquitoes." }
      ],
      prevention: ["Single-dose Yellow Fever vaccine (provides lifelong immunity)", "Mosquito netting"],
      triageAdvisory: "Yellow Fever suspected. Immediate isolation and supportive therapy. Do NOT give NSAIDs (Aspirin/Ibuprofen) due to bleeding risks."
    },
    {
      id: "chikungunya",
      name: "Chikungunya Fever",
      scientificName: "Chikungunya virus (CHIKV)",
      icd11: "1D21.0",
      category: "Vector-borne Disease",
      description: "A viral infection transmitted by Aedes mosquitoes. Characterized by sudden fever and severe, chronic joint pain that can persist for months or years, causing significant economic disablement.",
      symptoms: ["high-fever", "joint-pain", "fatigue"],
      climateLinks: [
        { trigger: "Pre-Monsoon Storage", impact: "Drought-driven household water storage in open containers creates massive Aedes breeding hubs." }
      ],
      prevention: ["Aggressive mosquito population control", "Topical DEET usage"],
      triageAdvisory: "Chikungunya Fever. Supportive therapy. Administer Paracetamol for pain control. Monitor for long-term chronic joint disability."
    },
    {
      id: "zika",
      name: "Zika Virus",
      scientificName: "Zika virus (ZIKV)",
      icd11: "1D21.1",
      category: "Vector-borne Disease",
      description: "A viral infection transmitted primarily by Aedes mosquitoes. While symptoms are usually mild, maternal Zika infection is strongly linked to microcephaly and severe congenital brain defects in newborns.",
      symptoms: ["high-fever", "joint-pain", "fatigue"],
      climateLinks: [
        { trigger: "Warming Climate Vectors", impact: "Warm winters expand Aedes mosquito distribution to higher altitudes." }
      ],
      prevention: ["Mosquito prevention during pregnancy", "Condom use in active zones", "Avoiding vector breeding sites"],
      triageAdvisory: "Zika Virus. Supportive therapy. Highly critical to monitor pregnant women due to extreme congenital microcephaly risks."
    },
    {
      id: "sleeping-sickness",
      name: "African Trypanosomiasis",
      scientificName: "Trypanosoma brucei (Sleeping Sickness)",
      icd11: "1F52",
      category: "Vector-borne Disease",
      description: "A parasitic disease transmitted by the bite of the tsetse fly in rural Sub-Saharan Africa. The parasite crosses the blood-brain barrier, causing severe neurological disruption and reversing sleep cycles.",
      symptoms: ["high-fever", "fatigue"],
      climateLinks: [
        { trigger: "Woodland Encroachment", impact: "Savannah tsetse fly zones expand with shifts in tropical humidity and cattle movements." }
      ],
      prevention: ["Use of tsetse fly vector traps", "Proactive screening of remote farming populations"],
      triageAdvisory: "African Trypanosomiasis (Sleeping Sickness). Perform lumbar puncture to assess neurological stage. Administer targeted specialized antiprotozoal drugs."
    },
    {
      id: "heat-stroke",
      name: "Severe Heat Stroke",
      scientificName: "Hyperthermia",
      icd11: "NF00.0",
      category: "Climate-linked Health Issue",
      description: "A medical emergency when core body temperature rises above 40°C due to extreme heat exposure and failure of thermoregulation. Causes confusion, hot dry skin, and rapid multi-organ failure.",
      symptoms: ["high-fever", "dehydration"],
      climateLinks: [
        { trigger: "High Humidity Heatwaves", impact: "Humidity disables sweat evaporation, completely shutting down the human body's native cooling mechanism." }
      ],
      prevention: ["Immediate cool water immersion", "ORS administration", "Resting in shaded wind-tunnels"],
      climateThreatSchema: {
        minTemp: 38,
        maxTemp: 99,
        minHumidity: 60,
        minRainfall: 0,
        maxRainfall: 999,
        advisory: "SEVERE HEATSTROKE EMERGENCY: Heatwave disables body cooling. Set up cool water immersion basins, stock cold fluids, and mandate resting in shaded breeze areas."
      },
      triageAdvisory: "EMERGENCY: Hyperthermia >40°C. Initiate immediate cool water immersion, cold compress, and fan cooling. Avoid antipyretics (ineffective in heatstroke)."
    },
    {
      id: "fungal-keratitis",
      name: "Fungal Keratitis",
      scientificName: "Mycotic corneal ulcer",
      icd11: "9A01.3",
      category: "Climate-linked Health Issue",
      description: "A severe fungal infection of the cornea, highly prevalent among agricultural workers in humid tropical zones following minor plant eye traumas (e.g. scratch by sugar cane leaves).",
      symptoms: ["joint-pain"], // eye pain mapped under generalized discomfort
      climateLinks: [
        { trigger: "Humid Harvest Season", impact: "Harvesting in high humidity increases airborne fungal spore density (Fusarium/Aspergillus) on vegetation." }
      ],
      prevention: ["Protective eyewear during farm labor", "Immediate clean water rinsing of eye debris"],
      climateThreatSchema: {
        minTemp: 25,
        maxTemp: 99,
        minHumidity: 75,
        minRainfall: 100,
        maxRainfall: 999,
        advisory: "FUNGAL KERATITIS OUTBREAK: High harvest debris and humidity spike eye infections. Distribute protective eyewear and clean eye rinse bottles."
      },
      triageAdvisory: "Suspected Mycotic Corneal Ulcer. Refer to ophthalmologist immediately for Natamycin drops. Never use topical steroids."
    },
    {
      id: "solar-dermatitis",
      name: "Chronic Solar Dermatitis",
      scientificName: "Actinic prurigo",
      icd11: "EK50",
      category: "Climate-linked Health Issue",
      description: "Severe inflammatory skin reactions caused by prolonged exposure to high-intensity ultraviolet (UV) radiation in equatorial zones, highly affecting subsistence agricultural workers.",
      symptoms: ["joint-pain"], // skin inflammation/pain
      climateLinks: [
        { trigger: "Equatorial UV Spikes", impact: "High solar radiation intensity combined with outdoor work schedules causes chronic skin cellular damage." }
      ],
      prevention: ["Use of broad-brimmed traditional straw hats", "Long-sleeved light clothing"],
      climateThreatSchema: {
        minTemp: 30,
        maxTemp: 99,
        minHumidity: 10,
        minRainfall: 0,
        maxRainfall: 80,
        advisory: "EQUATORIAL UV ALERTS: High sun intensity. Advise subsistence farmers to wear long sleeves and wide straw hats during farming labor."
      },
      triageAdvisory: "Chronic Solar Dermatitis. Recommend topical zinc-oxide sunblocks, protective clothing, and avoiding mid-day solar exposure."
    },
    {
      id: "vitamin-a-deficiency",
      name: "Vitamin A Deficiency",
      scientificName: "Xerophthalmia",
      icd11: "5C60",
      category: "Nutrition-related Condition",
      description: "A critical dietary lack of Vitamin A. Leading cause of preventable childhood blindness in the tropics and severely compromises immune response to measles and diarrheal pathogens.",
      symptoms: ["fatigue"],
      climateLinks: [
        { trigger: "Crop Failure & Drought", impact: "Drying of gardens reduces immediate access to orange beta-carotene fruits and green leaves." }
      ],
      prevention: ["High-dose Vitamin A capsules twice yearly", "Cultivation of biofortified crops (Orange Sweet Potato)"],
      triageAdvisory: "Vitamin A deficiency. Administer high-dose Vitamin A capsules immediately and repeat at 6-month intervals to prevent childhood blindness."
    },
    {
      id: "malnutrition-sam",
      name: "Severe Acute Malnutrition (SAM)",
      scientificName: "Marasmus / Kwashiorkor",
      icd11: "5C50",
      category: "Nutrition-related Condition",
      description: "A life-threatening condition where children show extreme wasting (marasmus) or bilateral pitting edema (kwashiorkor) due to starvation and severe protein-energy deficiency.",
      symptoms: ["fatigue", "dehydration"],
      climateLinks: [
        { trigger: "El Niño Crop Failure", impact: "Prolonged agricultural drought causes immediate household food insecurity and localized famine." }
      ],
      prevention: ["Promoting indigenous superfoods (Moringa, Baobab)", "Ready-to-Use Therapeutic Food (RUTF)"],
      triageAdvisory: "Severe Acute Malnutrition (SAM). Perform appetite test. Start RUTF (Ready-to-Use Therapeutic Food) under Plan A/B feeding guidelines."
    },
    {
      id: "zinc-deficiency",
      name: "Zinc Deficiency",
      scientificName: "Hypozincemia",
      icd11: "5C64.3",
      category: "Nutrition-related Condition",
      description: "Inadequate zinc absorption, heavily impairing protein synthesis and cellular immunity in the tropics. Significantly increases the duration and severity of child diarrheal diseases.",
      symptoms: ["fatigue"],
      climateLinks: [
        { trigger: "Cereal Monoculture", impact: "Soil depletion of micro-nutrients coupled with high phytate tuber diets disables zinc absorption." }
      ],
      prevention: ["Zinc Sulfate supplementation during diarrhea", "Promoting diverse local seed and nut diets"],
      triageAdvisory: "Zinc Deficiency. Prescribe Zinc Sulfate supplementation (20mg daily, or 10mg if <6 months) for exactly 10 to 14 days during diarrheal episodes."
    },
    {
      id: "lassa-fever",
      name: "Lassa Fever",
      scientificName: "Lassa mammarenavirus infection",
      icd11: "1D81",
      category: "Vector-borne Disease",
      description: "An acute viral hemorrhagic illness transmitted to humans through contact with food or household items contaminated with rodent excreta. Endemic to parts of West Africa, causing severe fevers and bleeding.",
      symptoms: ["high-fever", "fatigue", "joint-pain"],
      climateLinks: [
        { trigger: "Dry Season Agricultural Smudging", impact: "Forces Mastomys rodent vectors out of forest fringe habitats into village grain silos." }
      ],
      prevention: ["Storing household grains in airtight metal drums", "Sustained domestic rodent controls", "Avoiding consumption of raw bushmeat"],
      triageAdvisory: "Lassa Fever suspected. Run ELISA or RT-PCR tests. Initiate early Ribavirin administration under strict isolation. Supportive hydration is critical. Do NOT give Aspirin/NSAIDs."
    },
    {
      id: "amoebic-dysentery",
      name: "Amoebic Dysentery",
      scientificName: "Entamoeba histolytica",
      icd11: "1A36.0",
      category: "Water-borne Pathogen",
      description: "A severe intestinal parasitic infection causing bloody diarrhea, abdominal cramps, and mucosal ulcers. Spread via ingestion of raw foods or water contaminated with microscopic cysts.",
      symptoms: ["dehydration", "fatigue", "vomiting"],
      climateLinks: [
        { trigger: "Shallow Well Recessional Drying", impact: "Forces concentration of cysts in stagnant public water structures during drought peaks." }
      ],
      prevention: ["Rigorous water boiling (minimum 1 minute)", "Sanitation filters", "Hand hygiene"],
      triageAdvisory: "Suspected Amoebic Dysentery. Perform stool microscopy. Administer Metronidazole (Flagyl) followed by a luminal deworming agent. Maintain active rehydration."
    },
    {
      id: "leptospirosis",
      name: "Leptospirosis",
      scientificName: "Leptospira interrogans infection",
      icd11: "1C1A",
      category: "Water-borne Pathogen",
      description: "A bacterial infection transmitted through water contaminated with the urine of infected rodents. Highly prevalent after tropical monsoons and floods. Causes sudden high fever, headache, vomiting, severe muscle aches (calves), and potentially fatal renal or liver failure (Weil's disease).",
      symptoms: ["high-fever", "joint-pain", "fatigue", "jaundice", "vomiting"],
      climateLinks: [
        { trigger: "Monsoon Flooding", impact: "Inundation flushes rodent excreta into crop fields, sewers, and rural drinking wells." }
      ],
      prevention: ["Wearing protective boots during farm work", "Avoiding wading in floodwaters", "Rodent control in food storage"],
      climateThreatSchema: {
        minTemp: 22,
        maxTemp: 38,
        minHumidity: 70,
        minRainfall: 120,
        maxRainfall: 999,
        advisory: "LEPTOSPIROSIS FLOOD WATCH: Standing floodwaters contain high rodent urine concentration. Counsel agricultural cohorts to wear high rubber boots and protect skin wounds."
      },
      triageAdvisory: "Leptospirosis suspected. Monitor urine output and scleral icterus (jaundice). Initiate Doxycycline early. Severe cases require intravenous penicillin and supportive critical care."
    },
    {
      id: "scrub-typhus",
      name: "Scrub Typhus",
      scientificName: "Orientia tsutsugamushi infection",
      icd11: "1A20.Y",
      category: "Vector-borne Disease",
      description: "An acute febrile illness transmitted by the bite of larval mites (chiggers) in tropical scrub vegetation. Induces a characteristic dark scab (eschar) at the bite site, profound headache, lymphadenopathy, and dry cough.",
      symptoms: ["high-fever", "fatigue", "joint-pain", "skin-ulcer", "cough"],
      climateLinks: [
        { trigger: "Post-Monsoon Vegetation Spikes", impact: "Heavy rains trigger massive vegetative scrub growth, expanding larval chigger micro-habitats." }
      ],
      prevention: ["Clearing grassy brush around outposts", "Applying permethrin repellents to farming clothes", "Wearing long clothing"],
      climateThreatSchema: {
        minTemp: 20,
        maxTemp: 34,
        minHumidity: 60,
        minRainfall: 80,
        maxRainfall: 300,
        advisory: "SCRUB TYPHUS SCRUB ALERT: High vegetation density multiplies mite habitats. Instruct communities to clear brush within a 100m radius of dwellings."
      },
      triageAdvisory: "Scrub Typhus suspected. Conduct a complete skin check for a black chigger scab (eschar). Initiate Doxycycline immediately without waiting for lab reports."
    },
    {
      id: "dracunculiasis",
      name: "Dracunculiasis (Guinea Worm)",
      scientificName: "Dracunculus medinensis",
      icd11: "1F6F",
      category: "Water-borne Pathogen",
      description: "Guinea Worm Disease. A debilitating parasitic worm infection contracted by drinking stagnant water contaminated with microscopic fleas (cyclops) harboring larvae. The adult worm grows up to 1 meter in length, migrating slowly to emerge through a burning skin blister on the limbs.",
      symptoms: ["joint-pain", "fatigue", "skin-ulcer"],
      climateLinks: [
        { trigger: "Dry Season Pond Concentration", impact: "Evaporative water scarcity forces communities to share concentrated stagnant surface ponds, expanding cyclops ingestion risk." }
      ],
      prevention: ["Filtering drinking water through fine mesh filters", "Preventing patients with emerging worms from entering water sources", "Treatment of surface ponds with larvicides"],
      triageAdvisory: "Guinea Worm emerging. Keep the wound clean and moist. Slowly wind the emerging worm around a sterile stick (a few centimeters daily). Do NOT pull forcefully; worm rupture causes severe anaphylaxis."
    },
    {
      id: "buruli-ulcer",
      name: "Buruli Ulcer",
      scientificName: "Mycobacterium ulcerans infection",
      icd11: "1B21",
      category: "Climate-linked Health Issue",
      description: "A chronic, necrotizing skin disease caused by Mycobacterium ulcerans. The bacterium secretes an immunosuppressive toxin (mycolactone) that destroys subcutaneous fat and tissues, leading to massive, painless open ulcers primarily on the limbs.",
      symptoms: ["fatigue", "skin-ulcer"],
      climateLinks: [
        { trigger: "Slow River Recessions", impact: "Low water flow and slow riverbeds foster mycobacterial biofilms on aquatic vegetation, exposing rural farmers." }
      ],
      prevention: ["Wearing long clothing while working in swamps", "Prompt washing and dressing of agricultural skin scratches", "Improved personal hygiene and water sanitation"],
      triageAdvisory: "Suspected Buruli Ulcer. Secure PCR swab of the undermined ulcer edge. Initiate standard WHO antibiotic course (Rifampicin + Clarithromycin or Streptomycin) daily for 8 weeks."
    },
    {
      id: "ebola",
      name: "Ebola Virus Disease",
      scientificName: "Ebola virus disease (EVD)",
      icd11: "1D80",
      category: "Vector-borne Disease",
      description: "A highly severe and fatal viral hemorrhagic fever. Spills over from zoonotic reservoirs (fruit bats) and spreads rapidly via direct contact with blood, secretions, or bodily fluids of infected individuals. Induces massive gastrointestinal vomiting, diarrhea, internal bleeding, and profound dehydration.",
      symptoms: ["high-fever", "fatigue", "joint-pain", "dehydration", "vomiting"],
      climateLinks: [
        { trigger: "Forest Dry Season Scarcity", impact: "Severe dry droughts force frugivorous bats into human domestic orchards, triggering animal-to-human spillover." }
      ],
      prevention: ["Strict avoidance of bushmeat and fruit bats", "Immediate clinical isolation", "Full Class-4 Personal Protective Equipment (PPE)", "Safe and dignified burial protocols"],
      triageAdvisory: "EMERGENCY WATCH: Isolate suspect immediately. Direct contact strictly prohibited. Notify disease control. Administer aggressive, massive oral/intravenous rehydration alongside monoclonal antibodies."
    },
    {
      id: "ascariasis",
      name: "Ascariasis",
      scientificName: "Ascaris lumbricoides infection",
      icd11: "1F65.0",
      category: "Water-borne Pathogen",
      description: "A major soil-transmitted helminth (giant roundworm) infection. Transmitted by swallowing eggs from soil contaminated with human feces or crops irrigated with raw sewage. Causes microcytic anemia, nutritional wasting, and potential intestinal obstruction in heavy pediatric cases.",
      symptoms: ["fatigue", "vomiting"],
      climateLinks: [
        { trigger: "Flooding & Wastewater Inundation", impact: "Extreme rainwater flooding washes fecal roundworm eggs across residential yards, home gardens, and water wells." }
      ],
      prevention: ["Mass school deworming campaigns", "Rigorous washing of vegetables with clean water", "Boiling agricultural water supplies"],
      triageAdvisory: "Ascariasis roundworm suspected. Run stool microscopy. Administer a single dose of Albendazole (400mg) to paralyze and flush adult worms."
    },
    {
      id: "brucellosis",
      name: "Brucellosis",
      scientificName: "Brucella abortus / melitensis",
      icd11: "1A90",
      category: "Climate-linked Health Issue",
      description: "A highly infectious zoonotic bacterial infection transmitted by consuming raw, unpasteurized milk and cheese, or by direct skin contact with fluids of infected cattle and goats. Induces undulating high fever, severe night sweats, carditis, and chronic arthralgic joint pain.",
      symptoms: ["high-fever", "joint-pain", "fatigue", "vomiting"],
      climateLinks: [
        { trigger: "Drought Pastoral Confluences", impact: "Dry seasonal drought forces herders and cattle to gather closely around scarce water points, driving horizontal infection." }
      ],
      prevention: ["Strict pasteurization/boiling of dairy", "Livestock vaccination programs", "Wearing gloves during livestock birthing assistances"],
      triageAdvisory: "Brucellosis suspected. Perform serological serum agglutination tests. Initiate a 6-week dual antibiotic course (Doxycycline + Rifampicin) to prevent bone and cardiac relapse."
    },
    {
      id: "trachoma",
      name: "Trachoma",
      scientificName: "Chlamydia trachomatis infection",
      icd11: "1B10",
      category: "Climate-linked Health Issue",
      description: "An infectious bacterial eye disease and the leading cause of preventable blindness globally. Spread via eye-seeking flies (Musca sorbens) and shared cloths. Recurrent infections cause severe eyelid scarring, turning eyelashes inward to scratch the cornea (trichiasis).",
      symptoms: ["joint-pain", "blindness"],
      climateLinks: [
        { trigger: "Arid Water Scarcity", impact: "Extreme arid conditions restrict washing water, leading to dirty faces that attract disease-carrying Musca flies." }
      ],
      prevention: ["WHO SAFE strategy: Surgery (for trichiasis), Antibiotics (Azithromycin), Facial cleanliness, Environmental hygiene"],
      triageAdvisory: "Trachoma diagnosed. Administer single-dose oral Azithromycin to active childhood cases. Refer patients with inward-facing lashes (trichiasis) for standard corrective eyelid surgery."
    }
  ],

  remedies: [
    {
      id: "artemisia-annua",
      name: "Artemisia Annua",
      scientificName: "Artemisia annua L. (Sweet Wormwood)",
      category: "botanical",
      description: "A highly aromatic traditional herb that synthesizes artemisinin, a sesquiterpene lactone. The baseline chemistry for modern malaria combination cures (ACTs).",
      activeConstituents: ["Artemisinin", "Flavonoids", "Essential Oils"],
      preparation: "Infusion (tea) prepared by steeping 5g of dried leaves in hot water for 10 minutes.",
      safetyRating: "Moderate Caution",
      safetyAlert: "Monotherapy using Artemisia tea is strongly discouraged by the WHO as it drives drug resistance. Always use under diagnostic confirmation.",
      interactions: "Do not co-administer with medications metabolized by CYP3A4.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "warning",
          title: "CLINICAL ALERT: Artemisia clinical warning",
          message: "While artemisinin derivatives (ACTs) are safe under clinical supervision in the 2nd and 3rd trimesters, consuming crude Artemisia annua tea in early pregnancy lacks safety data and may induce sub-therapeutic dosing."
        }
      ]
    },
    {
      id: "neem-leaves",
      name: "Neem Leaves",
      scientificName: "Azadirachta indica (Neem)",
      category: "botanical",
      synonyms: ["dogonyaro", "nim", "margosa", "indian lilac"],
      description: "Cornerstone tree of traditional medicine. AZADIRACHTIN compounds exhibit potent anti-insecticidal properties, disrupting vector larval development.",
      activeConstituents: ["Azadirachtin", "Nimbin", "Quercetin"],
      preparation: " Topical leaf oil applied as mosquito repellent, or leaf smudge burning to clear vector flies.",
      safetyRating: "High Caution",
      safetyAlert: "Strongly contraindicated in pregnancy (potent abortifacient). Oral Neem seed oil is toxic in children, causing liver damage.",
      interactions: "May lower blood sugar; check glucose when taking pharmaceutical antidiabetics.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "danger",
          title: "EXTREME ALERT: Neem is contraindicated in pregnancy",
          message: "Scientific research confirms Neem leaf extracts have potent abortifacient properties and can stimulate uterine contractions, causing miscarriage. Do not ingest under any circumstances during pregnancy."
        },
        {
          populationId: "children-under-5",
          type: "danger",
          title: "CRITICAL ALERT: Neem seed oil hepatotoxicity",
          message: "Documented clinical cases show oral consumption of Neem seed oil in infants causes toxic encephalopathy, mitochondrial damage, and severe Reye-like syndrome. Never administer internally."
        }
      ]
    },
    {
      id: "moringa-leaves",
      name: "Moringa Powder",
      scientificName: "Moringa oleifera (Drumstick Tree)",
      category: "botanical",
      synonyms: ["drumstick tree", "benzolive", "muringa", "horseradish tree"],
      description: "Fast-growing tropical superfood. Milled leaves are highly dense in vitamins, natural iron, and calcium, serving as a primary anti-malnutrition intervention.",
      activeConstituents: ["Beta-carotene", "Vitamin C", "Iron", "Polyphenols"],
      preparation: "1-2 tablespoons of finely dried leaf powder added directly to daily meals.",
      safetyRating: "Very High Safety",
      safetyAlert: "Extremely safe at dietary levels. Avoid root/bark preparations in pregnancy as they contain uterine stimulants.",
      interactions: "Highly safe. Enhances absorption of dietary iron.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "info",
          title: "NUTRITIONAL NOTICE: High Dietary Safety",
          message: "Moringa leaf powder is highly safe and beneficial for iron supplementation in pregnant women. However, avoid root or bark concentrates which contain uterine stimulants."
        }
      ]
    },
    {
      id: "papaya-leaf-extract",
      name: "Papaya Leaf Extract",
      scientificName: "Carica papaya (Papaya)",
      category: "botanical",
      synonyms: ["pawpaw", "papaw", "paw paw", "mugongo"],
      description: "Extract from papaya leaves. Clinical trials show significant capacity to increase gene expression responsible for accelerating platelet counts in viral hemorrhagic cases.",
      activeConstituents: ["Papain", "Carpaine", "Flavonoids"],
      preparation: "Crushed leaf extract juice (20-30ml twice daily).",
      safetyRating: "Moderate Safety",
      safetyAlert: "Ensure correct plant identification. Latex from unripe fruits must be fully avoided.",
      interactions: "May increase bleeding risk if combined with pharmaceutical blood thinners (Warfarin)."
    },
    {
      id: "oral-rehydration-salts",
      name: "Oral Rehydration Salts (ORS)",
      scientificName: "WHO electrolyte rehydration sachet",
      category: "pharmaceutical",
      description: "Balanced glucose-electrolyte rehydration sachet. Glucose-coupled sodium absorption in the gut drives water back into cells, saving lives from hypovolemic shock.",
      activeConstituents: ["Sodium Chloride", "Glucose Anhydrous", "Potassium Chloride", "Citrate"],
      preparation: "Dissolve 1 sachet in exactly 1 Liter of clean water. Sip frequently.",
      safetyRating: "Extremely Safe",
      safetyAlert: "Ensure exact water ratio. Hypertonic solutions (too concentrated) will drive osmotic fluid out of tissues and worsen diarrhea.",
      interactions: "None. Highly compatible with all botanical therapies.",
      demographicCautions: [
        {
          populationId: "children-under-5",
          type: "info",
          title: "PREPARATION ADVICE: Electrolyte precision",
          message: "ORS is extremely safe and a primary lifesaver. Ensure the sachet is mixed in exactly 1 Liter of clean water. Worsened dehydration can occur if mixed too concentrated."
        }
      ]
    },
    {
      id: "quinine",
      name: "Quinine",
      scientificName: "Quinine Sulfate",
      category: "pharmaceutical",
      description: "Classical Cinchona-bark derived alkaloid. Reserved today for severe cerebral malaria complications when modern ACT injections are unavailable.",
      activeConstituents: ["Quinine alkaloid"],
      preparation: "Oral clinical tablets or intravenous drip infusion under active clinical supervision.",
      safetyRating: "High Caution",
      safetyAlert: "Narrow therapeutic window. Widespread side effects (tinnitus, severe hypoglycemia, cardiotoxicity).",
      interactions: "Avoid combining with antacids containing magnesium/aluminum."
    },
    {
      id: "baobab-fruit",
      name: "Baobab Fruit Powder",
      scientificName: "Adansonia digitata L.",
      category: "botanical",
      description: "Dry pulp powder of the African Baobab fruit. Exceptionally high in Vitamin C (six times greater than oranges) and soluble prebiotic fibers, boosting zinc and iron absorption.",
      activeConstituents: ["Ascorbic Acid", "Pectin", "Tartaric Acid", "Potassium"],
      preparation: "10-20g of dry fruit powder dissolved in clean water or mixed into clinical porridge.",
      safetyRating: "Very High Safety",
      safetyAlert: "Extremely safe. Highly beneficial dietary prebiotic food.",
      interactions: "None. Dramatically enhances botanical iron absorption."
    },
    {
      id: "hibiscus-flowers",
      name: "Hibiscus Flower Tea",
      scientificName: "Hibiscus sabdariffa (Bissap)",
      category: "botanical",
      description: "Dried red calyces of the Roselle plant. Heavily consumed across the dry tropics as a refreshing, hydrating tea. Contains anthocyanins that exhibit natural ACE-inhibitor hypotensive properties.",
      activeConstituents: ["Delphinidin", "Hibiscic Acid", "Anthocyanins"],
      preparation: "Steep 3-5g of dried calyces in boiling water for 15 minutes. Serve cooled as cold rehydration.",
      safetyRating: "High Safety",
      safetyAlert: "Extremely safe as beverage. Avoid extremely high concentrations in acute hypotension.",
      interactions: "May decrease bioavailability of Acetaminophen/Paracetamol if consumed concurrently."
    },
    {
      id: "lemongrass",
      name: "Lemongrass Oil & Tea",
      scientificName: "Cymbopogon citratus",
      category: "botanical",
      description: "A fragrant grass yielding citronella essential oils. Burning lemongrass smudge acts as a highly effective, traditional spatial mosquito vector repellent.",
      activeConstituents: ["Citral", "Myrcene", "Geraniol"],
      preparation: "Essential oil diluted in coconut carrier oil applied topically, or dried grass smudge burned in clay pots.",
      safetyRating: "Moderate Safety",
      safetyAlert: "Do not apply undiluted lemongrass essential oil directly to skin; can cause severe contact dermatitis.",
      interactions: "None known."
    },
    {
      id: "cinchona-bark",
      name: "Cinchona Bark",
      scientificName: "Cinchona officinalis L.",
      category: "botanical",
      description: "The botanical source bark from which Quinine was originally isolated. Historically used by South American indigenous healers to treat febrile shivering before modern pharmacology.",
      activeConstituents: ["Quinine", "Quinidine", "Cinchonine", "Tannins"],
      preparation: "Decoction prepared by boiling 2g of dried bark powder in 250ml water for 15 minutes.",
      safetyRating: "High Caution",
      safetyAlert: "Highly dangerous if dose is not calibrated. Can induce severe cinchonism (deafness, vomiting, arrhythmias). Prefer modern quinine tablets.",
      interactions: "Strong cardiac drug interactions. Do not combine with antiarrhythmics."
    },
    {
      id: "garlic-bulb",
      name: "Garlic Extract",
      scientificName: "Allium sativum L.",
      category: "botanical",
      description: "Traditional bulbous plant. Organosulfur compounds exhibit powerful in-vitro and in-vivo anti-microbial, anti-parasitic, and vascular protective properties.",
      activeConstituents: ["Alliin", "Allicin", "Ajoene"],
      preparation: "Crushed fresh garlic cloves (1-2 cloves daily) consumed raw or diluted in warm botanical oil.",
      safetyRating: "High Safety",
      safetyAlert: "Safe in dietary amounts. High clinical doses may increase bleeding risk.",
      interactions: "Use caution when combined with antiplatelet drugs (Aspirin) or HIV protease inhibitors."
    },
    {
      id: "pumpkin-seeds",
      name: "Pumpkin Seeds",
      scientificName: "Cucurbita pepo L.",
      category: "botanical",
      synonyms: ["pepita", "cucurbita", "pumpkin seed"],
      pending: true,
      description: "Flat green edible seeds of the pumpkin. Contains cucurbitacin, an active amino acid that paralyzes soil-transmitted worms, allowing them to be flushed out of the gut naturally.",
      activeConstituents: ["Cucurbitacin", "Zinc", "Phytosterols", "L-Arginine"],
      preparation: "Mash 30-50g of raw, unsalted seeds into paste, mix with small amount of honey, consume on empty stomach.",
      safetyRating: "Very High Safety",
      safetyAlert: "Highly safe. An excellent, low-cost traditional deworming alternative.",
      interactions: "None."
    },
    {
      id: "artemether-lumefantrine",
      name: "Artemether-Lumefantrine (ACT)",
      scientificName: "Artemether / Lumefantrine combination therapy",
      category: "pharmaceutical",
      description: "The primary gold-standard WHO first-line antimalarial therapy. Artemether clears 99% of parasites rapidly, while Lumefantrine has a long half-life to clear residual parasitemia.",
      activeConstituents: ["Artemether", "Lumefantrine"],
      preparation: "Administered as standard oral tablets. Must be taken with fatty food/milk to double lumefantrine absorption.",
      safetyRating: "Moderate Safety",
      safetyAlert: "Ensure completion of the full 3-day clinical course (6 doses) to prevent immediate recrudescence and drug resistance.",
      interactions: "Do not combine with class IA/III antiarrhythmics or drugs prolonging QT interval.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "warning",
          title: "PREGNANCY CLINICAL WARNING",
          message: "Avoid ACTs in the first trimester of pregnancy if other WHO-approved treatments are available, though severe malaria cases require immediate saving of the mother's life under expert guidelines."
        }
      ]
    },
    {
      id: "albendazole",
      name: "Albendazole",
      scientificName: "Albendazole (Anthelmintic)",
      category: "pharmaceutical",
      description: "Broad-spectrum modern dewormer. Degrades the cytoplasmic microtubules of intestinal parasites, completely starving the worms of glucose absorption until they perish.",
      activeConstituents: ["Albendazole"],
      preparation: "Single oral chewable tablet (200mg or 400mg) administered twice yearly in high-prevalence soil zones.",
      safetyRating: "Moderate Safety",
      safetyAlert: "Contraindicated in the first trimester of pregnancy due to theoretical teratogenic risks.",
      interactions: "Dexamethasone and Praziquantel increase plasma levels of active albendazole metabolite.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "danger",
          title: "CONTRAINDICATION: First Trimester Pregnancy",
          message: "Albendazole dewormer is strictly contraindicated in the first trimester of pregnancy due to theoretical teratogenicity. Avoid unless strictly mandated under clinical supervision."
        }
      ]
    },
    {
      id: "zinc-sulfate",
      name: "Zinc Sulfate",
      scientificName: "Zinc Sulfate monohydrate",
      category: "pharmaceutical",
      description: "Primary pediatric diarrheal therapeutic. Reduces severity, duration, and recurrence of acute diarrhea by accelerating mucosal cell regeneration and immunological recovery.",
      activeConstituents: ["Zinc ions"],
      preparation: "Chewable dispersible tablets (20mg daily for 10-14 days during and after diarrhea).",
      safetyRating: "Extremely Safe",
      safetyAlert: "May cause vomiting if administered on a completely empty stomach. Best taken with food.",
      interactions: "May reduce absorption of oral iron and tetracycline antibiotics if taken concurrently.",
      demographicCautions: [
        {
          populationId: "children-under-5",
          type: "info",
          title: "CLINICAL ADVISORY: Diarrhea Recovery Standard",
          message: "WHO strongly mandates dispersible Zinc Sulfate daily for 10-14 days alongside ORS for pediatric diarrheal episodes to rebuild mucosal tight junctions."
        }
      ]
    },
    {
      id: "ciprofloxacin",
      name: "Ciprofloxacin",
      scientificName: "Ciprofloxacin Hydrochloride (Fluoroquinolone)",
      category: "pharmaceutical",
      description: "Broad-spectrum fluoroquinolone antibiotic. Inhibits bacterial DNA gyrase, reserved for severe systemic water-borne bacterial infections like acute Typhoid Fever.",
      activeConstituents: ["Ciprofloxacin"],
      preparation: "Oral tablets or IV drip under active clinical diagnosis.",
      safetyRating: "Moderate Caution",
      safetyAlert: "Avoid routine overuse due to rapid emergence of fluoroquinolone resistance in typhoid strains. Risk of tendon rupture.",
      interactions: "Do not take concurrently with dairy or calcium-fortified juices; reduces absorption by 50%."
    },
    {
      id: "praziquantel",
      name: "Praziquantel",
      scientificName: "Praziquantel (Anthelmintic)",
      category: "pharmaceutical",
      description: "The gold-standard anthelmintic treatment for Schistosomiasis. Increases calcium permeability of worm membranes, inducing immediate muscular contraction and paralysis of the parasite.",
      activeConstituents: ["Praziquantel"],
      preparation: "Weight-calibrated oral tablets administered as a single clinical dose (40mg/kg).",
      safetyRating: "Moderate Safety",
      safetyAlert: "May cause mild dizziness or abdominal pain as dead parasites release antigens into the portal vein.",
      interactions: "Rifampicin co-administration drastically lowers active praziquantel blood levels."
    },
    {
      id: "nifurtimox",
      name: "Nifurtimox",
      scientificName: "Nifurtimox (Antiprotozoal)",
      category: "pharmaceutical",
      description: "A nitrofuran antiprotozoal compound. Induces cytotoxic intracellular free radicals that destroy Trypanosoma cruzi parasites in active Chagas disease.",
      activeConstituents: ["Nifurtimox"],
      preparation: "Oral tablets administered daily under strict clinical supervision for 60-90 days.",
      safetyRating: "High Caution",
      safetyAlert: "Highly frequent side effects (anorexia, neurological changes, tremors, neuropathies). Complete treatment adherence is critical.",
      interactions: "Avoid alcohol consumption during the entire 90-day clinical course."
    },
    {
      id: "guava-leaves",
      name: "Guava Leaves",
      scientificName: "Psidium guajava L.",
      category: "botanical",
      description: "Traditional remedy for gastrointestinal spasms and diarrhea. Rich in quercetin and tannins that exhibit robust antispasmodic and anti-microbial activities.",
      activeConstituents: ["Quercetin", "Tannins", "Guajaverin", "Essential Oils"],
      preparation: "Decoction prepared by boiling 5-10 fresh leaves in 500ml water for 10 minutes.",
      safetyRating: "High Safety",
      safetyAlert: "Extremely safe at typical dietary doses. Avoid highly concentrated extracts in early infancy.",
      interactions: "May enhance clinical antidiarrheal medications; monitor for constipation.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "info",
          title: "Guava Leaf Safety Profile",
          message: "Guava leaf tea is highly safe at standard dietary strengths. Exhibits natural anti-spasmodic effects that calm intestinal cramping."
        }
      ]
    },
    {
      id: "ribavirin",
      name: "Ribavirin",
      scientificName: "Ribavirin (Antiviral)",
      category: "pharmaceutical",
      description: "A synthetic nucleoside analog. Inhibits viral RNA-dependent RNA polymerase, serving as the primary first-line therapeutic for acute Lassa Fever.",
      activeConstituents: ["Ribavirin"],
      preparation: "Oral or intravenous infusion administered under strict isolation clinical guidelines.",
      safetyRating: "High Caution",
      safetyAlert: "Highly teratogenic. Strictly contraindicated in pregnant women unless in life-saving emergencies where Ribavirin benefits outweigh maternal mortality risks.",
      interactions: "Do not combine with Zidovudine (increases anemia risks).",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "danger",
          title: "CRITICAL ALERT: High Teratogenicity",
          message: "Ribavirin is highly teratogenic. Avoid in pregnant women unless in extreme emergencies to preserve maternal life from severe hemorrhagic Lassa Fever."
        }
      ]
    },
    {
      id: "metronidazole",
      name: "Metronidazole",
      scientificName: "Metronidazole (Antiprotozoal)",
      category: "pharmaceutical",
      description: "A nitroimidazole antibiotic and antiprotozoal medication. Inhibits nucleic acid synthesis in anaerobic cells, serving as first-line therapy for acute Amoebic Dysentery.",
      activeConstituents: ["Metronidazole"],
      preparation: "Oral tablets administered three times daily for 5-10 days.",
      safetyRating: "Moderate Caution",
      safetyAlert: "Must completely avoid alcohol during therapy and for 48 hours after completion to prevent a severe disulfiram-like reaction.",
      interactions: "Do not consume alcohol. Disulfiram-like reactions include vomiting, flush, and tachycardia.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "warning",
          title: "CLINICAL ADVISORY: First Trimester Caution",
          message: "Crosses the placenta rapidly. Avoid during the first trimester of pregnancy unless amoebic abscess complications require urgent clinical therapy."
        }
      ]
    },
    {
      id: "doxycycline",
      name: "Doxycycline",
      scientificName: "Doxycycline Hyclate",
      category: "pharmaceutical",
      description: "A highly potent, broad-spectrum tetracycline antibiotic. Interferes with bacterial protein synthesis. It serves as the clinical first-line therapy for Leptospirosis and Scrub Typhus, and is also highly utilized for malaria prophylaxis.",
      activeConstituents: ["Doxycycline"],
      preparation: "Oral capsules/tablets administered once or twice daily after food with a full glass of water. Patient must remain upright for 30 minutes to prevent severe esophageal ulceration.",
      safetyRating: "Moderate Caution",
      safetyAlert: "Highly photosensitizing; increases severe sunburn risk under equatorial UV. Contraindicated in children and pregnancy due to permanent tooth staining.",
      interactions: "Absorption is drastically reduced if taken concurrently with iron, calcium, dairy, or antacids.",
      demographicCautions: [
        {
          populationId: "children-under-5",
          type: "danger",
          title: "CONTRAINDICATION: Permanent Enamel Staining",
          message: "Doxycycline binds to calcium during tooth development, causing permanent brown/yellow discoloration of teeth and enamel hypoplasia. Do not administer to children under 8 years unless in life-threatening rickettsial conditions."
        },
        {
          populationId: "pregnant-women",
          type: "danger",
          title: "CONTRAINDICATION: Fetal Skeletal Retardation",
          message: "Crosses the placenta. Associated with deceleration of bone growth and skeletal staining in the fetus, alongside increased maternal liver necrosis risks. Strongly contraindicated."
        }
      ]
    },
    {
      id: "ivermectin",
      name: "Ivermectin",
      scientificName: "Ivermectin (Broad-Spectrum Antiparasitic)",
      category: "pharmaceutical",
      description: "A highly effective, broad-spectrum anthelmintic agent. Binds to glutamate-gated chloride channels in nerve cells, paralyzing and killing microfilariae in River Blindness (Onchocerciasis) and severe soil parasitic mites.",
      activeConstituents: ["Ivermectin"],
      preparation: "Standard oral tablets administered as a single dose on an empty stomach with water.",
      safetyRating: "High Safety",
      safetyAlert: "Mass clearing of microfilariae may trigger a mild Mazzotti reaction (fever, rash, pruritus) due to dead parasite antigens; manage with antihistamines.",
      interactions: "None major. Highly compatible with massive community preventive programs.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "warning",
          title: "PREGNANCY CLINICAL CAUTION",
          message: "Safety during early embryogenesis is not fully validated. Avoid during the first trimester of pregnancy unless parasitosis threatens maternal survival."
        },
        {
          populationId: "children-under-5",
          type: "warning",
          title: "PEDIATRIC LIMITATION: Weight < 15 kg",
          message: "Safety and dosing parameters are not established for children weighing less than 15 kg. Avoid routing mass distribution in early infancy."
        }
      ]
    },
    {
      id: "sodium-stibogluconate",
      name: "Sodium Stibogluconate",
      scientificName: "Pentavalent Antimonial (SSG)",
      category: "pharmaceutical",
      description: "A classical pentavalent antimonial compound. Primary clinical therapeutic for cutaneous and visceral Leishmaniasis (Kala-azar). Inhibits parasite macromolecular synthesis.",
      activeConstituents: ["Pentavalent antimony"],
      preparation: "Intramuscular injection or slow intravenous drip administered daily in a clinical ward.",
      safetyRating: "High Caution",
      safetyAlert: "Extremely narrow therapeutic window. Can cause chemical pancreatitis, liver damage, and lethal cardiac arrhythmias. Requires baseline ECG monitoring.",
      interactions: "Do not combine with other cardiotoxic agents or drugs prolonging the QT interval."
    },
    {
      id: "rifampicin",
      name: "Rifampicin",
      scientificName: "Rifampin (Rifamycin Antibiotic)",
      category: "pharmaceutical",
      description: "A highly powerful rifamycin antibiotic. Inhibits bacterial DNA-dependent RNA polymerase, serving as the primary antimycobacterial standard for Buruli Ulcer and Leprosy.",
      activeConstituents: ["Rifampicin"],
      preparation: "Oral capsules administered daily on an empty stomach to ensure maximum absorption.",
      safetyRating: "Moderate Safety",
      safetyAlert: "Induces completely harmless orange-red discoloration of urine, sweat, tears, and saliva. Monitor liver function regularly in extended courses.",
      interactions: "Extremely strong inducer of hepatic CYP450 enzymes. Drastically lowers blood levels of oral contraceptives, warfarins, and anti-retrovirals."
    },
    {
      id: "ginger",
      name: "Ginger Rhizome",
      scientificName: "Zingiber officinale Roscoe",
      category: "botanical",
      description: "A traditional warming rhizome. Highly loaded with gingerols and shogaols that possess powerful anti-emetic, gastroprotective, and anti-inflammatory properties. Reduces severe nausea and fever distress.",
      activeConstituents: ["Gingerols", "Shogaols", "Zingiberene", "Diarylheptanoids"],
      preparation: "Decoction prepared by boiling 3-5g of fresh sliced ginger in 250ml water for 10 minutes, consumed warm.",
      safetyRating: "Very High Safety",
      safetyAlert: "Highly safe and well tolerated. Promotes stomach emptying. High doses should be used cautiously in bleeding disorders.",
      interactions: "May mildly enhance antiplatelet drugs (Aspirin); monitor in severe hemorrhagic climates.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "info",
          title: "EXCELLENT PREGNANCY ANTI-EMETIC",
          message: "Highly effective and scientifically validated for resolving early morning nausea and pregnancy vomiting. Safe at typical dietary strengths (1-2g daily)."
        }
      ]
    },
    {
      id: "aloe-vera",
      name: "Aloe Vera Gel",
      scientificName: "Aloe vera (L.) Burm.f.",
      category: "botanical",
      description: "A succulent plant yielding clear mucilage gel. Accelerates wound epithelization, soothes sunburn inflammation, and exhibits powerful antibacterial properties on cutaneous lesions.",
      activeConstituents: ["Acemannan", "Aloin", "Salicylic Acid", "Glucomannan"],
      preparation: "Topical application of fresh inner gel harvested directly from sliced leaves onto cleaned sores.",
      safetyRating: "High Safety",
      safetyAlert: "Extremely safe for topical dermal applications. Ingestion of raw yellow leaf sap (aloin latex) is contraindicated due to severe purgative cramping.",
      interactions: "None known topically.",
      demographicCautions: [
        {
          populationId: "pregnant-women",
          type: "danger",
          title: "CONTRAINDICATION: Oral Aloin Ingestion",
          message: "Ingestion of the raw yellow leaf latex (aloin) is strictly contraindicated in pregnancy due to potent uterine stimulating and abortifacient laxative effects. Topical inner gel remains 100% safe."
        }
      ]
    },
    {
      id: "turmeric",
      name: "Turmeric Powder",
      scientificName: "Curcuma longa L.",
      category: "botanical",
      description: "A golden-yellow rhizome spice. Curcumin compounds serve as a highly powerful natural anti-inflammatory agent, actively down-regulating NF-kB and COX-2 inflammatory pathways to relieve severe bone/joint pain.",
      activeConstituents: ["Curcumin", "Demethoxycurcumin", "Bisdemethoxycurcumin", "Zingiberene"],
      preparation: "1-2g of dried powder mixed in warm beverage. Must be paired with a pinch of black pepper (piperine) to increase bioavailability of curcumin by 2000%.",
      safetyRating: "Very High Safety",
      safetyAlert: "Extremely safe and non-toxic. Avoid massive concentrated extracts in active gallstone biliary obstructions.",
      interactions: "Synergistic anti-inflammatory response when combined with other traditional or clinical analgesics."
    },
    {
      id: "coconut-water",
      name: "Coconut Water",
      scientificName: "Cocos nucifera L. fluid",
      category: "botanical",
      description: "The clear, naturally sterile liquid inside young green coconuts. Exceptionally rich in potassium, natural glucose, and electrolytes, serving as a highly effective hydration standard in tropical zones.",
      activeConstituents: ["Potassium", "Sodium", "Magnesium", "Electrolyte Salts", "Cytokinins"],
      preparation: "Young green coconut sliced open and the sterile water consumed directly. Drink slowly.",
      safetyRating: "Very High Safety",
      safetyAlert: "Extremely safe. Provides a outstanding natural electrolyte rehydration fallback when clinical packages are stocked out.",
      interactions: "Fully compatible with all oral therapies. Promotes rapid renal clearing.",
      demographicCautions: [
        {
          populationId: "children-under-5",
          type: "info",
          title: "EXCELLENT pediatric rehydration fallback",
          message: "Coconut water provides a sterile, highly potassium-rich natural hydration fluid when ORS packages are unavailable. Administer slowly in sips."
        }
      ]
    }
  ],

  symptoms: [
    { id: "high-fever", name: "High Fever", description: "Elevated core body temperature (>38.5°C). Primary defense indicator." },
    { id: "joint-pain", name: "Severe Joint & Muscle Pain", description: "Excruxiating skeletal pain and muscular aches." },
    { id: "platelet-drop", name: "Thrombocytopenia", description: "Severe depletion of blood platelets, triggering bleeding risks." },
    { id: "dehydration", name: "Fluid & Salt Depletion", description: "Dehydration marked by dry tongue, rapid pulse, and dark sunken eyes." },
    { id: "fatigue", name: "Profound Fatigue", description: "Systemic muscle weakness, lethary, and tissue hypoxia." },
    { id: "jaundice", name: "Jaundice & Yellowing", description: "Yellowing of skin/eyes from liver and renal complications." },
    { id: "skin-ulcer", name: "Skin Ulcers & Lesions", description: "Debilitating cutaneous ulcers, open sores, or eschar scabs." },
    { id: "vomiting", name: "Vomiting & Nausea", description: "Severe gastric distress, vomiting, and inability to retain fluids." },
    { id: "blindness", name: "Visual Impairment / Blindness", description: "Progressive ocular damage leading to severe visual impairment or blindness." },
    { id: "cough", name: "Cough & Dyspnea", description: "Chest distress, acute coughing, and labored breathing." }
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

  outcomesMatrix: [
    {
      id: "m-1",
      remedyId: "artemether-lumefantrine",
      conditionId: "malaria",
      targetSymptomId: "high-fever",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Multicenter RCTs confirm first-line ACT clears Plasmodium falciparum asexual blood stages within 24-48 hours. Strongly recommended globally as first-line therapy.",
      citation: "WHO Guidelines for Malaria, 2023"
    },
    {
      id: "m-2",
      remedyId: "artemisia-annua",
      conditionId: "malaria",
      targetSymptomId: "high-fever",
      gradeQuality: "Moderate",
      recommendationStrength: "Conditional Against",
      traditionalAlignment: "High",
      clinicalSummary: "Artemisia annua infusions reduce parasite density and fever, but highly variable artemisinin levels lead to sub-therapeutic blood concentrations. WHO strongly recommends against monotherapy to prevent parasite drug resistance.",
      citation: "WHO Monograph / Journal of Ethnopharmacology, 2021"
    },
    {
      id: "m-3",
      remedyId: "neem-leaves",
      conditionId: "malaria",
      targetSymptomId: "high-fever",
      gradeQuality: "Low",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "High",
      clinicalSummary: "Lemongrass and Neem smudge burning shows insect-repelling spatial citronella effects. Oral leaf extracts show mild antipyretic pre-clinical response but lacks high-quality human trial validation for malaria cure.",
      citation: "Malaria Journal, 2018"
    },
    {
      id: "m-4",
      remedyId: "papaya-leaf-extract",
      conditionId: "dengue",
      targetSymptomId: "platelet-drop",
      gradeQuality: "Moderate",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "Emerging",
      clinicalSummary: "Double-blind RCTs show Carica papaya leaf extract significantly elevates platelet counts and stabilizes hematocrit levels in patients with acute Dengue-induced thrombocytopenia by boosting ALOX12 gene expression.",
      citation: "Lancet Infectious Diseases / Clinical Trials, 2020"
    },
    {
      id: "m-5",
      remedyId: "oral-rehydration-salts",
      conditionId: "dehydration",
      targetSymptomId: "dehydration",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "High",
      clinicalSummary: "Coupled sodium-glucose active transport in the gut operates normally even in cholera. Water is aggressively drawn back into tissues, immediately reversing life-threatening hypovolemic shock.",
      citation: "Lancet / WHO Rehydration Guidelines"
    },
    {
      id: "m-6",
      remedyId: "quinine",
      conditionId: "malaria",
      targetSymptomId: "high-fever",
      gradeQuality: "High",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "High",
      clinicalSummary: "Highly potent parasite clearance. Reserved clinically as a crucial second-line therapeutic for severe cerebral malaria complications when intravenous ACTs are unavailable. High side-effect profile.",
      citation: "New England Journal of Medicine, 2017"
    },
    {
      id: "m-7",
      remedyId: "moringa-leaves",
      conditionId: "iron-anemia",
      targetSymptomId: "fatigue",
      gradeQuality: "Moderate",
      recommendationStrength: "Strong For",
      traditionalAlignment: "High",
      clinicalSummary: "Controlled nutritional studies prove that Moringa oleifera leaves represent an exceptional natural source of iron and Vitamin C. Significantly increases hemoglobin and reduces microcytic anemia fatigue in vulnerable children.",
      citation: "African Journal of Nutrition, 2021"
    },
    {
      id: "m-8",
      remedyId: "baobab-fruit",
      conditionId: "iron-anemia",
      targetSymptomId: "fatigue",
      gradeQuality: "Moderate",
      recommendationStrength: "Strong For",
      traditionalAlignment: "High",
      clinicalSummary: "Clinical dietary trials demonstrate the organic acid content of Adansonia digitata fruit pulp powder acts as a potent non-heme iron absorption enhancer. Significantly reduces fatigue index in rural schools.",
      citation: "Journal of Nutritional Science, 2019"
    },
    {
      id: "m-9",
      remedyId: "zinc-sulfate",
      conditionId: "dehydration",
      targetSymptomId: "dehydration",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Highly robust global evidence confirms zinc supplementation accelerates water-electrolyte absorption, reduces diarrhea duration and stool frequency in children, and repairs mucosal damage.",
      citation: "Cochrane Systematic Review, 2021"
    },
    {
      id: "m-10",
      remedyId: "albendazole",
      conditionId: "hookworm",
      targetSymptomId: "fatigue",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Single-dose Albendazole (400mg) achieves parasite clearance rate of over 85% for Hookworm, directly stopping chronic gut blood loss and reversing systemic fatigue in agricultural cohorts.",
      citation: "PLOS Neglected Tropical Diseases, 2022"
    },
    {
      id: "m-11",
      remedyId: "pumpkin-seeds",
      conditionId: "hookworm",
      targetSymptomId: "fatigue",
      gradeQuality: "Low",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "High",
      clinicalSummary: "Cucurbitacin compound paralyzes intestinal nematodes, enabling mechanical fecal flushing. Useful as a low-cost, traditional rural anthelmintic alternative but exhibits lower efficacy than Albendazole.",
      citation: "Journal of Parasitology Research, 2019"
    },
    {
      id: "m-12",
      remedyId: "praziquantel",
      conditionId: "schistosomiasis",
      targetSymptomId: "fatigue",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Global gold-standard. Single dose (40mg/kg) clears adult worms, stopping egg deposition and reversing inflammatory chronic Bilharzia tissue damage.",
      citation: "WHO Preventive Chemotherapy Guidelines, 2022"
    },
    {
      id: "m-13",
      remedyId: "nifurtimox",
      conditionId: "chagas",
      targetSymptomId: "fatigue",
      gradeQuality: "Moderate",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Nifurtimox clears parasitic trypanosomes in the acute phase of Chagas disease. Highly recommended under clinical supervision, but carries a high profile of adverse neurological events.",
      citation: "CDC Chagas Disease Clinical Protocol"
    },
    {
      id: "m-14",
      remedyId: "ciprofloxacin",
      conditionId: "typhoid",
      targetSymptomId: "high-fever",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Highly potent fluoroquinolone. Rapidly clears Salmonella Typhi and resolves step-ladder fever in sensitive strains. Highly recommended for severe cases where local resistance profile is low.",
      citation: "American Journal of Tropical Medicine, 2018"
    },
    {
      id: "m-15",
      remedyId: "hibiscus-flowers",
      conditionId: "dehydration",
      targetSymptomId: "dehydration",
      gradeQuality: "Moderate",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "High",
      clinicalSummary: "Roselle tea is exceptionally high in organic acids and potassium, acting as a highly safe, refreshing rehydration beverage in arid tropical regions. Anthocyanins also show mild ACE-inhibiting hypotensive properties.",
      citation: "Journal of Ethnopharmacology, 2020"
    },
    {
      id: "m-16",
      remedyId: "garlic-bulb",
      conditionId: "hookworm",
      targetSymptomId: "fatigue",
      gradeQuality: "Low",
      recommendationStrength: "Conditional Against",
      traditionalAlignment: "High",
      clinicalSummary: "Freshly crushed allicin show moderate in-vitro anti-parasitic and anti-larval response. However, clinical in-vivo human studies show highly variable anthelmintic results, making Albendazole vastly superior.",
      citation: "Parasitology International, 2021"
    },
    {
      id: "m-17",
      remedyId: "lemongrass",
      conditionId: "dengue",
      targetSymptomId: "high-fever",
      gradeQuality: "Low",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "High",
      clinicalSummary: "Topical application of citral-rich lemongrass oil acts as a moderate personal spatial repellent against Aedes vectors. Lacks human trial evidence to treat active Dengue infections.",
      citation: "Tropical Biomedicine Journal, 2019"
    },
    {
      id: "m-18",
      remedyId: "moringa-leaves",
      conditionId: "vitamin-a-deficiency",
      targetSymptomId: "fatigue",
      gradeQuality: "Moderate",
      recommendationStrength: "Strong For",
      traditionalAlignment: "High",
      clinicalSummary: "Moringa leaves represent one of the densest plant sources of beta-carotene (provitamin A) in tropical zones. Easily cultivated in dry soil, significantly boosting serum retinol and correcting visual xerophthalmia.",
      citation: "World Journal of Agricultural Sciences, 2020"
    },
    {
      id: "m-19",
      remedyId: "baobab-fruit",
      conditionId: "malnutrition-sam",
      targetSymptomId: "fatigue",
      gradeQuality: "Low",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "High",
      clinicalSummary: "Pectin-rich baobab powder acts as a natural prebiotic, stabilizing microflora and improving nutrient absorption in moderately malnourished children. Should be paired with energy-dense lipids.",
      citation: "African Journal of Ecology, 2020"
    },
    {
      id: "m-20",
      remedyId: "zinc-sulfate",
      conditionId: "malnutrition-sam",
      targetSymptomId: "fatigue",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "WHO clinical protocol strongly mandates Zinc supplementation for severely malnourished children during therapeutic feeding (SAM) to rebuild standard cellular enzyme synthesis.",
      citation: "WHO Malnutrition Protocols, 2022"
    },
    {
      id: "m-21",
      remedyId: "cinchona-bark",
      conditionId: "malaria",
      targetSymptomId: "high-fever",
      gradeQuality: "Low",
      recommendationStrength: "Conditional Against",
      traditionalAlignment: "High",
      clinicalSummary: "Raw bark decoction clears Plasmodium parasites but dose calibration is highly uncertain, leading to a high clinical incidence of hearing impairment and toxicity. Modern oral Quinine tablets are strongly preferred.",
      citation: "Phytotherapy Research, 2019"
    },
    {
      id: "m-22",
      remedyId: "oral-rehydration-salts",
      conditionId: "cholera",
      targetSymptomId: "dehydration",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "High",
      clinicalSummary: "Primary life-saving therapeutic. Immediate, aggressive administration of low-osmolarity ORS prevents fatal hypovolemic dehydration in up to 90% of severe Vibrio cholerae episodes.",
      citation: "WHO Diarrhoeal Disease Control Manual, 2021"
    },
    {
      id: "m-23",
      remedyId: "ribavirin",
      conditionId: "lassa-fever",
      targetSymptomId: "high-fever",
      gradeQuality: "Moderate",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Clinical trial data confirms early administration of intravenous Ribavirin (within 6 days of symptom onset) significantly reduces mortality rates in patients with acute Lassa Fever.",
      citation: "New England Journal of Medicine, 1986 / CDC Lassa Protocol"
    },
    {
      id: "m-24",
      remedyId: "metronidazole",
      conditionId: "amoebic-dysentery",
      targetSymptomId: "dehydration",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Highly standardized clinical evidence confirms Metronidazole is exceptionally effective at eradicating Entamoeba histolytica trophozoites, rapidly resolving dysenteric cramping.",
      citation: "WHO Intestinal Protozoan Guidelines, 2021"
    },
    {
      id: "m-25",
      remedyId: "guava-leaves",
      conditionId: "amoebic-dysentery",
      targetSymptomId: "dehydration",
      gradeQuality: "Moderate",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "High",
      clinicalSummary: "Clinical trials and ethnobotanical studies confirm guava leaf decoction possesses significant antispasmodic, anti-secretory, and anti-microbial activities that lessen diarrheal severity.",
      citation: "Journal of Ethnopharmacology, 2018"
    },
    {
      id: "m-26",
      remedyId: "doxycycline",
      conditionId: "leptospirosis",
      targetSymptomId: "high-fever",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Double-blind clinical trials confirm early administration of Doxycycline rapidly clears Leptospira bacteremia, reducing severity and preventing development of Weil's syndrome.",
      citation: "Lancet Infectious Diseases, 2019"
    },
    {
      id: "m-27",
      remedyId: "doxycycline",
      conditionId: "scrub-typhus",
      targetSymptomId: "high-fever",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "RCTs confirm first-line oral Doxycycline eliminates Orientia tsutsugamushi, resolving fever within 24-48 hours and preventing severe systemic organ failure.",
      citation: "NEJM Clinical Protocols, 2021"
    },
    {
      id: "m-28",
      remedyId: "ivermectin",
      conditionId: "dracunculiasis",
      targetSymptomId: "joint-pain",
      gradeQuality: "Moderate",
      recommendationStrength: "Conditional Against",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "Clinical trials prove Ivermectin is ineffective at killing or accelerating extraction of adult Dracunculus medinensis. Standard manual tick-traction winding remains standard.",
      citation: "WHO Guinea Worm Eradication Report, 2020"
    },
    {
      id: "m-29",
      remedyId: "rifampicin",
      conditionId: "buruli-ulcer",
      targetSymptomId: "skin-ulcer",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "Unaligned",
      clinicalSummary: "WHO-backed trials confirm standard 8-week course of Rifampicin combined with Streptomycin or Clarithromycin achieves complete healing of Buruli ulcers in over 90% of early cases.",
      citation: "WHO Buruli Ulcer Guidelines, 2021"
    },
    {
      id: "m-30",
      remedyId: "ginger",
      conditionId: "ebola",
      targetSymptomId: "vomiting",
      gradeQuality: "Low",
      recommendationStrength: "Conditional For",
      traditionalAlignment: "High",
      clinicalSummary: "Ethnobotanical research and pre-clinical trials confirm ginger decoction suppresses gastric vomiting receptors. Extremely helpful as traditional supportive therapy to aid fluid retention in acute Ebola outbreaks.",
      citation: "Journal of Alternative and Complementary Medicine, 2018"
    },
    {
      id: "m-31",
      remedyId: "aloe-vera",
      conditionId: "solar-dermatitis",
      targetSymptomId: "joint-pain",
      gradeQuality: "Moderate",
      recommendationStrength: "Strong For",
      traditionalAlignment: "High",
      clinicalSummary: "RCTs prove that topical application of Aloe vera gel significantly reduces skin erythema and accelerates cell regeneration in actinic solar dermatitis caused by high equatorial UV exposure.",
      citation: "Journal of Dermatological Treatment, 2020"
    },
    {
      id: "m-32",
      remedyId: "turmeric",
      conditionId: "chikungunya",
      targetSymptomId: "joint-pain",
      gradeQuality: "Moderate",
      recommendationStrength: "Strong For",
      traditionalAlignment: "High",
      clinicalSummary: "Double-blind trials show that Curcumins significantly suppress chronic arthritic cytokines, providing substantial pain relief to patients suffering from chronic Chikungunya skeletal pain.",
      citation: "Clinical Rheumatology Journal, 2021"
    },
    {
      id: "m-33",
      remedyId: "coconut-water",
      conditionId: "dehydration",
      targetSymptomId: "dehydration",
      gradeQuality: "High",
      recommendationStrength: "Strong For",
      traditionalAlignment: "High",
      clinicalSummary: "Clinical standard rehydration analyses confirm young sterile coconut water is an outstanding natural rehydration standard containing natural potassium and salts, serving as a vital outpost fallback.",
      citation: "International Journal of Emergency Medicine, 2017"
    }
  ]
};
