-- Collaborative Study Rooms
CREATE TABLE public.study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  max_participants INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active study rooms"
  ON public.study_rooms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create study rooms"
  ON public.study_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can manage their rooms"
  ON public.study_rooms FOR ALL
  USING (auth.uid() = created_by);

-- Room Participants
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room participants"
  ON public.room_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join rooms"
  ON public.room_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their participation"
  ON public.room_participants FOR ALL
  USING (auth.uid() = user_id);

-- Shared Notes
CREATE TABLE public.room_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.room_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room participants can view notes"
  ON public.room_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = room_notes.room_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Room participants can create notes"
  ON public.room_notes FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = room_notes.room_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Note creators can update their notes"
  ON public.room_notes FOR UPDATE
  USING (auth.uid() = created_by);

-- Group Tasks
CREATE TABLE public.room_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID,
  assigned_to_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.room_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room participants can view tasks"
  ON public.room_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = room_tasks.room_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Room participants can manage tasks"
  ON public.room_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = room_tasks.room_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- Pomodoro Sessions
CREATE TABLE public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  break_minutes INTEGER NOT NULL DEFAULT 5,
  completed BOOLEAN DEFAULT false,
  focus_topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pomodoro sessions"
  ON public.pomodoro_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_tasks;