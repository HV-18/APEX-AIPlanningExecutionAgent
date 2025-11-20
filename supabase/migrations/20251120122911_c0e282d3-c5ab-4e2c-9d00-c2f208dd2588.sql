-- Create reactions table for live feedback
CREATE TABLE IF NOT EXISTS public.room_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '10 seconds')
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.room_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER
);

-- Create collaborative code sessions table
CREATE TABLE IF NOT EXISTS public.code_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  code_content TEXT DEFAULT '',
  language TEXT DEFAULT 'javascript',
  last_edited_by UUID,
  last_edited_by_name TEXT,
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  version INTEGER DEFAULT 1
);

-- Create breakout rooms table
CREATE TABLE IF NOT EXISTS public.breakout_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  room_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create breakout room assignments table
CREATE TABLE IF NOT EXISTS public.breakout_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breakout_room_id UUID NOT NULL REFERENCES public.breakout_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breakout_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breakout_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for room_reactions
CREATE POLICY "Room participants can send reactions"
ON public.room_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = room_reactions.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "Room participants can view reactions"
ON public.room_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = room_reactions.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

-- RLS Policies for room_attendance
CREATE POLICY "Room participants can create attendance"
ON public.room_attendance
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Room participants can view attendance"
ON public.room_attendance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = room_attendance.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "Users can update their attendance"
ON public.room_attendance
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for code_sessions
CREATE POLICY "Room participants can manage code sessions"
ON public.code_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = code_sessions.room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

-- RLS Policies for breakout_rooms
CREATE POLICY "Room participants can view breakout rooms"
ON public.breakout_rooms
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = breakout_rooms.parent_room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "Room participants can create breakout rooms"
ON public.breakout_rooms
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = breakout_rooms.parent_room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

CREATE POLICY "Room participants can update breakout rooms"
ON public.breakout_rooms
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = breakout_rooms.parent_room_id
    AND user_id = auth.uid()
    AND is_active = true
  )
);

-- RLS Policies for breakout_assignments
CREATE POLICY "Room participants can view breakout assignments"
ON public.breakout_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.breakout_rooms br
    JOIN public.room_participants rp ON rp.room_id = br.parent_room_id
    WHERE br.id = breakout_assignments.breakout_room_id
    AND rp.user_id = auth.uid()
    AND rp.is_active = true
  )
);

CREATE POLICY "Room participants can manage breakout assignments"
ON public.breakout_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.breakout_rooms br
    JOIN public.room_participants rp ON rp.room_id = br.parent_room_id
    WHERE br.id = breakout_assignments.breakout_room_id
    AND rp.user_id = auth.uid()
    AND rp.is_active = true
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.code_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.breakout_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.breakout_assignments;

-- Create index for cleaning up expired reactions
CREATE INDEX idx_reactions_expires_at ON public.room_reactions(expires_at);

-- Function to clean up expired reactions
CREATE OR REPLACE FUNCTION public.cleanup_expired_reactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.room_reactions
  WHERE expires_at < now();
END;
$$;