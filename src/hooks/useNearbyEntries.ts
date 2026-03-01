import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  calculateDistance,
  getBoundingBox,
  DUPLICATE_DETECTION_RADIUS,
  MAX_NEARBY_ENTRIES,
} from '@/lib/geo';
import type { Entry } from '@/types';

export interface NearbyEntry extends Entry {
  distance: number; // Distance in meters
}

interface UseNearbyEntriesResult {
  nearbyEntries: NearbyEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to find nearby entries of a specific type within the detection radius.
 * Returns entries sorted by distance (closest first), limited to MAX_NEARBY_ENTRIES.
 */
export function useNearbyEntries(
  latitude: number | null,
  longitude: number | null,
  entryType: string | null
): UseNearbyEntriesResult {
  const [nearbyEntries, setNearbyEntries] = useState<NearbyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Track last query params to avoid duplicate queries
  const lastQueryRef = useRef<string>('');

  const fetchNearbyEntries = useCallback(async () => {
    // Skip if missing required params
    if (latitude === null || longitude === null || !entryType) {
      setNearbyEntries([]);
      return;
    }

    // Create a key to track if params changed
    const queryKey = `${latitude.toFixed(6)}-${longitude.toFixed(6)}-${entryType}`;
    if (queryKey === lastQueryRef.current && fetchTrigger === 0) {
      return; // Skip duplicate query
    }
    lastQueryRef.current = queryKey;

    setLoading(true);
    setError(null);

    try {
      // Calculate bounding box for efficient DB query
      const bbox = getBoundingBox(latitude, longitude, DUPLICATE_DETECTION_RADIUS);

      // Query entries within bounding box that match the type
      const { data, error: queryError } = await supabase
        .from('entries')
        .select('*')
        .eq('type', entryType)
        .gte('latitude', bbox.minLat)
        .lte('latitude', bbox.maxLat)
        .gte('longitude', bbox.minLon)
        .lte('longitude', bbox.maxLon);

      if (queryError) {
        console.error('Error fetching nearby entries:', queryError);
        setError(queryError.message);
        setNearbyEntries([]);
        return;
      }

      if (!data || data.length === 0) {
        setNearbyEntries([]);
        return;
      }

      // Calculate precise distances and filter to actual radius
      const entriesWithDistance: NearbyEntry[] = (data as Entry[])
        .map((entry) => ({
          ...entry,
          distance: calculateDistance(
            latitude,
            longitude,
            entry.latitude,
            entry.longitude
          ),
        }))
        .filter((entry) => entry.distance <= DUPLICATE_DETECTION_RADIUS)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_NEARBY_ENTRIES);

      setNearbyEntries(entriesWithDistance);
    } catch (err) {
      console.error('Error in useNearbyEntries:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setNearbyEntries([]);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, entryType, fetchTrigger]);

  useEffect(() => {
    fetchNearbyEntries();
  }, [fetchNearbyEntries]);

  const refetch = useCallback(() => {
    lastQueryRef.current = ''; // Clear cache to force refetch
    setFetchTrigger((prev) => prev + 1);
  }, []);

  return { nearbyEntries, loading, error, refetch };
}
