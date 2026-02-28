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

const LANGUAGE_STORAGE_KEY = 'language';

let currentLanguage: Language = 'he';
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

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
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

  let result = typeof value === 'string' ? value : key;

  // Replace parameters like {count} with actual values
  if (params) {
    for (const [param, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val));
    }
  }

  return result;
}

// Translate type name for display (English stored in DB -> localized display)
export function translateTypeName(englishName: string): string {
  const types = translations[currentLanguage].types as Record<string, string>;
  return types[englishName] ?? englishName;
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

export interface FormattedAddress {
  street: string | null;
  cityZip: string | null;
}

// Format address for display (street on line 1, city+zip on line 2)
export function formatAddressForDisplay(fullAddress: string | null): FormattedAddress {
  if (!fullAddress) return { street: null, cityZip: null };

  // Split by comma
  const parts = fullAddress.split(',').map(p => p.trim());

  // Usually: street, neighborhood/area, city, district, postcode, country
  // Line 1: street (first part)
  // Line 2: city + zip (parts 2-3 or similar)
  const street = parts[0] || null;

  // Find city and zip from remaining parts
  const remainingParts = parts.slice(1, 4).filter(Boolean);
  const cityZip = remainingParts.length > 0 ? remainingParts.join(', ') : null;

  return { street, cityZip };
}

// Get localized and formatted address for display
export function getDisplayAddress(
  address: string | null,
  address_he: string | null
): FormattedAddress {
  const localized = getLocalizedAddress(address, address_he);
  return formatAddressForDisplay(localized);
}

// Get localized export success message with count
export function getExportSuccessMessage(count: number): string {
  const countLabel = count === 1 ? t('home.location') : t('home.locations');
  return t('settings.exportSuccess', { count, countLabel });
}

// Structured address fields interface (matches Entry type)
interface StructuredAddressFields {
  street_en: string | null;
  street_he: string | null;
  house_number_en: string | null;
  house_number_he: string | null;
  neighborhood_en: string | null;
  neighborhood_he: string | null;
  city_en: string | null;
  city_he: string | null;
}

// Get formatted address from structured fields (preferred method)
export function getEntryDisplayAddress(entry: StructuredAddressFields): FormattedAddress {
  const isHebrew = currentLanguage === 'he';

  const street = isHebrew ? entry.street_he : entry.street_en;
  const houseNumber = isHebrew ? entry.house_number_he : entry.house_number_en;
  const neighborhood = isHebrew ? entry.neighborhood_he : entry.neighborhood_en;
  const city = isHebrew ? entry.city_he : entry.city_en;

  // Build street line: "Street Name 123"
  const streetParts = [street, houseNumber].filter(Boolean);
  const streetLine = streetParts.length > 0 ? streetParts.join(' ') : null;

  // Build city line: "Neighborhood, City" or just "City"
  const cityParts = [neighborhood, city].filter(Boolean);
  const cityLine = cityParts.length > 0 ? cityParts.join(', ') : null;

  return { street: streetLine, cityZip: cityLine };
}

// Structured address from Nominatim (used by LocationData)
interface NominatimStructuredAddress {
  house_number: string | null;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
}

// Get formatted address from LocationData's structured address objects
export function getLocationDisplayAddress(
  addressEn: NominatimStructuredAddress | null,
  addressHe: NominatimStructuredAddress | null
): FormattedAddress {
  const isHebrew = currentLanguage === 'he';
  const addr = isHebrew ? (addressHe || addressEn) : addressEn;

  if (!addr) return { street: null, cityZip: null };

  // Build street line: "Street Name 123" or just "Street Name"
  const streetParts = [addr.street, addr.house_number].filter(Boolean);
  const streetLine = streetParts.length > 0 ? streetParts.join(' ') : null;

  // Build city line: "Neighborhood, City" or just "City"
  const cityParts = [addr.neighborhood, addr.city].filter(Boolean);
  const cityLine = cityParts.length > 0 ? cityParts.join(', ') : null;

  return { street: streetLine, cityZip: cityLine };
}
