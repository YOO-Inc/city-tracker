-- Create photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to photos
CREATE POLICY "Public read access for photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow authenticated and anonymous uploads
CREATE POLICY "Allow uploads to photos bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos');

-- Allow delete from photos bucket
CREATE POLICY "Allow delete from photos bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos');
