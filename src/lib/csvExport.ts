import { supabase } from './supabase';
import { t, translateTypeName } from './i18n';
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
 * Hebrew-accessible format with translated headers and values
 */
export function generateCSV(entries: Entry[]): string {
  const headers = [
    'סוג',           // Type
    'תאריך',         // Date
    'שעה',           // Time
    'קו רוחב',       // Latitude
    'קו אורך',       // Longitude
    'קישור למפה',    // Google Maps Link
    'רחוב',          // Street
    'מספר בית',      // House Number
    'שכונה',         // Neighborhood
    'עיר',           // City
    'מיקוד',         // Postcode
    'כתובת מלאה',    // Full Address
    'מספר תמונות',   // Photo Count
    'קישורי תמונות', // Photo URLs
  ];

  const rows = entries.map(entry => {
    // Parse and format date/time in Hebrew locale
    const createdDate = new Date(entry.created_at);
    const dateStr = createdDate.toLocaleDateString('he-IL');
    const timeStr = createdDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    // Generate Google Maps link
    const mapsLink = entry.latitude && entry.longitude
      ? `https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`
      : '';

    return [
      // Type (translated to Hebrew)
      escapeCSVValue(translateTypeName(entry.type)),
      // Date and Time
      escapeCSVValue(dateStr),
      escapeCSVValue(timeStr),
      // Location coordinates
      entry.latitude,
      entry.longitude,
      escapeCSVValue(mapsLink),
      // Hebrew address fields
      escapeCSVValue(entry.street_he),
      escapeCSVValue(entry.house_number_he),
      escapeCSVValue(entry.neighborhood_he),
      escapeCSVValue(entry.city_he),
      escapeCSVValue(entry.postcode_he),
      escapeCSVValue(entry.address_he),
      // Photos
      entry.photo_urls?.length || 0,
      escapeCSVValue(entry.photo_urls?.join(';')),
    ].join(',');
  });

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
