import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { Entry } from '@/types';

interface EntriesListScreenProps {
  onBack: () => void;
  onAddEntry: () => void;
}

export function EntriesListScreen({ onBack, onAddEntry }: EntriesListScreenProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch entries:', error);
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    }

    fetchEntries();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('entries.today');
    if (diffDays === 1) return t('entries.yesterday');

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const truncateAddress = (address: string | null) => {
    if (!address) return 'Unknown location';
    const parts = address.split(',');
    return parts.slice(0, 2).join(',');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-surface-50">
      <Header title={t('entries.title')} onBack={onBack} />

      <main className="flex-1 p-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-surface-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <p className="text-elderly-lg font-semibold text-gray-700">
              {t('entries.empty')}
            </p>
            <p className="text-gray-500 mt-1">
              {t('entries.emptyHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl p-4 shadow-soft border border-surface-100 flex gap-4"
              >
                {/* Thumbnail or icon */}
                <div className="w-16 h-16 rounded-xl bg-surface-100 flex-shrink-0 overflow-hidden">
                  {entry.photo_urls && entry.photo_urls.length > 0 ? (
                    <img
                      src={entry.photo_urls[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-gray-400"
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
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-primary-100 text-primary-700 text-sm font-semibold">
                      {entry.type}
                    </span>
                    <span className="text-sm text-gray-400 flex-shrink-0">
                      {formatTime(entry.created_at)}
                    </span>
                  </div>

                  <p className="text-gray-700 font-medium mt-1.5 truncate">
                    {truncateAddress(entry.address)}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-400">
                    <span>{formatDate(entry.created_at)}</span>
                    {entry.photo_urls && entry.photo_urls.length > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        {entry.photo_urls.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={onAddEntry}
        className="
          fixed bottom-6 right-6
          w-16 h-16 min-h-0
          rounded-full
          bg-gradient-primary text-white
          shadow-glow
          hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
          active:scale-95
          focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 focus-visible:ring-offset-4
          flex items-center justify-center
          safe-bottom
        "
        aria-label="Add location"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>
    </div>
  );
}
