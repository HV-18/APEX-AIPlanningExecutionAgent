-- Whiteboard drawings storage
CREATE TABLE public.whiteboard_strokes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  stroke_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.whiteboard_strokes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room participants can view strokes"
  ON public.whiteboard_strokes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = whiteboard_strokes.room_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Room participants can add strokes"
  ON public.whiteboard_strokes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = whiteboard_strokes.room_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- WebRTC signaling for voice chat
CREATE TABLE public.voice_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.voice_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room participants can view signals"
  ON public.voice_signals FOR SELECT
  USING (
    auth.uid() = to_user_id OR auth.uid() = from_user_id
  );

CREATE POLICY "Room participants can send signals"
  ON public.voice_signals FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Meal planner
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name TEXT NOT NULL,
  calories INTEGER,
  cost DECIMAL(10,2),
  is_sustainable BOOLEAN DEFAULT true,
  ingredients TEXT[],
  recipe_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start, day_of_week, meal_type)
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON public.meal_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wellness reports
CREATE TABLE public.wellness_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_date DATE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly')),
  pomodoro_count INTEGER DEFAULT 0,
  study_minutes INTEGER DEFAULT 0,
  avg_mood_score DECIMAL(3,2),
  meals_logged INTEGER DEFAULT 0,
  avg_nutrition_score TEXT,
  sustainability_score INTEGER DEFAULT 0,
  recommendations TEXT[],
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, report_date, report_type)
);

ALTER TABLE public.wellness_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.wellness_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON public.wellness_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for new features
ALTER PUBLICATION supabase_realtime ADD TABLE public.whiteboard_strokes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_signals;