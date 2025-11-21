import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hand, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HandRaiseData {
  id: string;
  user_id: string;
  user_name: string;
  status: string;
  raised_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}

interface HandRaiseProps {
  roomId: string;
}

export default function HandRaise({ roomId }: HandRaiseProps) {
  const [handRaises, setHandRaises] = useState<HandRaiseData[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadHandRaises();
    getCurrentUser();
    
    const channel = supabase
      .channel(`hand-raises-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hand_raises',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadHandRaises();
          if (currentUserId) {
            checkIfHandRaised(currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUserId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      checkIfHandRaised(user.id);
    }
  };

  const checkIfHandRaised = async (userId: string) => {
    const { data } = await supabase
      .from('hand_raises')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .eq('status', 'raised')
      .single();

    setHasRaisedHand(!!data);
  };

  const loadHandRaises = async () => {
    const { data, error } = await supabase
      .from('hand_raises')
      .select('*')
      .eq('room_id', roomId)
      .eq('status', 'raised')
      .order('raised_at', { ascending: true });

    if (error) {
      console.error('Error loading hand raises:', error);
      return;
    }

    if (data) {
      setHandRaises(data);
    }
  };


  const raiseHand = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.from('hand_raises').insert({
        room_id: roomId,
        user_id: user.id,
        user_name: profile?.full_name || 'Student',
        status: 'raised',
      });

      if (error) throw error;

      toast({ title: 'Hand raised!' });
    } catch (error) {
      console.error('Error raising hand:', error);
      toast({
        title: 'Failed to raise hand',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const lowerHand = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('hand_raises')
        .update({ status: 'lowered' })
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .eq('status', 'raised');

      if (error) throw error;

      toast({ title: 'Hand lowered' });
    } catch (error) {
      console.error('Error lowering hand:', error);
      toast({
        title: 'Failed to lower hand',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const acknowledgeHand = async (handRaiseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('hand_raises')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id,
        })
        .eq('id', handRaiseId);

      if (error) throw error;

      toast({ title: 'Hand acknowledged' });
    } catch (error) {
      console.error('Error acknowledging hand:', error);
      toast({
        title: 'Failed to acknowledge',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {!hasRaisedHand ? (
          <Button onClick={raiseHand}>
            <Hand className="w-4 h-4 mr-2" />
            Raise Hand
          </Button>
        ) : (
          <Button variant="destructive" onClick={lowerHand}>
            <X className="w-4 h-4 mr-2" />
            Lower Hand
          </Button>
        )}
        <Badge variant="secondary">
          {handRaises.length} hand{handRaises.length !== 1 ? 's' : ''} raised
        </Badge>
      </div>

      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Turn-Taking System:</strong> Raise your hand to speak. The queue shows the order. 
          Participants can acknowledge when someone has been given the floor.
        </p>
      </Card>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {handRaises.map((handRaise, index) => (
            <Card key={handRaise.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {handRaise.user_name}
                      {handRaise.user_id === currentUserId && (
                        <Badge variant="secondary" className="ml-2">You</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Raised at {new Date(handRaise.raised_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Hand className="w-5 h-5 text-primary animate-pulse" />
                  {handRaise.user_id !== currentUserId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeHand(handRaise.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {handRaises.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Hand className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hands raised</p>
              <p className="text-sm">Raise your hand to speak in turn</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
