import { useState, useEffect } from 'react';
import { t, translateTypeName, formatLocalizedDate, getLanguage, getEntryDisplayAddress } from '@/lib/i18n';
import { getTypeColor } from '@/lib/storage';
import { getContacts, type Contact } from '@/lib/contacts';
import { buildShareEntryMailto } from '@/lib/share';
import { PhotoCarousel } from './PhotoCarousel';
import type { Entry } from '@/types';

interface EntryPreviewModalProps {
  entry: Entry | null;
  visible: boolean;
  onClose: () => void;
}

export function EntryPreviewModal({ entry, visible, onClose }: EntryPreviewModalProps) {
  const [showContactPicker, setShowContactPicker] = useState(false);

  useEffect(() => {
    if (!visible) setShowContactPicker(false);
  }, [visible]);

  if (!visible || !entry) return null;

  const lang = getLanguage();
  const address = getEntryDisplayAddress(entry);
  const date = new Date(entry.created_at);
  const contacts: Contact[] = getContacts();

  const openMail = (recipient?: string) => {
    if (!entry) return;
    window.location.href = buildShareEntryMailto(entry, recipient);
    setShowContactPicker(false);
  };

  const handleShareClick = () => {
    if (contacts.length === 0) {
      openMail();
    } else if (contacts.length === 1) {
      openMail(contacts[0].email);
    } else {
      setShowContactPicker(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="
          w-full bg-white shadow-xl max-h-[90vh] overflow-y-auto overscroll-contain
          rounded-t-3xl animate-slide-up
          md:rounded-3xl md:max-w-lg md:animate-modal-scale md:mx-4
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar - mobile only */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white rounded-t-3xl md:hidden">
          <div className="w-10 h-1 bg-surface-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-10 h-10 min-h-0 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200 z-10"
          aria-label={t('preview.close')}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="px-6 pb-8 pt-2 md:pt-6 safe-bottom">
          {/* Type badge */}
          <div className="mb-4">
            <span
              className="inline-block px-3 py-1 rounded-lg text-elderly-base font-semibold text-white"
              style={{ backgroundColor: getTypeColor(entry.type) }}
            >
              {translateTypeName(entry.type)}
            </span>
          </div>

          {/* Photos */}
          <div className="mb-6">
            <PhotoCarousel photos={entry.photo_urls || []} />
          </div>

          {/* Address */}
          <div className="mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div>
                <p className="text-elderly-base text-gray-900 font-medium">
                  {address.street || t('entries.unknownLocation')}
                </p>
                {address.cityZip && (
                  <p className="text-elderly-sm text-gray-500">{address.cityZip}</p>
                )}
              </div>
            </div>
          </div>

          {/* Date/Time */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-elderly-base text-gray-900">
                  {formatLocalizedDate(date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-elderly-sm text-gray-500">
                  {date.toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {entry.description && (
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <p className="text-elderly-base text-gray-700">{entry.description}</p>
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-6 mb-4">
            {!showContactPicker ? (
              <button
                onClick={handleShareClick}
                className="
                  w-full h-touch min-h-touch rounded-2xl
                  bg-gradient-primary text-white
                  font-semibold text-elderly-base
                  shadow-soft hover:shadow-glow
                  active:scale-[0.98]
                  flex items-center justify-center gap-3
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50
                "
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {t('share.button')}
              </button>
            ) : (
              <div>
                <p className="text-elderly-base font-semibold text-gray-900 mb-3">
                  {t('share.pickContactTitle')}
                </p>
                <ul className="space-y-2">
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <button
                        onClick={() => openMail(contact.email)}
                        className="
                          w-full h-touch min-h-touch px-5 rounded-2xl
                          bg-white text-start
                          border-2 border-surface-200
                          hover:border-primary-300
                          active:scale-[0.99]
                          flex flex-col justify-center
                          focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50
                        "
                      >
                        <span className="text-elderly-base font-semibold text-gray-900 truncate">
                          {contact.name}
                        </span>
                        <span className="text-elderly-sm text-gray-500 truncate">
                          {contact.email}
                        </span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => openMail()}
                      className="
                        w-full h-touch min-h-touch px-5 rounded-2xl
                        bg-white text-gray-700
                        border-2 border-dashed border-surface-300
                        hover:border-primary-300 hover:text-primary-600
                        text-elderly-base font-medium
                        focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50
                      "
                    >
                      {t('share.noRecipient')}
                    </button>
                  </li>
                </ul>
                <button
                  onClick={() => setShowContactPicker(false)}
                  className="
                    mt-3 w-full h-touch min-h-touch rounded-2xl
                    bg-transparent text-gray-600
                    text-elderly-base font-medium
                    hover:bg-surface-100
                    focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-300
                  "
                >
                  {t('share.cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
