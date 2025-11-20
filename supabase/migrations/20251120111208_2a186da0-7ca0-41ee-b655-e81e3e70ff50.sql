-- Create workspace automation rules table
CREATE TABLE public.workspace_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  rule_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('file_upload', 'deadline_approaching', 'content_age', 'task_complete', 'tag_added')),
  trigger_config JSONB DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL CHECK (action_type IN ('auto_tag', 'send_notification', 'archive_content', 'create_task', 'update_status')),
  action_config JSONB DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_triggered TIMESTAMP WITH TIME ZONE
);

-- Create marketplace templates table
CREATE TABLE public.marketplace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#3b82f6',
  template_data JSONB NOT NULL,
  author_id UUID NOT NULL,
  author_name TEXT,
  is_published BOOLEAN DEFAULT false,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template ratings table
CREATE TABLE public.template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.marketplace_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Create collaborative editing sessions table
CREATE TABLE public.collaborative_editing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  active_users JSONB DEFAULT '[]'::jsonb,
  current_content TEXT,
  version INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create editing operations log for CRDT
CREATE TABLE public.editing_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.collaborative_editing_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('insert', 'delete', 'replace')),
  position INTEGER NOT NULL,
  content TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspace_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_editing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editing_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_automation_rules
CREATE POLICY "Workspace members can view automation rules"
ON public.workspace_automation_rules FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace owners can manage automation rules"
ON public.workspace_automation_rules FOR ALL
USING (public.get_workspace_role(workspace_id, auth.uid()) IN ('owner', 'editor'));

-- RLS Policies for marketplace_templates
CREATE POLICY "Anyone can view published templates"
ON public.marketplace_templates FOR SELECT
USING (is_published = true OR author_id = auth.uid());

CREATE POLICY "Users can create templates"
ON public.marketplace_templates FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can manage their templates"
ON public.marketplace_templates FOR ALL
USING (auth.uid() = author_id);

-- RLS Policies for template_ratings
CREATE POLICY "Anyone can view ratings"
ON public.template_ratings FOR SELECT
USING (true);

CREATE POLICY "Users can rate templates"
ON public.template_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ratings"
ON public.template_ratings FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for collaborative_editing_sessions
CREATE POLICY "Workspace members can view editing sessions"
ON public.collaborative_editing_sessions FOR SELECT
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can manage editing sessions"
ON public.collaborative_editing_sessions FOR ALL
USING (public.is_workspace_member(workspace_id, auth.uid()));

-- RLS Policies for editing_operations
CREATE POLICY "Session participants can view operations"
ON public.editing_operations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.collaborative_editing_sessions
    WHERE collaborative_editing_sessions.id = editing_operations.session_id
    AND public.is_workspace_member(collaborative_editing_sessions.workspace_id, auth.uid())
  )
);

CREATE POLICY "Session participants can create operations"
ON public.editing_operations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_automation_rules_workspace ON public.workspace_automation_rules(workspace_id);
CREATE INDEX idx_automation_rules_enabled ON public.workspace_automation_rules(is_enabled);
CREATE INDEX idx_marketplace_templates_published ON public.marketplace_templates(is_published);
CREATE INDEX idx_marketplace_templates_category ON public.marketplace_templates(category);
CREATE INDEX idx_template_ratings_template ON public.template_ratings(template_id);
CREATE INDEX idx_editing_sessions_note ON public.collaborative_editing_sessions(note_id);
CREATE INDEX idx_editing_sessions_workspace ON public.collaborative_editing_sessions(workspace_id);
CREATE INDEX idx_editing_operations_session ON public.editing_operations(session_id);
CREATE INDEX idx_editing_operations_timestamp ON public.editing_operations(timestamp);

-- Function to update template rating average
CREATE OR REPLACE FUNCTION public.update_template_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.marketplace_templates
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.template_ratings
    WHERE template_id = NEW.template_id
  )
  WHERE id = NEW.template_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update template rating
CREATE TRIGGER update_template_rating_trigger
AFTER INSERT OR UPDATE ON public.template_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_template_rating();

-- Enable realtime for collaborative editing
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborative_editing_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.editing_operations;