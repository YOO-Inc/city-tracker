import { useState } from 'react';
import { Header } from '@/components/Header';
import { t, getLanguage, setLanguage, isRTL } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

interface SettingsScreenProps {
  onBack: () => void;
  onOpenContacts: () => void;
}

export function SettingsScreen({ onBack, onOpenContacts }: SettingsScreenProps) {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage);
  const rtl = isRTL();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCurrentLang(lang);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-surface-50">
      <Header title={t('settings.title')} onBack={onBack} />

      <main className="flex-1 p-5 space-y-5 animate-fade-in">
        {/* Language Section */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-surface-100">
          <h2 className="text-elderly-lg font-semibold text-gray-900 mb-4">
            {t('settings.language')}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`
                flex-1 h-touch min-h-touch rounded-2xl
                font-semibold text-elderly-base
                border-2 transition-all
                ${currentLang === 'en'
                  ? 'bg-gradient-primary text-white border-transparent shadow-glow'
                  : 'bg-white text-gray-700 border-surface-200 hover:border-primary-300'
                }
              `}
            >
              {t('settings.english')}
            </button>
            <button
              onClick={() => handleLanguageChange('he')}
              className={`
                flex-1 h-touch min-h-touch rounded-2xl
                font-semibold text-elderly-base
                border-2 transition-all
                ${currentLang === 'he'
                  ? 'bg-gradient-primary text-white border-transparent shadow-glow'
                  : 'bg-white text-gray-700 border-surface-200 hover:border-primary-300'
                }
              `}
            >
              {t('settings.hebrew')}
            </button>
          </div>
        </div>

        {/* Contacts navigation row */}
        <button
          onClick={onOpenContacts}
          className="
            w-full bg-white rounded-3xl p-5 shadow-soft border border-surface-100
            flex items-center gap-3
            hover:border-primary-300 active:scale-[0.99] transition-all
            focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50
          "
        >
          <span className="flex-1 text-elderly-lg font-semibold text-gray-900 text-start">
            {t('settings.contacts')}
          </span>
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            style={{ transform: rtl ? 'scaleX(-1)' : undefined }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </main>
    </div>
  );
}
