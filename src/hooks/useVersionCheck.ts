import { useEffect, useRef, useState } from 'react';

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const currentBuildTime = useRef(__BUILD_TIME__);

  useEffect(() => {
    // Skip in development
    if (import.meta.env.DEV) return;

    // Feature flag: only enable if ?with-refresh=true is in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('with-refresh') !== 'true') return;

    const checkVersion = async () => {
      try {
        const res = await fetch('/version.json', { cache: 'no-store' });
        const { buildTime } = await res.json();
        // Only prompt if server version is NEWER (not just different)
        if (new Date(buildTime) > new Date(currentBuildTime.current)) {
          setUpdateAvailable(true);
        }
      } catch {
        // Network error or file not found - ignore
      }
    };

    // Only check when tab becomes visible (user returns to stale tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const refresh = () => window.location.reload();

  return { updateAvailable, refresh };
}
