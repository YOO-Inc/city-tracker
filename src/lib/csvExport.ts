import { supabase } from './supabase';
import { t } from './i18n';
import type { Entry } from '@/types';

interface ExportOptions {
  date?: string; // YYYY-MM-DD format for filtering
}

export interface DateWithCount {
  date: string;
  count: number;
}

/**
 * Fetch unique dates that have entries (for dropdown) with counts
 */
export async function fetchUniqueDates(): Promise<DateWithCount[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('created_at')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to fetch dates:', error);
    return [];
  }

  // Count entries per date (YYYY-MM-DD)
  const dateCounts = new Map<string, number>();
  for (const entry of data) {
    const date = entry.created_at.split('T')[0];
    dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
  }

  return Array.from(dateCounts.entries()).map(([date, count]) => ({ date, count }));
}

/**
 * Fetch entries for export, optionally filtered by date
 */
export async function fetchEntriesForExport(options: ExportOptions = {}): Promise<Entry[]> {
  let query = supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.date) {
    const startOfDay = `${options.date}T00:00:00.000Z`;
    const endOfDay = `${options.date}T23:59:59.999Z`;
    query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch entries:', error);
    throw error;
  }

  return data || [];
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV content from entries
 * Column order optimized for Hebrew readers
 */
export function generateCSV(entries: Entry[]): string {
  const headers = [
    // 1. Core fields
    'ID',
    'Type',
    'Description',
    'Created At',
    // 2. Location
    'Latitude',
    'Longitude',
    // 3. HE address fields (primary for Hebrew readers)
    'Street (HE)',
    'House Number (HE)',
    'Neighborhood (HE)',
    'City (HE)',
    'Postcode (HE)',
    'Display Address (HE)',
    // 4. Photos
    'Photo Count',
    'Photo URLs',
    // 5. EN address fields (secondary)
    'Street (EN)',
    'House Number (EN)',
    'Neighborhood (EN)',
    'City (EN)',
    'Postcode (EN)',
    'Display Address (EN)',
  ];

  const rows = entries.map(entry => [
    // 1. Core fields
    escapeCSVValue(entry.id),
    escapeCSVValue(entry.type),
    escapeCSVValue(entry.description),
    entry.created_at,
    // 2. Location
    entry.latitude,
    entry.longitude,
    // 3. HE address (primary)
    escapeCSVValue(entry.street_he),
    escapeCSVValue(entry.house_number_he),
    escapeCSVValue(entry.neighborhood_he),
    escapeCSVValue(entry.city_he),
    escapeCSVValue(entry.postcode_he),
    escapeCSVValue(entry.address_he),
    // 4. Photos
    entry.photo_urls?.length || 0,
    escapeCSVValue(entry.photo_urls?.join(';')),
    // 5. EN address (secondary)
    escapeCSVValue(entry.street_en),
    escapeCSVValue(entry.house_number_en),
    escapeCSVValue(entry.neighborhood_en),
    escapeCSVValue(entry.city_en),
    escapeCSVValue(entry.postcode_en),
    escapeCSVValue(entry.address),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger CSV file download in browser
 */
export function downloadCSV(content: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for export
 */
export function generateFilename(date?: string): string {
  const today = new Date().toISOString().split('T')[0];
  if (date) {
    return `city-tracker-${date}.csv`;
  }
  return `city-tracker-all-${today}.csv`;
}

/**
 * Format date for dropdown display
 */
export function formatDateOption(dateStr: string, count?: number): string {
  const date = new Date(dateStr + 'T12:00:00'); // Noon to avoid timezone issues
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(12, 0, 0, 0);

  let label: string;
  if (dateOnly.getTime() === today.getTime()) {
    label = t('entries.today');
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    label = t('entries.yesterday');
  } else {
    // Format as "Feb 20, 2026"
    label = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (count !== undefined) {
    return `${label} (${count} ${count === 1 ? t('home.location') : t('home.locations')})`;
  }
  return label;
}
