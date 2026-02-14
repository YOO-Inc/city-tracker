import { t } from '@/lib/i18n';

interface HomeScreenProps {
  onAddEntry: () => void;
  onViewEntries: () => void;
  entryCount?: number;
}

export function HomeScreen({ onAddEntry, onViewEntries, entryCount = 0 }: HomeScreenProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-gradient-to-b from-white via-surface-50 to-surface-100">
      {/* Header */}
      <header className="pt-10 pb-4 px-6">
        <h1 className="text-elderly-3xl font-bold text-gray-900 tracking-tight">
          {t('home.title')}
        </h1>
        <p className="mt-1 text-elderly-base text-gray-500">
          Log locations as you walk
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col px-6 pb-8">
        {/* Add Location Card */}
        <button
          onClick={onAddEntry}
          className="
            w-full p-6 rounded-3xl
            bg-gradient-primary text-white
            shadow-glow
            hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]
            active:scale-[0.98]
            focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 focus-visible:ring-offset-4
            flex items-center gap-5
            text-left
          "
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <div>
            <span className="text-elderly-xl font-bold block">
              {t('home.addLocation')}
            </span>
            <span className="text-primary-100 text-elderly-sm mt-1 block">
              Photo, type & GPS
            </span>
          </div>
        </button>

        {/* View Entries Card */}
        <button
          onClick={onViewEntries}
          className="
            w-full mt-5 p-5 rounded-3xl
            bg-white
            border-2 border-surface-200
            shadow-soft
            hover:border-primary-300 hover:shadow-soft-lg
            active:scale-[0.98]
            focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2
            flex items-center gap-4
            text-left
          "
        >
          <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-7 h-7 text-gray-600"
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
          <div className="flex-1">
            <span className="text-elderly-lg font-semibold text-gray-900 block">
              {t('home.viewEntries')}
            </span>
            {entryCount > 0 && (
              <span className="text-primary-600 text-elderly-base font-semibold mt-0.5 block">
                {entryCount} {entryCount === 1 ? 'location' : 'locations'} logged
              </span>
            )}
          </div>
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        {/* Empty state hint */}
        {entryCount === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            {t('home.emptyHint')}
          </p>
        )}
      </main>

      {/* Bottom decoration */}
      <div className="h-1.5 bg-gradient-primary opacity-30" />
    </div>
  );
}
