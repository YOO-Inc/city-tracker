const LAST_ENTRY_TYPE_KEY = 'lastEntryType';
const ENTRY_TYPES_KEY = 'entryTypes';

const DEFAULT_ENTRY_TYPES = ['Electricity Board', 'Billboard'];

export function getLastEntryType(): string | null {
  try {
    return localStorage.getItem(LAST_ENTRY_TYPE_KEY);
  } catch {
    return null;
  }
}

export function setLastEntryType(type: string): void {
  try {
    localStorage.setItem(LAST_ENTRY_TYPE_KEY, type);
  } catch {
    console.warn('Could not save to localStorage');
  }
}

export function getEntryTypes(): string[] {
  try {
    const stored = localStorage.getItem(ENTRY_TYPES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.warn('Could not read from localStorage');
  }
  return DEFAULT_ENTRY_TYPES;
}

export function setEntryTypes(types: string[]): void {
  try {
    localStorage.setItem(ENTRY_TYPES_KEY, JSON.stringify(types));
  } catch {
    console.warn('Could not save to localStorage');
  }
}
