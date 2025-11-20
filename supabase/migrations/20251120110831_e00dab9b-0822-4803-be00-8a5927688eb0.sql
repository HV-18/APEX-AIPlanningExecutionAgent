-- Create workspace tags table
CREATE TABLE public.workspace_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(workspace_id, name)
);

-- Create content tags junction table
CREATE TABLE public.content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID REFERENCES public.workspace_tags(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('note', 'file', 'project', 'event')),
  content_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create version history table
CREATE TABLE public.workspace_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  changed_by UUID NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity timeline table
CREATE TABLE public.workspace_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workspace integrations table
CREATE TABLE public.workspace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('github', 'google_drive', 'dropbox')),
  is_enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workspace_id, integration_type)
);

-- Create dashboard widgets table
CREATE TABLE public.workspace_dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  widget_type TEXT NOT NULL,
  widget_config JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspace_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_tags
CREATE POLICY "Workspace members can view tags"
ON public.workspace_tags FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can create tags"
ON public.workspace_tags FOR INSERT
WITH CHECK (
  public.is_workspace_member(workspace_id, auth.uid()) AND
  auth.uid() = created_by
);

CREATE POLICY "Workspace members can manage tags"
ON public.workspace_tags FOR ALL
USING (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'editor'));

-- RLS Policies for content_tags
CREATE POLICY "Workspace members can view content tags"
ON public.content_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_tags
    WHERE workspace_tags.id = content_tags.tag_id
    AND public.is_workspace_member(workspace_tags.workspace_id, auth.uid())
  )
);

CREATE POLICY "Workspace members can manage content tags"
ON public.content_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_tags
    WHERE workspace_tags.id = content_tags.tag_id
    AND public.get_workspace_role(workspace_tags.workspace_id, auth.uid()) IN ('owner', 'editor')
  )
);

-- RLS Policies for workspace_versions
CREATE POLICY "Workspace members can view versions"
ON public.workspace_versions FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can create versions"
ON public.workspace_versions FOR INSERT
WITH CHECK (
  public.is_workspace_member(workspace_id, auth.uid()) AND
  auth.uid() = changed_by
);

-- RLS Policies for workspace_activities
CREATE POLICY "Workspace members can view activities"
ON public.workspace_activities FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can create activities"
ON public.workspace_activities FOR INSERT
WITH CHECK (
  public.is_workspace_member(workspace_id, auth.uid()) AND
  auth.uid() = user_id
);

-- RLS Policies for workspace_integrations
CREATE POLICY "Workspace owners can manage integrations"
ON public.workspace_integrations FOR ALL
USING (public.get_workspace_role(workspace_id, auth.uid()) = 'owner');

CREATE POLICY "Workspace members can view integrations"
ON public.workspace_integrations FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

-- RLS Policies for workspace_dashboard_widgets
CREATE POLICY "Users can manage their own widgets"
ON public.workspace_dashboard_widgets FOR ALL
USING (
  auth.uid() = user_id AND
  public.is_workspace_member(workspace_id, auth.uid())
);

-- Create indexes
CREATE INDEX idx_workspace_tags_workspace ON public.workspace_tags(workspace_id);
CREATE INDEX idx_content_tags_tag ON public.content_tags(tag_id);
CREATE INDEX idx_content_tags_content ON public.content_tags(content_type, content_id);
CREATE INDEX idx_workspace_versions_workspace ON public.workspace_versions(workspace_id);
CREATE INDEX idx_workspace_versions_content ON public.workspace_versions(content_type, content_id);
CREATE INDEX idx_workspace_activities_workspace ON public.workspace_activities(workspace_id);
CREATE INDEX idx_workspace_activities_created ON public.workspace_activities(created_at DESC);
CREATE INDEX idx_workspace_integrations_workspace ON public.workspace_integrations(workspace_id);
CREATE INDEX idx_dashboard_widgets_workspace_user ON public.workspace_dashboard_widgets(workspace_id, user_id);

-- Function to create activity log
CREATE OR REPLACE FUNCTION public.log_workspace_activity(
  p_workspace_id UUID,
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id UUID;
  v_user_name TEXT;
BEGIN
  -- Get user name from profiles
  SELECT full_name INTO v_user_name
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Insert activity
  INSERT INTO public.workspace_activities (
    workspace_id,
    user_id,
    user_name,
    activity_type,
    activity_description,
    metadata
  ) VALUES (
    p_workspace_id,
    p_user_id,
    COALESCE(v_user_name, 'Unknown User'),
    p_activity_type,
    p_activity_description,
    p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;