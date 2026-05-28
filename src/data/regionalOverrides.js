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
      }
    }
  }
};
