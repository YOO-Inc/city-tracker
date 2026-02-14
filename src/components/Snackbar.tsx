import type { SnackbarState } from '@/types';

interface SnackbarProps {
  snackbar: SnackbarState;
  onClose: () => void;
}

export function Snackbar({ snackbar, onClose }: SnackbarProps) {
  if (!snackbar.visible) return null;

  const bgColor = snackbar.type === 'success' ? 'bg-success' : 'bg-error';

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div
        className={`
          ${bgColor}
          text-white
          px-6 py-4
          rounded-xl
          shadow-lg
          flex items-center justify-between
          text-elderly-base font-medium
          animate-slide-up
        `}
      >
        <div className="flex items-center gap-3">
          {snackbar.type === 'success' ? (
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          <span>{snackbar.message}</span>
        </div>
        <button
          onClick={onClose}
          className="
            p-2 -mr-2
            rounded-lg
            hover:bg-white/20
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white
            min-h-0
          "
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
