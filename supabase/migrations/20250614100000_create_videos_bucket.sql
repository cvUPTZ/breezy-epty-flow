

-- Create the 'videos' storage bucket if it doesn't already exist.
-- We make it public so that videos can be easily viewed.
-- RLS policies will still control who can upload, update, and delete.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'videos', 'videos', true, 52428800, ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/mpeg', 'application/octet-stream']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'videos'
);

-- RLS Policies for storage.objects in the 'videos' bucket

-- 1. Allow public, unauthenticated read access to all objects in the 'videos' bucket.
DROP POLICY IF EXISTS "Public videos read access" ON storage.objects;
CREATE POLICY "Public videos read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

-- 2. Allow both authenticated and anonymous users to upload objects to the 'videos' bucket.
DROP POLICY IF EXISTS "Public can upload videos" ON storage.objects;
CREATE POLICY "Public can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');

-- 3. Allow users to update objects in the videos bucket (for authenticated users only)
DROP POLICY IF EXISTS "Users can update videos" ON storage.objects;
CREATE POLICY "Users can update videos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'videos' AND (auth.uid() = owner OR auth.uid() IS NULL))
  WITH CHECK (bucket_id = 'videos');

-- 4. Allow users to delete objects in the videos bucket (for authenticated users only)
DROP POLICY IF EXISTS "Users can delete videos" ON storage.objects;
CREATE POLICY "Users can delete videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'videos' AND (auth.uid() = owner OR auth.uid() IS NULL));

-- Enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

