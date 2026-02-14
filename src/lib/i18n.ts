import en from '@/locales/en.json';
import he from '@/locales/he.json';

export type Language = 'en' | 'he';
export type Direction = 'ltr' | 'rtl';

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

const translations: Record<Language, typeof en> = {
  en,
  he: he as typeof en,
};

// Default entry type translations (English name -> Hebrew display name)
const TYPE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Electricity Board': { en: 'Electricity Board', he: 'לוח חשמל' },
  'Billboard': { en: 'Billboard', he: 'שלט פרסום' },
};

const LANGUAGE_STORAGE_KEY = 'language';

let currentLanguage: Language = 'en';
let listeners: Array<() => void> = [];

export function initLanguage(): void {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'he') {
      currentLanguage = stored;
    }
  } catch {
    // localStorage not available
  }
  applyDirection();
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // localStorage not available
  }
  applyDirection();
  listeners.forEach((listener) => listener());
}

export function getDirection(): Direction {
  return currentLanguage === 'he' ? 'rtl' : 'ltr';
}

export function isRTL(): boolean {
  return currentLanguage === 'he';
}

function applyDirection(): void {
  const dir = getDirection();
  document.documentElement.dir = dir;
  document.documentElement.lang = currentLanguage;
}

export function subscribeToLanguageChange(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function t(key: TranslationKey): string {
  const keys = key.split('.');
  let value: unknown = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

// Translate type name for display (English stored in DB -> localized display)
export function translateTypeName(englishName: string): string {
  const translation = TYPE_TRANSLATIONS[englishName];
  if (translation) {
    return translation[currentLanguage];
  }
  // If no predefined translation, return as-is
  return englishName;
}

// Register a custom type translation (for user-created types)
export function registerTypeTranslation(
  englishName: string,
  translations: Record<Language, string>
): void {
  TYPE_TRANSLATIONS[englishName] = translations;
}

// Get all registered type translations
export function getTypeTranslations(): Record<string, Record<Language, string>> {
  return { ...TYPE_TRANSLATIONS };
}

// Format date according to current locale
export function formatLocalizedDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = currentLanguage === 'he' ? 'he-IL' : 'en-US';
  return date.toLocaleDateString(locale, options);
}

// Format time according to current locale
export function formatLocalizedTime(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = currentLanguage === 'he' ? 'he-IL' : 'en-US';
  return date.toLocaleTimeString(locale, options);
}

// Pluralization helper
export function plural(count: number, singular: string, plural: string): string {
  // Hebrew uses different plural rules, but for simplicity we use count-based
  return count === 1 ? singular : plural;
}

// Get localized address based on current language
export function getLocalizedAddress(
  address: string | null,
  address_he: string | null
): string | null {
  if (currentLanguage === 'he') {
    return address_he || address; // Fallback to English if Hebrew not available
  }
  return address;
}

// Format address for display (shorter version: street, city, postcode)
export function formatAddressForDisplay(fullAddress: string | null): string | null {
  if (!fullAddress) return null;

  // Split by comma and take first 3 meaningful parts
  const parts = fullAddress.split(',').map(p => p.trim());

  // Usually: street, neighborhood/area, city, district, postcode, country
  // We want: street, city, postcode (approximately first 3 parts)
  const shortParts = parts.slice(0, 3);

  return shortParts.join(', ');
}

// Get localized and formatted address for display
export function getDisplayAddress(
  address: string | null,
  address_he: string | null
): string | null {
  const localized = getLocalizedAddress(address, address_he);
  return formatAddressForDisplay(localized);
}
