// Structured address fields from Nominatim API
export interface StructuredAddress {
  house_number: string | null;
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  country_code: string | null;
}

export interface Entry {
  id: string;
  type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  // Display addresses (display_name from Nominatim)
  address: string | null;
  address_he: string | null;
  // Structured EN address fields
  house_number_en: string | null;
  street_en: string | null;
  neighborhood_en: string | null;
  city_en: string | null;
  county_en: string | null;
  state_en: string | null;
  postcode_en: string | null;
  country_en: string | null;
  country_code: string | null;
  // Structured HE address fields
  house_number_he: string | null;
  street_he: string | null;
  neighborhood_he: string | null;
  city_he: string | null;
  county_he: string | null;
  state_he: string | null;
  postcode_he: string | null;
  country_he: string | null;
  // Other fields
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
  // Display addresses
  address: string | null;
  address_he: string | null;
  // Structured addresses
  address_en_structured: StructuredAddress | null;
  address_he_structured: StructuredAddress | null;
}

export type Screen = 'home' | 'add' | 'entries' | 'settings';

export interface SnackbarState {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
}
