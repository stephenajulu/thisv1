import { regionalProfiles } from '../data/regionalOverrides';

/**
 * Merges a baseline remedy object with dynamic regional overrides (contextual county metadata).
 * Ensures Swahili/tribal synonyms, availability ratings, and ecological safety warnings are merged in.
 */
export function getLocalizedRemedy(remedy, regionId) {
  if (!remedy) return remedy;
  const profile = regionalProfiles[regionId];
  if (!profile) return {
    ...remedy,
    availability: remedy.category === 'botanical' ? 'moderate' : 'stable',
    ecologicalAdvisory: null
  };

  const overrides = profile.remedyOverrides[remedy.id];
  if (!overrides) {
    return {
      ...remedy,
      availability: remedy.category === 'botanical' ? 'moderate' : 'stable',
      ecologicalAdvisory: null
    };
  }

  // Preserve the original name in baselineName to allow clear, dual visual comparisons
  const baselineName = remedy.name;

  return {
    ...remedy,
    name: overrides.localName || remedy.name,
    baselineName,
    synonyms: Array.from(new Set([
      ...(overrides.synonyms || []),
      ...(remedy.synonyms || []),
      baselineName
    ])),
    availability: overrides.availability,
    ecologicalAdvisory: overrides.ecologicalAdvisory
  };
}

/**
 * Returns all remedies merged with localized overrides for the given region.
 */
export function getLocalizedRemedies(remedies, regionId) {
  if (!Array.isArray(remedies)) return [];
  return remedies.map(r => getLocalizedRemedy(r, regionId));
}

/**
 * Placeholder for condition overlays if regional epidemiology overrides are configured.
 */
export function getLocalizedCondition(condition, regionId) {
  return condition;
}
