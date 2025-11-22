-- Create voice_conversations table to track conversation history
CREATE TABLE public.voice_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  message_count INTEGER DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_messages table to store individual messages
CREATE TABLE public.voice_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.voice_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_conversations
CREATE POLICY "Users can view own conversations"
  ON public.voice_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.voice_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.voice_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.voice_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for voice_messages
CREATE POLICY "Users can view messages from own conversations"
  ON public.voice_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.voice_conversations
      WHERE id = voice_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations"
  ON public.voice_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.voice_conversations
      WHERE id = voice_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_voice_conversations_user_id ON public.voice_conversations(user_id);
CREATE INDEX idx_voice_conversations_started_at ON public.voice_conversations(started_at DESC);
CREATE INDEX idx_voice_messages_conversation_id ON public.voice_messages(conversation_id);
CREATE INDEX idx_voice_messages_timestamp ON public.voice_messages(timestamp);