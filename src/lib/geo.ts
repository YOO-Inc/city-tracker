// Geographic utilities for distance calculation and bounding box queries

// Detection radius constants (in meters)
// Note: 10m is tight given typical GPS accuracy (5-15m). Adjust if needed.
export const DUPLICATE_DETECTION_RADIUS = 10;
export const MOVEMENT_DETECTION_RADIUS = 10;

// Maximum number of nearby entries to show in duplicate modal
export const MAX_NEARBY_ENTRIES = 5;

/**
 * Calculate the distance between two geographic points using the Haversine formula.
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/**
 * Calculate a bounding box around a point for efficient DB queries.
 * The box is an approximation that may include points slightly outside the radius.
 * Always apply precise distance filtering on results.
 */
export function getBoundingBox(
  lat: number,
  lon: number,
  radiusMeters: number
): BoundingBox {
  // Earth's radius in meters
  const R = 6371000;

  // Angular distance in radians
  const angularDistance = radiusMeters / R;

  // Latitude bounds (simple calculation)
  const latDelta = (angularDistance * 180) / Math.PI;
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;

  // Longitude bounds (depends on latitude for accuracy)
  const lonDelta = (angularDistance * 180) / (Math.PI * Math.cos((lat * Math.PI) / 180));
  const minLon = lon - lonDelta;
  const maxLon = lon + lonDelta;

  return { minLat, maxLat, minLon, maxLon };
}
