import { t, getLocationDisplayAddress } from '@/lib/i18n';
import type { LocationData } from '@/types';

interface LocationChangedModalProps {
  visible: boolean;
  initialLocation: LocationData;
  currentLocation: LocationData;
  onSelectInitial: () => void;
  onSelectCurrent: () => void;
}

export function LocationChangedModal({
  visible,
  initialLocation,
  currentLocation,
  onSelectInitial,
  onSelectCurrent,
}: LocationChangedModalProps) {
  if (!visible) return null;

  const initialAddress = getLocationDisplayAddress(
    initialLocation.address_en_structured,
    initialLocation.address_he_structured
  );
  const currentAddress = getLocationDisplayAddress(
    currentLocation.address_en_structured,
    currentLocation.address_he_structured
  );

  // If both addresses are the same, the modal shouldn't be shown
  // But as a safety check, we handle it here
  const isSameAddress =
    initialAddress.street === currentAddress.street &&
    initialAddress.cityZip === currentAddress.cityZip;

  if (isSameAddress) {
    // Auto-select initial location if addresses are identical
    onSelectInitial();
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in"
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
            {t('locationChanged.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-elderly-base text-gray-600 text-center mb-6">
            {t('locationChanged.message')}
          </p>

          {/* Location options */}
          <div className="space-y-3 mb-8">
            {/* Initial location card */}
            <button
              onClick={onSelectInitial}
              className="
                w-full p-4 rounded-2xl
                bg-surface-50 border-2 border-surface-200
                text-start
                hover:border-primary-300 hover:bg-primary-50
                active:bg-primary-100
                transition-colors
              "
            >
              <p className="text-elderly-sm text-gray-500 mb-1">
                {t('locationChanged.initial')}
              </p>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
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
                <div className="flex-1 min-w-0">
                  <p className="text-elderly-base font-medium text-gray-900 truncate">
                    {initialAddress.street || t('entries.unknownLocation')}
                  </p>
                  {initialAddress.cityZip && (
                    <p className="text-elderly-sm text-gray-500 truncate">
                      {initialAddress.cityZip}
                    </p>
                  )}
                </div>
              </div>
            </button>

            {/* Current location card */}
            <button
              onClick={onSelectCurrent}
              className="
                w-full p-4 rounded-2xl
                bg-surface-50 border-2 border-surface-200
                text-start
                hover:border-primary-300 hover:bg-primary-50
                active:bg-primary-100
                transition-colors
              "
            >
              <p className="text-elderly-sm text-gray-500 mb-1">
                {t('locationChanged.current')}
              </p>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
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
                <div className="flex-1 min-w-0">
                  <p className="text-elderly-base font-medium text-gray-900 truncate">
                    {currentAddress.street || t('entries.unknownLocation')}
                  </p>
                  {currentAddress.cityZip && (
                    <p className="text-elderly-sm text-gray-500 truncate">
                      {currentAddress.cityZip}
                    </p>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
