-- Create entries table for storing city tracker entries
CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  address TEXT,
  address_he TEXT,
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
