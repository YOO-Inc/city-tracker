const LAST_ENTRY_TYPE_KEY = 'lastEntryType';
const ENTRY_TYPES_KEY = 'entryTypes';

export interface EntryTypeConfig {
  name: string;
  color: string;
}

export const TYPE_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F97316', label: 'Orange' },
];

const DEFAULT_ENTRY_TYPES: EntryTypeConfig[] = [
  { name: 'Electricity Board', color: '#3B82F6' },
  { name: 'Billboard', color: '#F59E0B' },
];

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

export function getEntryTypes(): EntryTypeConfig[] {
  try {
    const stored = localStorage.getItem(ENTRY_TYPES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration: handle old string[] format
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'string') {
          return parsed.map((name: string, i: number) => ({
            name,
            color: TYPE_COLORS[i % TYPE_COLORS.length].value,
          }));
        }
        return parsed;
      }
    }
  } catch {
    console.warn('Could not read from localStorage');
  }
  return DEFAULT_ENTRY_TYPES;
}

export function setEntryTypes(types: EntryTypeConfig[]): void {
  try {
    localStorage.setItem(ENTRY_TYPES_KEY, JSON.stringify(types));
  } catch {
    console.warn('Could not save to localStorage');
  }
}

export function getTypeColor(typeName: string): string {
  const types = getEntryTypes();
  const found = types.find((t) => t.name === typeName);
  return found?.color ?? '#6B7280'; // gray fallback
}
