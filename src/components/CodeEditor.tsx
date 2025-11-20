import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Save, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface CodeSession {
  id: string;
  code_content: string;
  language: string;
  last_edited_by_name: string | null;
  last_edited_at: string;
  version: number;
}

interface CodeEditorProps {
  roomId: string;
}

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
];

export default function CodeEditor({ roomId }: CodeEditorProps) {
  const [codeSession, setCodeSession] = useState<CodeSession | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [activeUsers, setActiveUsers] = useState(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCodeSession();
    subscribeToCodeChanges();
    trackPresence();
  }, [roomId]);

  const loadCodeSession = async () => {
    let { data, error } = await supabase
      .from('code_sessions')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No session exists, create one
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id || '')
        .single();

      const { data: newSession, error: insertError } = await supabase
        .from('code_sessions')
        .insert({
          room_id: roomId,
          code_content: '// Start coding here...\n',
          language: 'javascript',
          last_edited_by: user?.id,
          last_edited_by_name: profile?.full_name || 'Student',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating code session:', insertError);
        return;
      }

      data = newSession;
    }

    if (data) {
      setCodeSession(data);
      setCode(data.code_content);
      setLanguage(data.language);
    }
  };

  const subscribeToCodeChanges = () => {
    const channel = supabase
      .channel(`code-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'code_sessions',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updated = payload.new as CodeSession;
          setCodeSession(updated);
          setCode(updated.code_content);
          setLanguage(updated.language);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const trackPresence = () => {
    const channel = supabase.channel(`code-presence-${roomId}`, {
      config: { presence: { key: roomId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setActiveUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          await channel.track({
            user_id: user?.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);

    // Debounce save
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      saveCode(newCode);
    }, 1000);
  };

  const saveCode = async (codeContent: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('code_sessions')
        .update({
          code_content: codeContent,
          language,
          last_edited_by: user.id,
          last_edited_by_name: profile?.full_name || 'Student',
          last_edited_at: new Date().toISOString(),
          version: (codeSession?.version || 0) + 1,
        })
        .eq('room_id', roomId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving code:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await supabase
        .from('code_sessions')
        .update({
          language: newLanguage,
          last_edited_by: user.id,
          last_edited_by_name: profile?.full_name || 'Student',
        })
        .eq('room_id', roomId);

      toast({ title: 'Language updated' });
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Collaborative Code Editor</h3>
          <Badge variant="secondary">
            <Users className="w-3 h-3 mr-1" />
            {activeUsers} editing
          </Badge>
        </div>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {codeSession && (
        <Card className="p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Last edited by <strong>{codeSession.last_edited_by_name || 'Unknown'}</strong> •{' '}
            {new Date(codeSession.last_edited_at).toLocaleString()} • Version {codeSession.version}
          </p>
        </Card>
      )}

      <Card className="p-4">
        <Textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="Start coding together..."
          className="font-mono text-sm min-h-[500px] resize-none"
          spellCheck={false}
        />
      </Card>

      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Real-time Collaboration:</strong> Code changes sync automatically across all participants. 
          Perfect for pair programming, code reviews, and collaborative problem solving.
        </p>
      </Card>
    </div>
  );
}
