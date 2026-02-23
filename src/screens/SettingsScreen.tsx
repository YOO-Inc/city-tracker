import { useState } from 'react';
import { Header } from '@/components/Header';
import { t, getLanguage, setLanguage } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage);

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
      </main>
    </div>
  );
}
