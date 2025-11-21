-- Add favorite workspaces tracking
CREATE TABLE IF NOT EXISTS public.workspace_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);

-- Enable RLS
ALTER TABLE public.workspace_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
  ON public.workspace_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.workspace_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.workspace_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Add age verification to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_favorites_user_id ON public.workspace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_favorites_workspace_id ON public.workspace_favorites(workspace_id);