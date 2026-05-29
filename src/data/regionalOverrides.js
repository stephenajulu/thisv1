// Standalone Bounded Context Regional Overrides Database (100% Offline-Sovereign)
export const regionalProfiles = {
  nairobi: {
    id: 'nairobi',
    name: 'Nairobi (Highlands)',
    description: 'Central highland region with a cool climate, moderate rainfall, and high clinical density.',
    remedyOverrides: {
      'aloe-vera': {
        localName: 'Subiri',
        synonyms: ['Subiri', 'Aloe'],
        availability: 'moderate',
        ecologicalAdvisory: 'Grown widely in home gardens in Nairobi and central highlands. Abundance is stable.'
      },
      'moringa-leaves': {
        localName: 'Moringa',
        synonyms: ['Moringa'],
        availability: 'moderate',
        ecologicalAdvisory: 'Commonly available in local agricultural markets.'
      },
      'neem-leaves': {
        localName: 'Muarobaini',
        synonyms: ['Muarobaini', 'Neem'],
        availability: 'moderate',
        ecologicalAdvisory: 'Widely accessible in urban peripheral markets.'
      },
      'coconut-water': {
        localName: 'Maji ya Nazi',
        synonyms: ['Maji ya Nazi'],
        availability: 'moderate',
        ecologicalAdvisory: 'Imported from coastal regions. Available but commands premium pricing.'
      },
      'warburgia-salutaris': {
        localName: 'Muthiga',
        synonyms: ['Muthiga', 'Pepper-bark'],
        availability: 'moderate',
        ecologicalAdvisory: 'Occurs in the highland forest margins around Nairobi. Bark harvesting must be sustainable (use vertical strips).'
      },
      'kigelia-africana': {
        localName: 'Muua',
        synonyms: ['Muua', 'Sausage Tree'],
        availability: 'moderate',
        ecologicalAdvisory: 'Frequently grown as a shade tree in public parks and gardens.'
      },
      'prunus-africana': {
        localName: 'Muiri',
        synonyms: ['Muiri', 'Red Stinkwood'],
        availability: 'moderate',
        ecologicalAdvisory: 'Found in the remaining montane forests. Protected species; bark harvesting is regulated.'
      },
      'aloe-secundiflora': {
        localName: 'Subiri ya Pori',
        synonyms: ['Subiri ya Pori'],
        availability: 'moderate',
        ecologicalAdvisory: 'Grown extensively in school gardens and dry rockeries.'
      },
      'zanthoxylum-chalybeum': {
        localName: 'Mugucua',
        synonyms: ['Mugucua', 'Mjafari'],
        availability: 'scarce',
        ecologicalAdvisory: 'Scarce. Found only in dry bushlands surrounding the Nairobi basin.'
      },
      'lippia-javanica': {
        localName: 'Muthirithi',
        synonyms: ['Muthirithi', 'Fever Tea'],
        availability: 'abundant',
        ecologicalAdvisory: 'Highly abundant in open fields, roadsides, and highland grasslands.'
      },
      'tamarindus-indica': {
        localName: 'Mkwaju',
        synonyms: ['Mkwaju'],
        availability: 'moderate',
        ecologicalAdvisory: 'Imported primarily from Ukambani and drier lowlands.'
      }
    }
  },
  mombasa: {
    id: 'mombasa',
    name: 'Mombasa (Coast)',
    description: 'Hot and humid coastal environment. Peak breeding zones for mosquito vectors.',
    remedyOverrides: {
      'aloe-vera': {
        localName: 'Subiri',
        synonyms: ['Subiri', 'Mshubiri'],
        availability: 'moderate',
        ecologicalAdvisory: 'Thrives in sandy soils. Check for coastal salt damage on mature leaves.'
      },
      'moringa-leaves': {
        localName: 'Mshugi',
        synonyms: ['Mshugi', 'Mlonge'],
        availability: 'abundant',
        ecologicalAdvisory: 'Highly abundant. Thrives in dry coastal soils. Extremely rich source of micronutrients.'
      },
      'neem-leaves': {
        localName: 'Muarobaini',
        synonyms: ['Muarobaini', 'Neem'],
        availability: 'abundant',
        ecologicalAdvisory: 'Extremely abundant across all coastal districts. Check for powdery mildew or whitefly infestation during high-humidity seasons.'
      },
      'neem-seed-oil': {
        localName: 'Mafuta ya Muarobaini',
        synonyms: ['Mafuta ya Muarobaini'],
        availability: 'abundant',
        ecologicalAdvisory: 'Locally pressed neem seed oil is abundant and highly potent.'
      },
      'coconut-water': {
        localName: 'Maji ya Nazi',
        synonyms: ['Maji ya Nazi', 'Dafu'],
        availability: 'abundant',
        ecologicalAdvisory: 'Extremely abundant. Primary natural rehydration resource. Harvested fresh daily from coastal coconut palms.'
      },
      'warburgia-salutaris': {
        localName: 'Mkarambati',
        synonyms: ['Mkarambati', 'Muthiga'],
        availability: 'scarce',
        ecologicalAdvisory: 'Scarce. Lower altitude limits its growth. Protect local coastal forest pockets.'
      },
      'kigelia-africana': {
        localName: 'Mvunganya',
        synonyms: ['Mvunganya', 'Muua'],
        availability: 'abundant',
        ecologicalAdvisory: 'Very common along coastal riverbanks and lowland forests.'
      },
      'prunus-africana': {
        localName: 'Mviri',
        synonyms: ['Mviri'],
        availability: 'scarce',
        ecologicalAdvisory: 'Native to wet highlands; highly scarce at sea level.'
      },
      'aloe-secundiflora': {
        localName: 'Mugwanju-wa-Kipori',
        synonyms: ['Mugwanju-wa-Kipori'],
        availability: 'moderate',
        ecologicalAdvisory: 'Thrives on limestone cliffs and rocky coastal scrublands.'
      },
      'zanthoxylum-chalybeum': {
        localName: 'Mjafari',
        synonyms: ['Mjafari', 'Knobwood'],
        availability: 'abundant',
        ecologicalAdvisory: 'Highly abundant in coastal scrub and dry woodland zones. Highly potent root-bark.'
      },
      'lippia-javanica': {
        localName: 'Mshani',
        synonyms: ['Mshani'],
        availability: 'abundant',
        ecologicalAdvisory: 'Extremely abundant in disturbed soils and coastal grasslands.'
      },
      'tamarindus-indica': {
        localName: 'Mkwaju',
        synonyms: ['Mkwaju'],
        availability: 'abundant',
        ecologicalAdvisory: 'Extremely abundant. Harvest mature brown pods during dry seasons.'
      },
      'toddalia-asiatica': {
        localName: 'Mtondo',
        synonyms: ['Mtondo'],
        availability: 'moderate',
        ecologicalAdvisory: 'Found in coastal lowland evergreen forests and dunes.'
      }
    }
  },
  lodwar: {
    id: 'lodwar',
    name: 'Lodwar (Turkana Arid)',
    description: 'Arid desert environment in northern Kenya. Extremely high temperatures, low humidity, and high drought risk.',
    remedyOverrides: {
      'aloe-vera': {
        localName: 'Echuchuka',
        synonyms: ['Echuchuka', 'Aloe'],
        availability: 'scarce',
        ecologicalAdvisory: 'Severely restricted by desert heat. Harvest sparingly to prevent plant die-off.'
      },
      'moringa-leaves': {
        localName: 'Moringa',
        synonyms: ['Moringa'],
        availability: 'scarce',
        ecologicalAdvisory: 'Scarce. Found only near seasonal riverbeds (Luggas).'
      },
      'neem-leaves': {
        localName: 'Neem',
        synonyms: ['Neem', 'Muarobaini'],
        availability: 'scarce',
        ecologicalAdvisory: 'Limited localized availability. Protect young saplings from livestock grazing.'
      },
      'coconut-water': {
        localName: 'Coconut Water',
        synonyms: ['Coconut Water'],
        availability: 'scarce',
        ecologicalAdvisory: 'Coconut water is highly scarce in arid desert regions. PRIORITIZE standard clinical Oral Rehydration Salts (ORS) packets immediately for acute dehydration management.'
      },
      'aloe-secundiflora': {
        localName: 'Ekaas',
        synonyms: ['Ekaas'],
        availability: 'abundant',
        ecologicalAdvisory: 'Native wild aloe of Turkana hills. Extremely drought-resistant and abundant in stony regions.'
      },
      'zanthoxylum-chalybeum': {
        localName: 'Olisugi',
        synonyms: ['Olisugi'],
        availability: 'moderate',
        ecologicalAdvisory: 'Found on rocky volcanic outcroppings and seasonal water courses.'
      },
      'tamarindus-indica': {
        localName: 'Mkwaju',
        synonyms: ['Mkwaju', 'Osenetoi'],
        availability: 'moderate',
        ecologicalAdvisory: 'Found strictly along the Turkwel River banks. Pods provide crucial ascorbic acids during drought.'
      }
    }
  },
  kakamega: {
    id: 'kakamega',
    name: 'Kakamega (Western Rainforest)',
    description: 'Humid, heavy rainfall equatorial rainforest ecosystem. High soil moisture and diverse botanical flora.',
    remedyOverrides: {
      'aloe-vera': {
        localName: 'Kumusubiri',
        synonyms: ['Kumusubiri', 'Subiri'],
        availability: 'moderate',
        ecologicalAdvisory: 'Aloe vera suffers from heavy rain rot in rainforest climates. Ensure harvested leaves are strictly inspected for fungal damp-rot before gel extraction.'
      },
      'moringa-leaves': {
        localName: 'Kumulonge',
        synonyms: ['Kumulonge', 'Muringa'],
        availability: 'abundant',
        ecologicalAdvisory: 'Extremely abundant. Rapid leafy regrowth due to fertile tropical rain patterns.'
      },
      'neem-leaves': {
        localName: 'Kumutikili',
        synonyms: ['Kumutikili', 'Muarobaini'],
        availability: 'moderate',
        ecologicalAdvisory: 'Stable growth in highland clearances. Inspect leaves for leaf-spot fungus during peak rainfall months.'
      },
      'coconut-water': {
        localName: 'Maziwa ya Nazi',
        synonyms: ['Maziwa ya Nazi', 'Nazi'],
        availability: 'scarce',
        ecologicalAdvisory: 'Inland transport dependency makes fresh coconuts scarce. Rely on dry storage or local starch extracts for field fluids.'
      },
      'warburgia-salutaris': {
        localName: 'Muthiga',
        synonyms: ['Muthiga', 'Pepper-bark'],
        availability: 'abundant',
        ecologicalAdvisory: 'Highly abundant along the forest fringes. Favorable humid rainforest growth patterns.'
      },
      'kigelia-africana': {
        localName: 'Muua',
        synonyms: ['Muua', 'Kumufunganya'],
        availability: 'moderate',
        ecologicalAdvisory: 'Commonly distributed across Western river valleys.'
      },
      'prunus-africana': {
        localName: 'Muiri',
        synonyms: ['Muiri'],
        availability: 'moderate',
        ecologicalAdvisory: 'Lush growth in the primary forest reserve. Harvest bark sustainably under registered community forest guidelines.'
      },
      'aloe-secundiflora': {
        localName: 'Kumusubiri ya Pori',
        synonyms: ['Kumusubiri ya Pori'],
        availability: 'moderate',
        ecologicalAdvisory: 'Susceptible to mold in water-saturated rainforest soils. Cultivate on raised gravel beds.'
      },
      'zanthoxylum-chalybeum': {
        localName: 'Kumujafari',
        synonyms: ['Kumujafari'],
        availability: 'scarce',
        ecologicalAdvisory: 'Scarce. Prefers drier grassland savannas rather than dense equatorial rainforest canopies.'
      },
      'lippia-javanica': {
        localName: 'Muthirithi',
        synonyms: ['Muthirithi'],
        availability: 'abundant',
        ecologicalAdvisory: 'Very common weed in agricultural fields and cleared clearings.'
      },
      'mondia-whitei': {
        localName: 'Mukombero',
        synonyms: ['Mukombero', 'White-Ginger'],
        availability: 'abundant',
        ecologicalAdvisory: 'Western Kenya’s signature rainforest root. Highly abundant in primary forests. Prune roots responsibly (do not uproot the main trunk) to prevent species loss.'
      }
    }
  }
};
