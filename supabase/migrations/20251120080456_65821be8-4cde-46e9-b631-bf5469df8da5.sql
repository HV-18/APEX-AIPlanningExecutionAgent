-- Team Challenges tables
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  team_points INTEGER DEFAULT 0
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can manage teams"
  ON public.teams FOR UPDATE
  USING (auth.uid() = created_by);

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team members can leave"
  ON public.team_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE public.team_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('pomodoro', 'study', 'meals', 'sustainability')),
  target_value INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.team_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON public.team_challenges FOR SELECT
  USING (true);

CREATE TABLE public.team_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.team_challenges(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, challenge_id)
);

ALTER TABLE public.team_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenge progress"
  ON public.team_challenge_progress FOR SELECT
  USING (true);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('badge', 'level_up', 'challenge', 'achievement')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data JSONB
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Add some default team challenges
INSERT INTO public.team_challenges (title, description, challenge_type, target_value, bonus_points, start_date, end_date) VALUES
  ('Study Sprint', 'Complete 100 Pomodoro sessions as a team', 'pomodoro', 100, 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
  ('Knowledge Masters', 'Complete 50 study sessions together', 'study', 50, 400, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
  ('Healthy Team', 'Log 200 healthy meals collectively', 'meals', 200, 300, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
  ('Eco Warriors', 'Make 100 sustainable choices as a team', 'sustainability', 100, 350, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');