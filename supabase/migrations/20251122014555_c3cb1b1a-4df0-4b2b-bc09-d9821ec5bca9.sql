-- Create storage bucket for meal photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-photos',
  'meal-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Meal photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own meal photos" ON storage.objects;

-- Create storage policies for meal photos
CREATE POLICY "Users can upload their own meal photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meal-photos'
);

CREATE POLICY "Meal photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meal-photos');

CREATE POLICY "Users can delete their own meal photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'meal-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);