-- Create storage bucket for room files
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-files', 'room-files', false);

-- Create room_files table to track uploads
CREATE TABLE IF NOT EXISTS public.room_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hand_raises table
CREATE TABLE IF NOT EXISTS public.hand_raises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'raised',
  raised_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID
);

-- Create session_recordings table
CREATE TABLE IF NOT EXISTS public.session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL,
  recorded_by_name TEXT NOT NULL,
  recording_path TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hand_raises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for room_files
CREATE POLICY "Room participants can upload files"
ON public.room_files
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = room_files.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "Room participants can view files"
ON public.room_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = room_files.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "File uploaders can delete their files"
ON public.room_files
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for hand_raises
CREATE POLICY "Room participants can raise hands"
ON public.hand_raises
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = hand_raises.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "Room participants can view hand raises"
ON public.hand_raises
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = hand_raises.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "Room participants can update hand raises"
ON public.hand_raises
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = hand_raises.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

-- RLS Policies for session_recordings
CREATE POLICY "Room participants can create recordings"
ON public.session_recordings
FOR INSERT
WITH CHECK (
  auth.uid() = recorded_by 
  AND EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = session_recordings.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "Room participants can view recordings"
ON public.session_recordings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = session_recordings.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

-- Storage RLS Policies for room-files bucket
CREATE POLICY "Room participants can upload files to bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'room-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Room participants can view files in bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'room-files');

CREATE POLICY "Users can delete their own files from bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'room-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hand_raises;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_recordings;