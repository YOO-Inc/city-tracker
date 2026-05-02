export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const CONTACTS_STORAGE_KEY = 'shareContacts';
const DEFAULT_COUNTRY_CODE = '972';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7;
}

// Normalize a user-entered phone for use in wa.me URLs (international, no +).
// Heuristic: strip non-digits, drop leading + or 00, and treat a leading 0 as
// an Israeli local number (the app is Hebrew-first).
export function normalizePhoneForWhatsApp(phone: string): string {
  let digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    digits = digits.slice(1);
  } else if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  }
  return digits.replace(/\D/g, '');
}

export function getContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Contact =>
        c &&
        typeof c.id === 'string' &&
        typeof c.name === 'string' &&
        (typeof c.email === 'string' || typeof c.phone === 'string')
    );
  } catch {
    return [];
  }
}

function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    console.warn('Could not save contacts to localStorage');
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function addContact(name: string, email?: string, phone?: string): Contact {
  const contact: Contact = {
    id: generateId(),
    name: name.trim(),
  };
  const trimmedEmail = email?.trim();
  const trimmedPhone = phone?.trim();
  if (trimmedEmail) contact.email = trimmedEmail;
  if (trimmedPhone) contact.phone = trimmedPhone;
  const contacts = getContacts();
  contacts.push(contact);
  saveContacts(contacts);
  return contact;
}

export function removeContact(id: string): void {
  const contacts = getContacts().filter((c) => c.id !== id);
  saveContacts(contacts);
}

const DEFAULT_CONTACTS_SEEDED_KEY = 'defaultContactsSeeded_v1';
const SEED_CUTOFF = new Date('2026-04-30T00:00:00');

const DEFAULT_CONTACTS: Array<{ name: string; email?: string; phone?: string }> = [
  { name: 'איגור', email: 'igor.yaa@netanya.muni.il' },
];

export function seedDefaultContactsIfNeeded(): void {
  if (Date.now() >= SEED_CUTOFF.getTime()) return;
  try {
    if (localStorage.getItem(DEFAULT_CONTACTS_SEEDED_KEY)) return;
    const existing = getContacts();
    const existingEmails = new Set(
      existing.map((c) => c.email?.toLowerCase()).filter(Boolean) as string[]
    );
    for (const c of DEFAULT_CONTACTS) {
      const emailKey = c.email?.toLowerCase();
      if (emailKey && existingEmails.has(emailKey)) continue;
      addContact(c.name, c.email, c.phone);
    }
    localStorage.setItem(DEFAULT_CONTACTS_SEEDED_KEY, '1');
  } catch {
    // localStorage not available
  }
}
