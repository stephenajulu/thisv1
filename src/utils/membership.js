// src/utils/membership.js
// Freemium business logic with Paystack integration and GPS Geofencing remote waiver for Kenya

// Major urban medical hubs in Kenya
export const KENYA_URBAN_HUBS = {
  Nairobi: { lat: -1.2921, lon: 36.8219 },
  Mombasa: { lat: -4.0435, lon: 39.6682 },
  Kisumu: { lat: -0.1022, lon: 34.7617 }
};

// Calculate distance in kilometers between two GPS coordinates using the Haversine formula
export function getDistanceKM(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Verify if the clinic coordinates are remote (>50km from all major Kenyan hubs)
export function verifyRemoteOutpost(lat, lon) {
  const calculations = [];
  for (const [cityName, coords] of Object.entries(KENYA_URBAN_HUBS)) {
    const distance = getDistanceKM(lat, lon, coords.lat, coords.lon);
    calculations.push({ city: cityName, distance });
  }

  // Is remote if distance from all hubs is greater than 50km
  const isRemote = calculations.every(calc => calc.distance > 50);
  const minDistance = Math.min(...calculations.map(c => c.distance));

  return {
    isRemote,
    minDistance,
    details: calculations
  };
}

// Check if the current user has unlocked PRO access (works completely offline!)
export function isProUnlocked() {
  // 1. Check local waiver bypass (cached GPS approval)
  if (localStorage.getItem('this_pro_waiver') === 'active') {
    return true;
  }

  // 2. Check local Paystack payment bypass (cached transaction approval)
  if (localStorage.getItem('this_pro_paid') === 'active') {
    return true;
  }

  // 3. Check Netlify Identity role validation (offline parse of cryptographically signed JWT)
  const gotrueUserStr = localStorage.getItem('gotrue.user');
  if (gotrueUserStr) {
    try {
      const user = JSON.parse(gotrueUserStr);
      const roles = user?.app_metadata?.roles || [];
      if (roles.includes('pro') || roles.includes('admin') || roles.includes('SuperAdmin')) {
        return true;
      }
    } catch (e) {
      console.error("Failed to parse Netlify Identity token offline:", e);
    }
  }

  return false;
}

// Activate a free geofenced remote outpost waiver
export function activateWaiver(lat, lon) {
  const check = verifyRemoteOutpost(lat, lon);
  if (check.isRemote) {
    localStorage.setItem('this_pro_waiver', 'active');
    // Save coordinate log for offline reference audit
    localStorage.setItem('this_pro_waiver_gps', JSON.stringify({ lat, lon, approvedAt: new Date().toISOString() }));
    return { success: true, minDistance: check.minDistance };
  }
  return { success: false, minDistance: check.minDistance };
}

// Activate membership via a successful Paystack checkout transaction
export function activatePaidMembership(reference) {
  localStorage.setItem('this_pro_paid', 'active');
  localStorage.setItem('this_pro_paid_ref', JSON.stringify({ reference, purchasedAt: new Date().toISOString() }));
  return { success: true };
}

// Cancel or deactivate PRO cache (for testing or logging out)
export function clearProMembership() {
  localStorage.removeItem('this_pro_waiver');
  localStorage.removeItem('this_pro_waiver_gps');
  localStorage.removeItem('this_pro_paid');
  localStorage.removeItem('this_pro_paid_ref');
}
