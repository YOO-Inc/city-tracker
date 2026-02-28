export interface EntryTypeConfig {
  name: string;
  color: string;
}

// Hardcoded entry types - these are the only available types
// Translations are in src/locales/en.json and he.json under "types"
export const ENTRY_TYPES: EntryTypeConfig[] = [
  { name: 'electricity_board', color: '#3B82F6' },
  { name: 'bus_stop', color: '#10B981' },
  { name: 'billboard', color: '#F59E0B' },
  { name: 'municipal_ad_board', color: '#8B5CF6' },
  { name: 'private_ad_board', color: '#EC4899' },
];

export function getTypeColor(typeName: string): string {
  const found = ENTRY_TYPES.find((t) => t.name === typeName);
  return found?.color ?? '#6B7280'; // gray fallback for legacy custom types
}
