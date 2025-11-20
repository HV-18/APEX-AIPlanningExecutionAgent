-- Meal tracking and budget management
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  cost DECIMAL(10,2),
  calories INTEGER,
  nutrition_score TEXT CHECK (nutrition_score IN ('A', 'B', 'C', 'D', 'F')),
  is_sustainable BOOLEAN DEFAULT false,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meals"
  ON public.meals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Budget tracking
CREATE TABLE public.budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('food', 'transport', 'books', 'health', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_sustainable BOOLEAN DEFAULT false,
  carbon_impact DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budget"
  ON public.budget_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transport tracking for sustainability
CREATE TABLE public.transport_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('walk', 'bike', 'bus', 'train', 'car', 'rideshare', 'scooter')),
  distance_km DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  co2_saved DECIMAL(10,2),
  duration_minutes INTEGER,
  destination TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transport_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transport logs"
  ON public.transport_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Project-based learning tracker
CREATE TABLE public.learning_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  real_world_problem TEXT,
  impact_goal TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  skills_learned TEXT[],
  resources TEXT[],
  collaborators TEXT[],
  completed BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.learning_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON public.learning_projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Health goals and interventions
CREATE TABLE public.health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('exercise', 'sleep', 'hydration', 'mental_health', 'nutrition')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT NOT NULL,
  streak_days INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own health goals"
  ON public.health_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wellness interventions and reminders
CREATE TABLE public.wellness_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('break', 'exercise', 'meditation', 'hydration', 'social', 'fresh_air')),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  completed BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.wellness_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interventions"
  ON public.wellness_interventions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);