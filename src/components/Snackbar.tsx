import type { SnackbarState } from '@/types';

interface SnackbarProps {
  snackbar: SnackbarState;
  onClose: () => void;
}

export function Snackbar({ snackbar, onClose }: SnackbarProps) {
  if (!snackbar.visible) return null;

  const isSuccess = snackbar.type === 'success';

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 safe-bottom animate-slide-up">
      <div
        className={`
          px-5 py-4
          rounded-2xl
          shadow-soft-lg
          flex items-center gap-4
          ${isSuccess
            ? 'bg-gradient-success text-white'
            : 'bg-white border-2 border-error-200 text-error-600'
          }
        `}
      >
        <div
          className={`
            w-10 h-10 min-h-0
            rounded-xl
            flex items-center justify-center
            flex-shrink-0
            ${isSuccess ? 'bg-white/20' : 'bg-error-100'}
          `}
        >
          {isSuccess ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          )}
        </div>

        <span className="flex-1 text-elderly-base font-medium">
          {snackbar.message}
        </span>

        <button
          onClick={onClose}
          className={`
            w-10 h-10 min-h-0
            rounded-xl
            flex items-center justify-center
            ${isSuccess
              ? 'hover:bg-white/20 text-white/80 hover:text-white'
              : 'hover:bg-error-100 text-error-400 hover:text-error-600'
            }
            focus:outline-none
          `}
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
