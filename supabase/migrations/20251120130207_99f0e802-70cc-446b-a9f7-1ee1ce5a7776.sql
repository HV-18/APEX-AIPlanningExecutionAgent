-- Add invite_code column to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON public.teams(invite_code);

-- Create team_chat_messages table
CREATE TABLE IF NOT EXISTS public.team_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on team_chat_messages
ALTER TABLE public.team_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for team_chat_messages
CREATE POLICY "Team members can view chat messages"
  ON public.team_chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_chat_messages.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can send chat messages"
  ON public.team_chat_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_chat_messages.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Create index for faster chat queries
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_team_id ON public.team_chat_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_created_at ON public.team_chat_messages(created_at DESC);

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_team_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.teams WHERE invite_code = code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for team_chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_chat_messages;