import { useState, useEffect, useCallback } from 'react';
import type { LocationData, StructuredAddress } from '@/types';

// Nominatim API response types
interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

interface NominatimResponse {
  display_name: string;
  address: NominatimAddress;
}

interface AddressResult {
  displayName: string | null;
  structured: StructuredAddress | null;
}

// Extract city from Nominatim address (could be city, town, village, or municipality)
function extractCity(address: NominatimAddress): string | null {
  return address.city || address.town || address.village || address.municipality || null;
}

// Pick the cleaner neighborhood value
function pickNeighborhood(neighbourhood: string | undefined, suburb: string | undefined): string | null {
  if (!neighbourhood && !suburb) return null;
  if (!neighbourhood) return suburb || null;
  if (!suburb) return neighbourhood || null;

  // Both exist - if one contains the other, pick the shorter (cleaner) one
  if (neighbourhood.includes(suburb)) return suburb;
  if (suburb.includes(neighbourhood)) return neighbourhood;

  // No containment - prefer suburb as it's more consistent in Israel
  return suburb;
}

// Convert Nominatim address to our StructuredAddress type
function toStructuredAddress(address: NominatimAddress): StructuredAddress {
  return {
    house_number: address.house_number || null,
    street: address.road || null,  // Nominatim uses "road"
    neighborhood: pickNeighborhood(address.neighbourhood, address.suburb),
    city: extractCity(address),
    county: address.county || null,
    state: address.state || null,
    postcode: address.postcode || null,
    country: address.country || null,
    country_code: address.country_code || null,
  };
}

async function fetchAddress(lat: number, lon: number, lang: 'en' | 'he'): Promise<AddressResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}&addressdetails=1`
    );
    const data: NominatimResponse = await response.json();

    return {
      displayName: data.display_name || null,
      structured: data.address ? toStructuredAddress(data.address) : null,
    };
  } catch {
    console.warn(`Could not reverse geocode address (${lang})`);
    return { displayName: null, structured: null };
  }
}

interface UseGeolocationResult {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  /** Get current location on-demand without triggering state updates */
  getCurrentLocation: () => Promise<LocationData | null>;
}

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const fetchLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Fetch full addresses in both languages in parallel
        const [enResult, heResult] = await Promise.all([
          fetchAddress(latitude, longitude, 'en'),
          fetchAddress(latitude, longitude, 'he'),
        ]);

        setLocation({
          latitude,
          longitude,
          address: enResult.displayName,
          address_he: heResult.displayName,
          address_en_structured: enResult.structured,
          address_he_structured: heResult.structured,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation, attempt]);

  const retry = useCallback(() => {
    setAttempt((prev) => prev + 1);
  }, []);

  /**
   * Get current location on-demand without triggering re-render.
   * Useful for checking location at save time.
   */
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Fetch addresses in both languages
          const [enResult, heResult] = await Promise.all([
            fetchAddress(latitude, longitude, 'en'),
            fetchAddress(latitude, longitude, 'he'),
          ]);

          resolve({
            latitude,
            longitude,
            address: enResult.displayName,
            address_he: heResult.displayName,
            address_en_structured: enResult.structured,
            address_he_structured: heResult.structured,
          });
        },
        () => {
          // On error, return null silently (don't block user)
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return { location, loading, error, retry, getCurrentLocation };
}
