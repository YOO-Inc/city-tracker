import { createClient } from '@supabase/supabase-js';
import type { StructuredAddress } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export async function uploadPhoto(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const now = new Date();
  const utcDate = now.toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';
  const fileName = `${utcDate}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from('photos')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading photo:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export interface CreateEntryData {
  type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  // Display addresses
  address: string | null;
  address_he: string | null;
  // Structured addresses (optional, will be flattened for DB)
  address_en_structured?: StructuredAddress | null;
  address_he_structured?: StructuredAddress | null;
  // Photos
  photo_urls: string[];
}

export async function createEntry(entry: CreateEntryData) {
  // Flatten structured addresses to individual columns
  const dbEntry: Record<string, unknown> = {
    type: entry.type,
    description: entry.description,
    latitude: entry.latitude,
    longitude: entry.longitude,
    address: entry.address,
    address_he: entry.address_he,
    photo_urls: entry.photo_urls,
  };

  // Add EN structured address fields
  if (entry.address_en_structured) {
    const en = entry.address_en_structured;
    dbEntry.house_number_en = en.house_number;
    dbEntry.street_en = en.street;
    dbEntry.neighborhood_en = en.neighborhood;
    dbEntry.city_en = en.city;
    dbEntry.county_en = en.county;
    dbEntry.state_en = en.state;
    dbEntry.postcode_en = en.postcode;
    dbEntry.country_en = en.country;
    dbEntry.country_code = en.country_code;
  }

  // Add HE structured address fields
  if (entry.address_he_structured) {
    const he = entry.address_he_structured;
    dbEntry.house_number_he = he.house_number;
    dbEntry.street_he = he.street;
    dbEntry.neighborhood_he = he.neighborhood;
    dbEntry.city_he = he.city;
    dbEntry.county_he = he.county;
    dbEntry.state_he = he.state;
    dbEntry.postcode_he = he.postcode;
    dbEntry.country_he = he.country;
  }

  const { data, error } = await supabase
    .from('entries')
    .insert([dbEntry])
    .select()
    .single();

  if (error) {
    console.error('Error creating entry:', error);
    throw error;
  }

  return data;
}
