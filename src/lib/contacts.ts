export interface Contact {
  id: string;
  name: string;
  email: string;
}

const CONTACTS_STORAGE_KEY = 'shareContacts';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
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
        typeof c.email === 'string'
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

export function addContact(name: string, email: string): Contact {
  const contact: Contact = {
    id: generateId(),
    name: name.trim(),
    email: email.trim(),
  };
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

const DEFAULT_CONTACTS: Array<{ name: string; email: string }> = [
  { name: 'איגור', email: 'igor.yaa@netanya.muni.il' },
];

export function seedDefaultContactsIfNeeded(): void {
  if (Date.now() >= SEED_CUTOFF.getTime()) return;
  try {
    if (localStorage.getItem(DEFAULT_CONTACTS_SEEDED_KEY)) return;
    const existingEmails = new Set(
      getContacts().map((c) => c.email.toLowerCase())
    );
    for (const c of DEFAULT_CONTACTS) {
      if (!existingEmails.has(c.email.toLowerCase())) {
        addContact(c.name, c.email);
      }
    }
    localStorage.setItem(DEFAULT_CONTACTS_SEEDED_KEY, '1');
  } catch {
    // localStorage not available
  }
}
