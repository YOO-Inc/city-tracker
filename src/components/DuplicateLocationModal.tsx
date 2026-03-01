import { t, formatLocalizedDate, getEntryDisplayAddress } from '@/lib/i18n';
import type { Entry } from '@/types';

interface DuplicateLocationModalProps {
  visible: boolean;
  entry: Entry;
  currentIndex: number;
  totalCount: number;
  onSamePlace: () => void;
  onDifferentPlace: () => void;
}

export function DuplicateLocationModal({
  visible,
  entry,
  currentIndex,
  totalCount,
  onSamePlace,
  onDifferentPlace,
}: DuplicateLocationModalProps) {
  if (!visible) return null;

  const address = getEntryDisplayAddress(entry);
  const date = new Date(entry.created_at);
  const photoUrl = entry.photo_urls?.[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in"
      onClick={onSamePlace}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-surface-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pt-2 safe-bottom">
          {/* Title */}
          <h2 className="text-elderly-xl font-bold text-gray-900 text-center mb-2">
            {t('duplicate.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-elderly-base text-gray-600 text-center mb-6">
            {t('duplicate.message')}
          </p>

          {/* Entry info card */}
          <div className="flex items-start gap-4 bg-surface-50 rounded-2xl p-4 mb-4">
            {/* Photo thumbnail */}
            {photoUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-200">
                <img
                  src={photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-surface-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </div>
            )}

            {/* Entry details */}
            <div className="flex-1 min-w-0">
              <p className="text-elderly-base font-medium text-gray-900 truncate">
                {address.street || t('entries.unknownLocation')}
              </p>
              {address.cityZip && (
                <p className="text-elderly-sm text-gray-500 truncate">
                  {address.cityZip}
                </p>
              )}
              <p className="text-elderly-sm text-gray-400 mt-1">
                {formatLocalizedDate(date, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Progress indicator (if multiple) */}
          {totalCount > 1 && (
            <p className="text-elderly-sm text-gray-500 text-center mb-4">
              {t('duplicate.progress', {
                current: String(currentIndex + 1),
                total: String(totalCount),
              })}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={onSamePlace}
              className="
                flex-1 h-14 min-h-touch
                rounded-xl
                bg-surface-100 text-gray-700
                font-semibold text-elderly-base
                active:bg-surface-200
              "
            >
              {t('duplicate.samePlace')}
            </button>
            <button
              onClick={onDifferentPlace}
              className="
                flex-1 h-14 min-h-touch
                rounded-xl
                bg-primary-500 text-white
                font-semibold text-elderly-base
                active:bg-primary-600
              "
            >
              {t('duplicate.differentPlace')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
