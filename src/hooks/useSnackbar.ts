import { useState, useCallback, useRef } from 'react';
import type { SnackbarState } from '@/types';

interface UseSnackbarResult {
  snackbar: SnackbarState;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  hide: () => void;
}

const AUTO_DISMISS_MS = 3000;

export function useSnackbar(): UseSnackbarResult {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: '',
    type: 'success',
  });
  const timeoutRef = useRef<number | null>(null);

  const hide = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, visible: false }));
  }, []);

  const show = useCallback((message: string, type: 'success' | 'error') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSnackbar({ visible: true, message, type });

    timeoutRef.current = window.setTimeout(() => {
      hide();
    }, AUTO_DISMISS_MS);
  }, [hide]);

  const showSuccess = useCallback((message: string) => {
    show(message, 'success');
  }, [show]);

  const showError = useCallback((message: string) => {
    show(message, 'error');
  }, [show]);

  return { snackbar, showSuccess, showError, hide };
}
