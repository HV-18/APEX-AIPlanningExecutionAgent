-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create table to track generated images
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  saved_to_notes BOOLEAN DEFAULT false,
  note_id UUID
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Users can view their own generated images
CREATE POLICY "Users can view their own generated images"
ON public.generated_images
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own generated images
CREATE POLICY "Users can create their own generated images"
ON public.generated_images
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own generated images
CREATE POLICY "Users can update their own generated images"
ON public.generated_images
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own generated images
CREATE POLICY "Users can delete their own generated images"
ON public.generated_images
FOR DELETE
USING (auth.uid() = user_id);

-- Storage policies for generated images
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view generated images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'generated-images');

CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'generated-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);