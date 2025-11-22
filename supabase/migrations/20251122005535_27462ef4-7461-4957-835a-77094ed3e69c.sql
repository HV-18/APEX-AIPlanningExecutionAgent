-- Add foreign key relationship from workspace_members to profiles
ALTER TABLE public.workspace_members
ADD CONSTRAINT workspace_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;