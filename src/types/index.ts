export interface Entry {
  id: string;
  type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  photo_urls: string[];
  created_at: string;
}

export interface EntryType {
  id: string;
  name: string;
  created_at: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string | null;
}

export type Screen = 'home' | 'add';

export interface SnackbarState {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
}
