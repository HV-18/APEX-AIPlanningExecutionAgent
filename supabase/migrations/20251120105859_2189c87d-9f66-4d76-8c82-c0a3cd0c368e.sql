-- Create workspace members table for collaboration
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create workspace templates table
CREATE TABLE public.workspace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#3b82f6',
  is_public BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  template_data JSONB DEFAULT '{}'::jsonb
);

-- Create workspace files table
CREATE TABLE public.workspace_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for workspace files
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-files', 'workspace-files', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

-- Create function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = user_uuid
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_uuid
    AND user_id = user_uuid
  );
$$;

-- Create function to check workspace role
CREATE OR REPLACE FUNCTION public.get_workspace_role(workspace_uuid UUID, user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_uuid AND user_id = user_uuid) THEN 'owner'
    ELSE (SELECT role FROM public.workspace_members WHERE workspace_id = workspace_uuid AND user_id = user_uuid)
  END;
$$;

-- RLS Policies for workspace_members
CREATE POLICY "Users can view workspace members if they have access"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace owners can manage members"
ON public.workspace_members FOR ALL
USING (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'editor'));

-- RLS Policies for workspace_templates
CREATE POLICY "Anyone can view public templates"
ON public.workspace_templates FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates"
ON public.workspace_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can manage own templates"
ON public.workspace_templates FOR ALL
USING (auth.uid() = created_by);

-- RLS Policies for workspace_files
CREATE POLICY "Workspace members can view files"
ON public.workspace_files FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can upload files"
ON public.workspace_files FOR INSERT
WITH CHECK (
  public.is_workspace_member(workspace_id, auth.uid()) AND
  auth.uid() = user_id
);

CREATE POLICY "File uploaders can delete their files"
ON public.workspace_files FOR DELETE
USING (auth.uid() = user_id OR public.get_workspace_role(workspace_id, auth.uid()) = 'owner');

-- Storage policies for workspace files
CREATE POLICY "Workspace members can view files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'workspace-files' AND
  public.is_workspace_member(
    (storage.foldername(name))[1]::uuid,
    auth.uid()
  )
);

CREATE POLICY "Workspace members can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'workspace-files' AND
  public.is_workspace_member(
    (storage.foldername(name))[1]::uuid,
    auth.uid()
  )
);

CREATE POLICY "File uploaders can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'workspace-files' AND
  (
    auth.uid()::text = (storage.foldername(name))[2] OR
    public.get_workspace_role(
      (storage.foldername(name))[1]::uuid,
      auth.uid()
    ) = 'owner'
  )
);

-- Update RLS policies for workspace-related tables to support sharing
DROP POLICY IF EXISTS "Users can manage own study sessions" ON public.study_sessions;
CREATE POLICY "Users can manage own study sessions"
ON public.study_sessions FOR ALL
USING (
  auth.uid() = user_id OR
  (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()))
);

DROP POLICY IF EXISTS "Users can manage own study notes" ON public.study_notes;
CREATE POLICY "Users can manage own study notes"
ON public.study_notes FOR ALL
USING (
  auth.uid() = user_id OR
  (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()))
);

DROP POLICY IF EXISTS "Users can manage own timetable" ON public.timetable_events;
CREATE POLICY "Users can manage own timetable"
ON public.timetable_events FOR ALL
USING (
  auth.uid() = user_id OR
  (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()))
);

DROP POLICY IF EXISTS "Users can manage own projects" ON public.learning_projects;
CREATE POLICY "Users can manage own projects"
ON public.learning_projects FOR ALL
USING (
  auth.uid() = user_id OR
  (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()))
);

DROP POLICY IF EXISTS "Users can manage own quizzes" ON public.custom_quizzes;
CREATE POLICY "Users can manage own quizzes"
ON public.custom_quizzes FOR ALL
USING (
  auth.uid() = user_id OR
  (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()))
);

-- Update workspaces table RLS to allow shared access
DROP POLICY IF EXISTS "Users can manage own workspaces" ON public.workspaces;
CREATE POLICY "Users can view accessible workspaces"
ON public.workspaces FOR SELECT
USING (
  auth.uid() = user_id OR
  public.is_workspace_member(id, auth.uid())
);

CREATE POLICY "Users can manage own workspaces"
ON public.workspaces FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_files_workspace ON public.workspace_files(workspace_id);
CREATE INDEX idx_workspace_templates_category ON public.workspace_templates(category);