import { useState } from 'react';
import { Header } from '@/components/Header';
import { t } from '@/lib/i18n';
import {
  getContacts,
  addContact,
  removeContact,
  isValidEmail,
  isValidPhone,
  type Contact,
} from '@/lib/contacts';

interface ContactsScreenProps {
  onBack: () => void;
}

export function ContactsScreen({ onBack }: ContactsScreenProps) {
  const [contacts, setContacts] = useState<Contact[]>(getContacts);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    if (error) setError(null);
  };

  const handleAddContact = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) {
      setError(t('contacts.nameRequired'));
      return;
    }
    if (!trimmedEmail && !trimmedPhone) {
      setError(t('contacts.atLeastOne'));
      return;
    }
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError(t('contacts.invalidEmail'));
      return;
    }
    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      setError(t('contacts.invalidPhone'));
      return;
    }
    addContact(trimmedName, trimmedEmail || undefined, trimmedPhone || undefined);
    setContacts(getContacts());
    setName('');
    setEmail('');
    setPhone('');
    setError(null);
  };

  const handleRemoveContact = (id: string) => {
    removeContact(id);
    setContacts(getContacts());
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-surface-50">
      <Header title={t('contacts.title')} onBack={onBack} />

      <main className="flex-1 p-5 space-y-5 animate-fade-in">
        {/* Existing contacts */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-surface-100">
          {contacts.length === 0 ? (
            <div>
              <p className="text-elderly-base text-gray-700 font-medium">
                {t('contacts.empty')}
              </p>
              <p className="text-elderly-sm text-gray-500 mt-1">
                {t('contacts.emptyHint')}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border-2 border-surface-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-elderly-base font-semibold text-gray-900 truncate">
                      {contact.name}
                    </p>
                    {contact.email && (
                      <p className="text-elderly-sm text-gray-500 truncate" dir="ltr">
                        {contact.email}
                      </p>
                    )}
                    {contact.phone && (
                      <p className="text-elderly-sm text-gray-500 truncate" dir="ltr">
                        {contact.phone}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="
                      w-11 h-11 min-h-0 rounded-xl
                      flex items-center justify-center flex-shrink-0
                      text-error-600 hover:bg-error-100
                      focus:outline-none focus-visible:ring-4 focus-visible:ring-error-200
                    "
                    aria-label={t('contacts.remove')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add form */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-surface-100 space-y-3">
          <h2 className="text-elderly-lg font-semibold text-gray-900">
            {t('contacts.add')}
          </h2>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError();
            }}
            placeholder={t('contacts.namePlaceholder')}
            className="
              w-full h-touch min-h-touch px-5 rounded-2xl
              text-elderly-base text-gray-900
              bg-white border-2 border-surface-200
              placeholder:text-gray-400
              focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20
              hover:border-surface-300
            "
          />
          <input
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            placeholder={t('contacts.emailPlaceholder')}
            dir="ltr"
            className="
              w-full h-touch min-h-touch px-5 rounded-2xl
              text-elderly-base text-gray-900
              bg-white border-2 border-surface-200
              placeholder:text-gray-400
              focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20
              hover:border-surface-300
            "
          />
          <input
            type="tel"
            inputMode="tel"
            autoCapitalize="none"
            autoCorrect="off"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearError();
            }}
            placeholder={t('contacts.phonePlaceholder')}
            dir="ltr"
            className="
              w-full h-touch min-h-touch px-5 rounded-2xl
              text-elderly-base text-gray-900
              bg-white border-2 border-surface-200
              placeholder:text-gray-400
              focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20
              hover:border-surface-300
            "
          />
          {error && (
            <p className="text-elderly-sm text-error-600 font-medium">{error}</p>
          )}
          <button
            onClick={handleAddContact}
            className="
              w-full h-touch min-h-touch rounded-2xl
              bg-gradient-primary text-white
              font-semibold text-elderly-base
              shadow-soft hover:shadow-glow
              active:scale-[0.98]
              focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50
            "
          >
            {t('contacts.add')}
          </button>
        </div>
      </main>
    </div>
  );
}
