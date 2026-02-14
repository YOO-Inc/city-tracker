import { useState, useEffect, useCallback } from 'react';
import type { LocationData } from '@/types';

interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

function formatAddress(data: NominatimResponse): string | null {
  if (!data.address) {
    return data.display_name || null;
  }

  const addr = data.address;
  const parts: string[] = [];

  // Street and number
  if (addr.road) {
    const street = addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road;
    parts.push(street);
  }

  // City (try various fields)
  const city = addr.city || addr.town || addr.village || addr.municipality;
  if (city) {
    parts.push(city);
  }

  // Postcode
  if (addr.postcode) {
    parts.push(addr.postcode);
  }

  return parts.length > 0 ? parts.join(', ') : data.display_name || null;
}

async function fetchAddress(lat: number, lon: number, lang: 'en' | 'he'): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}&addressdetails=1`
    );
    const data: NominatimResponse = await response.json();
    return formatAddress(data);
  } catch {
    console.warn(`Could not reverse geocode address (${lang})`);
    return null;
  }
}

interface UseGeolocationResult {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
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

        // Fetch addresses in both languages in parallel
        const [address, address_he] = await Promise.all([
          fetchAddress(latitude, longitude, 'en'),
          fetchAddress(latitude, longitude, 'he'),
        ]);

        setLocation({ latitude, longitude, address, address_he });
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

  return { location, loading, error, retry };
}
