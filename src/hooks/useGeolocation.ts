import { useState, useEffect, useCallback } from 'react';
import type { LocationData } from '@/types';

interface UseGeolocationResult {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

async function fetchAddress(lat: number, lon: number, lang: 'en' | 'he'): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}`
    );
    const data = await response.json();
    return data.display_name || null;
  } catch {
    console.warn(`Could not reverse geocode address (${lang})`);
    return null;
  }
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
