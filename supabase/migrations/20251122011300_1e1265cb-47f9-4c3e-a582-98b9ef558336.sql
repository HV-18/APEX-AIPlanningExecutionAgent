-- Fix search_path for all database functions to prevent search_path mutable warning

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student')
  );
  RETURN NEW;
END;
$function$;

-- Update create_default_workspace_for_user function
CREATE OR REPLACE FUNCTION public.create_default_workspace_for_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_workspace_id UUID;
BEGIN
  INSERT INTO public.workspaces (user_id, name, description, icon)
  VALUES (NEW.id, 'Personal Study', 'Your default study workspace', '📚')
  RETURNING id INTO new_workspace_id;
  
  INSERT INTO public.user_workspace_settings (user_id, active_workspace_id)
  VALUES (NEW.id, new_workspace_id);
  
  RETURN NEW;
END;
$function$;

-- Update is_workspace_member function  
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_uuid uuid, user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = user_uuid
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_uuid
    AND user_id = user_uuid
  );
$function$;

-- Update get_workspace_role function
CREATE OR REPLACE FUNCTION public.get_workspace_role(workspace_uuid uuid, user_uuid uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_uuid AND user_id = user_uuid) THEN 'owner'
    ELSE (SELECT role FROM public.workspace_members WHERE workspace_id = workspace_uuid AND user_id = user_uuid)
  END;
$function$;

-- Update log_workspace_activity function
CREATE OR REPLACE FUNCTION public.log_workspace_activity(p_workspace_id uuid, p_user_id uuid, p_activity_type text, p_activity_description text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_activity_id UUID;
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name
  FROM public.profiles
  WHERE id = p_user_id;
  
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
$function$;

-- Update update_template_rating function
CREATE OR REPLACE FUNCTION public.update_template_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Update cleanup_expired_reactions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_reactions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.room_reactions
  WHERE expires_at < now();
END;
$function$;

-- Update generate_team_invite_code function
CREATE OR REPLACE FUNCTION public.generate_team_invite_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    SELECT EXISTS(SELECT 1 FROM public.teams WHERE invite_code = code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$function$;