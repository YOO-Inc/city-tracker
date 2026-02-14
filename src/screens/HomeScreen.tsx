import { Header } from '@/components/Header';
import { t } from '@/lib/i18n';

interface HomeScreenProps {
  onAddEntry: () => void;
}

export function HomeScreen({ onAddEntry }: HomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header title={t('home.title')} />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <button
          onClick={onAddEntry}
          className="
            w-20 h-20
            rounded-full
            bg-primary text-white
            shadow-lg shadow-primary/30
            hover:bg-primary-dark
            focus:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4
            transition-all duration-200
            active:scale-95
            flex items-center justify-center
          "
          aria-label={t('home.addNewEntry')}
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <p className="mt-6 text-elderly-base text-gray-600 font-medium">
          {t('home.addNewEntry')}
        </p>
      </main>
    </div>
  );
}
