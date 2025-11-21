import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface PresenceUser {
  user_id: string;
  user_name: string;
  online_at: string;
}

interface CollaborationPresenceProps {
  workspaceId: string;
  currentUserId: string;
}

export default function CollaborationPresence({ workspaceId, currentUserId }: CollaborationPresenceProps) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`workspace-presence-${workspaceId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id !== currentUserId) {
              users.push(presence);
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', currentUserId)
            .single();

          await channel.track({
            user_id: currentUserId,
            user_name: profile?.full_name || user?.email || 'Anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, currentUserId]);

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
      <Users className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-foreground">
        {onlineUsers.length} {onlineUsers.length === 1 ? 'collaborator' : 'collaborators'} online
      </span>
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map((user) => (
          <Avatar key={user.user_id} className="w-8 h-8 border-2 border-background">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user.user_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {onlineUsers.length > 5 && (
          <Badge variant="secondary" className="ml-2">
            +{onlineUsers.length - 5}
          </Badge>
        )}
      </div>
    </div>
  );
}
