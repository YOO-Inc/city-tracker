import { ENTRY_TYPES as TYPES } from '@/config/entryTypes';

// Re-export entry type utilities from config
export { ENTRY_TYPES, getTypeColor } from '@/config/entryTypes';
export type { EntryTypeConfig } from '@/config/entryTypes';

const LAST_ENTRY_TYPE_KEY = 'lastEntryType';

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

export function getEntryTypes() {
  return TYPES;
}

// Clean up old localStorage key (one-time migration)
try {
  localStorage.removeItem('entryTypes');
} catch {
  // Ignore
}
