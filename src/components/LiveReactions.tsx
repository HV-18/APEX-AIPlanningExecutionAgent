import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThumbsUp, HelpCircle, Gauge, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  id: string;
  user_id: string;
  user_name: string;
  reaction_type: string;
  created_at: string;
}

interface LiveReactionsProps {
  roomId: string;
}

const reactionTypes = [
  { type: 'thumbs_up', icon: ThumbsUp, label: 'Thumbs Up', color: 'text-green-500' },
  { type: 'confused', icon: HelpCircle, label: 'Confused', color: 'text-yellow-500' },
  { type: 'slow_down', icon: Gauge, label: 'Slow Down', color: 'text-orange-500' },
  { type: 'speed_up', icon: Zap, label: 'Speed Up', color: 'text-blue-500' },
];

export default function LiveReactions({ roomId }: LiveReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadReactions();
    subscribeToReactions();
    
    // Cleanup expired reactions every 5 seconds
    const interval = setInterval(() => {
      cleanupExpiredReactions();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [roomId]);

  useEffect(() => {
    // Update reaction counts
    const counts: Record<string, number> = {};
    reactions.forEach((r) => {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
    });
    setReactionCounts(counts);
  }, [reactions]);

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('room_reactions')
      .select('*')
      .eq('room_id', roomId)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error loading reactions:', error);
      return;
    }

    if (data) {
      setReactions(data);
    }
  };

  const subscribeToReactions = () => {
    const channel = supabase
      .channel(`reactions-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_reactions',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setReactions((prev) => [...prev, payload.new as Reaction]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const cleanupExpiredReactions = () => {
    setReactions((prev) =>
      prev.filter((r) => new Date(r.created_at).getTime() + 10000 > Date.now())
    );
  };

  const sendReaction = async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.from('room_reactions').insert({
        room_id: roomId,
        user_id: user.id,
        user_name: profile?.full_name || 'Student',
        reaction_type: reactionType,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast({
        title: 'Failed to send reaction',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground mb-3">
          <strong>Live Feedback:</strong> React in real-time during presentations. 
          Reactions appear for 10 seconds and help presenters adjust their pace.
        </p>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reactionTypes.map(({ type, icon: Icon, label, color }) => (
          <Button
            key={type}
            variant="outline"
            className="h-20 flex-col gap-2 relative"
            onClick={() => sendReaction(type)}
          >
            <Icon className={`w-6 h-6 ${color}`} />
            <span className="text-sm font-medium">{label}</span>
            {reactionCounts[type] > 0 && (
              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {reactionCounts[type]}
              </span>
            )}
          </Button>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Active Reactions</h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {reactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active reactions
            </p>
          ) : (
            reactions.slice(-10).reverse().map((reaction) => {
              const reactionType = reactionTypes.find((r) => r.type === reaction.reaction_type);
              const Icon = reactionType?.icon || ThumbsUp;
              return (
                <div key={reaction.id} className="flex items-center gap-2 text-sm">
                  <Icon className={`w-4 h-4 ${reactionType?.color || 'text-foreground'}`} />
                  <span className="text-muted-foreground">
                    <strong>{reaction.user_name}</strong> {reactionType?.label || reaction.reaction_type}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
