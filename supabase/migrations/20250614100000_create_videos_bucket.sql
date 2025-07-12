
-- Create the 'videos' storage bucket if it doesn't already exist.
-- We make it public so that videos can be easily viewed.
-- RLS policies will still control who can upload, update, and delete.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/mpeg', 'video/avi', 'video/mov', 'application/octet-stream']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'videos'
);

-- Update bucket settings if it already exists
UPDATE storage.buckets 
SET 
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/mpeg', 'video/avi', 'video/mov', 'application/octet-stream'],
  public = true
WHERE id = 'videos';

-- Enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public videos read access" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete videos" ON storage.objects;

-- 1. Allow public read access to all objects in the 'videos' bucket
CREATE POLICY "Public videos read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

-- 2. Allow anyone to upload to the 'videos' bucket (simplified policy)
CREATE POLICY "Public can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');

-- 3. Allow anyone to update objects in the 'videos' bucket
CREATE POLICY "Users can update videos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'videos')
  WITH CHECK (bucket_id = 'videos');

-- 4. Allow anyone to delete objects in the 'videos' bucket
CREATE POLICY "Users can delete videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'videos');
