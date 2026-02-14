import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { t } from '@/lib/i18n';
import { getEntryTypes, setEntryTypes } from '@/lib/storage';

const DEFAULT_ENTRY_TYPES = ['Electricity Board', 'Billboard'];

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [types, setTypes] = useState<string[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setTypes(getEntryTypes());
  }, []);

  const handleAddType = () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) return;
    if (types.includes(trimmed)) return;

    const updated = [...types, trimmed];
    setTypes(updated);
    setEntryTypes(updated);
    setNewTypeName('');
  };

  const handleDeleteType = (typeToDelete: string) => {
    if (types.length <= 1) return;

    const updated = types.filter((t) => t !== typeToDelete);
    setTypes(updated);
    setEntryTypes(updated);
    setDeleteConfirm(null);
  };

  const handleResetDefaults = () => {
    setTypes(DEFAULT_ENTRY_TYPES);
    setEntryTypes(DEFAULT_ENTRY_TYPES);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-surface-50">
      <Header title={t('settings.title')} onBack={onBack} />

      <main className="flex-1 p-5 space-y-5 animate-fade-in">
        {/* Entry Types Section */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-surface-100">
          <h2 className="text-elderly-lg font-semibold text-gray-900 mb-4">
            {t('settings.entryTypes')}
          </h2>

          {/* Add New Type */}
          <div className="flex gap-3 mb-5">
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder={t('settings.newTypePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddType();
              }}
              className="
                flex-1 h-touch min-h-touch
                px-5 rounded-2xl
                text-elderly-base text-gray-900
                bg-surface-50 border-2 border-surface-200
                placeholder:text-gray-400
                focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20
                hover:border-surface-300
              "
            />
            <button
              onClick={handleAddType}
              disabled={!newTypeName.trim()}
              className="
                h-touch min-h-touch px-6 rounded-2xl
                bg-gradient-primary text-white
                font-semibold text-elderly-base
                shadow-soft hover:shadow-glow
                active:scale-[0.98]
                focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              "
            >
              {t('settings.addType')}
            </button>
          </div>

          {/* Types List */}
          {types.length === 0 ? (
            <p className="text-elderly-base text-gray-500 text-center py-6">
              {t('settings.noTypes')}
            </p>
          ) : (
            <ul className="space-y-3">
              {types.map((type) => (
                <li
                  key={type}
                  className="
                    flex items-center justify-between
                    p-4 rounded-2xl
                    bg-surface-50 border border-surface-200
                  "
                >
                  <span className="text-elderly-base text-gray-900 font-medium">
                    {type}
                  </span>
                  <button
                    onClick={() => setDeleteConfirm(type)}
                    disabled={types.length <= 1}
                    className="
                      w-12 h-12 min-h-0
                      flex items-center justify-center
                      rounded-xl
                      text-gray-400
                      hover:bg-red-50 hover:text-red-500
                      active:scale-95
                      focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400/50
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400
                    "
                    aria-label={`Delete ${type}`}
                  >
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
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reset to Defaults */}
        <Button variant="secondary" onClick={handleResetDefaults}>
          {t('settings.resetDefaults')}
        </Button>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 animate-fade-in"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-elderly-xl font-bold text-gray-900 text-center mb-2">
              {t('settings.deleteConfirmTitle')}
            </h3>
            <p className="text-elderly-base text-gray-600 text-center mb-6">
              "{deleteConfirm}"
            </p>
            <div className="space-y-3">
              <Button onClick={() => setDeleteConfirm(null)}>
                {t('settings.cancel')}
              </Button>
              <button
                onClick={() => handleDeleteType(deleteConfirm)}
                className="
                  w-full h-touch min-h-touch
                  px-8 rounded-2xl
                  bg-red-600 text-white
                  font-semibold text-elderly-base
                  shadow-soft
                  hover:bg-red-700
                  active:scale-[0.98]
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400/50 focus-visible:ring-offset-2
                "
              >
                {t('settings.deleteType')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
