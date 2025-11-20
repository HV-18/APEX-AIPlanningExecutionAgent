-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own workspaces"
ON public.workspaces
FOR ALL
USING (auth.uid() = user_id);

-- Create user_workspace_settings table to track active workspace
CREATE TABLE public.user_workspace_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  active_workspace_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (active_workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.user_workspace_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own workspace settings"
ON public.user_workspace_settings
FOR ALL
USING (auth.uid() = user_id);

-- Add workspace_id to existing tables
ALTER TABLE public.study_sessions ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.study_notes ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.timetable_events ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.learning_projects ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.custom_quizzes ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

-- Create function to handle workspace creation with default workspace
CREATE OR REPLACE FUNCTION public.create_default_workspace_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create default workspace
  INSERT INTO public.workspaces (user_id, name, description, icon)
  VALUES (NEW.id, 'Personal Study', 'Your default study workspace', '📚')
  RETURNING id INTO new_workspace_id;
  
  -- Set as active workspace
  INSERT INTO public.user_workspace_settings (user_id, active_workspace_id)
  VALUES (NEW.id, new_workspace_id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_user_created_workspace
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_workspace_for_user();

-- Create indexes for performance
CREATE INDEX idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX idx_study_sessions_workspace_id ON public.study_sessions(workspace_id);
CREATE INDEX idx_study_notes_workspace_id ON public.study_notes(workspace_id);
CREATE INDEX idx_timetable_events_workspace_id ON public.timetable_events(workspace_id);
CREATE INDEX idx_learning_projects_workspace_id ON public.learning_projects(workspace_id);
CREATE INDEX idx_custom_quizzes_workspace_id ON public.custom_quizzes(workspace_id);