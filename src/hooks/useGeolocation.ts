import { useState, useEffect, useCallback } from 'react';
import type { LocationData } from '@/types';

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

        let address: string | null = null;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          address = data.display_name || null;
        } catch {
          console.warn('Could not reverse geocode address');
        }

        setLocation({ latitude, longitude, address });
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
