-- Create room_messages table for text chat
CREATE TABLE IF NOT EXISTS public.room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Room participants can send messages
CREATE POLICY "Room participants can send messages"
ON public.room_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = room_messages.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

-- Room participants can view messages
CREATE POLICY "Room participants can view messages"
ON public.room_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = room_messages.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

-- Enable realtime for room_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;