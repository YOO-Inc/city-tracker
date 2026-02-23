-- Create entries table for storing city tracker entries
CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  -- Display addresses (full string from Nominatim)
  address TEXT,
  address_he TEXT,
  -- Structured address fields (English)
  house_number_en TEXT,
  street_en TEXT,
  neighborhood_en TEXT,
  city_en TEXT,
  county_en TEXT,
  state_en TEXT,
  postcode_en TEXT,
  country_en TEXT,
  country_code TEXT,
  -- Structured address fields (Hebrew)
  house_number_he TEXT,
  street_he TEXT,
  neighborhood_he TEXT,
  city_he TEXT,
  county_he TEXT,
  state_he TEXT,
  postcode_he TEXT,
  country_he TEXT,
  -- Photos and timestamps
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Allow all operations (open access for MVP)
CREATE POLICY "Allow all operations" ON entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index on created_at for efficient sorting
CREATE INDEX entries_created_at_idx ON entries (created_at DESC);
