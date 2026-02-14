import { createClient } from '@supabase/supabase-js';

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

export async function createEntry(entry: {
  type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  photo_urls: string[];
}) {
  const { data, error } = await supabase
    .from('entries')
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error('Error creating entry:', error);
    throw error;
  }

  return data;
}
