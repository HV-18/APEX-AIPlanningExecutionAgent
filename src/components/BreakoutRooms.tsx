import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Plus, LogIn, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BreakoutRoom {
  id: string;
  room_number: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface Assignment {
  id: string;
  breakout_room_id: string;
  user_id: string;
  user_name: string;
}

interface BreakoutRoomsProps {
  roomId: string;
  participants: Array<{ user_id: string; user_name: string }>;
}

export default function BreakoutRooms({ roomId, participants }: BreakoutRoomsProps) {
  const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadBreakoutRooms();
    loadAssignments();
    getCurrentUser();
    
    const channel = supabase
      .channel(`breakout-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breakout_rooms',
          filter: `parent_room_id=eq.${roomId}`,
        },
        () => {
          loadBreakoutRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breakout_assignments',
        },
        () => {
          loadAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const loadBreakoutRooms = async () => {
    const { data, error } = await supabase
      .from('breakout_rooms')
      .select('*')
      .eq('parent_room_id', roomId)
      .eq('is_active', true)
      .order('room_number', { ascending: true });

    if (error) {
      console.error('Error loading breakout rooms:', error);
      return;
    }

    if (data) {
      setBreakoutRooms(data);
    }
  };

  const loadAssignments = async () => {
    const { data: roomsData } = await supabase
      .from('breakout_rooms')
      .select('id')
      .eq('parent_room_id', roomId)
      .eq('is_active', true);

    if (!roomsData || roomsData.length === 0) return;

    const roomIds = roomsData.map((r) => r.id);

    const { data, error } = await supabase
      .from('breakout_assignments')
      .select('*')
      .in('breakout_room_id', roomIds);

    if (error) {
      console.error('Error loading assignments:', error);
      return;
    }

    if (data) {
      setAssignments(data);
    }
  };


  const createBreakoutRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: 'Room name required',
        description: 'Please enter a name for the breakout room',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const roomNumber = breakoutRooms.length + 1;

      const { error } = await supabase.from('breakout_rooms').insert({
        parent_room_id: roomId,
        room_number: roomNumber,
        name: newRoomName,
        created_by: user.id,
      });

      if (error) throw error;

      setNewRoomName('');
      toast({ title: 'Breakout room created!' });
    } catch (error) {
      console.error('Error creating breakout room:', error);
      toast({
        title: 'Failed to create room',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const joinBreakoutRoom = async (breakoutRoomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Remove from other breakout rooms first
      await supabase
        .from('breakout_assignments')
        .delete()
        .eq('user_id', user.id);

      const { error } = await supabase.from('breakout_assignments').insert({
        breakout_room_id: breakoutRoomId,
        user_id: user.id,
        user_name: profile?.full_name || 'Student',
      });

      if (error) throw error;

      toast({ title: 'Joined breakout room!' });
    } catch (error) {
      console.error('Error joining breakout room:', error);
      toast({
        title: 'Failed to join room',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const leaveBreakoutRoom = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('breakout_assignments')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: 'Left breakout room' });
    } catch (error) {
      console.error('Error leaving breakout room:', error);
      toast({
        title: 'Failed to leave room',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const deleteBreakoutRoom = async (breakoutRoomId: string) => {
    try {
      const { error } = await supabase
        .from('breakout_rooms')
        .update({ is_active: false })
        .eq('id', breakoutRoomId);

      if (error) throw error;

      toast({ title: 'Breakout room closed' });
    } catch (error) {
      console.error('Error deleting breakout room:', error);
      toast({
        title: 'Failed to close room',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const getAssignmentsForRoom = (breakoutRoomId: string) => {
    return assignments.filter((a) => a.breakout_room_id === breakoutRoomId);
  };

  const getCurrentUserAssignment = () => {
    return assignments.find((a) => a.user_id === currentUserId);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Breakout Rooms:</strong> Split into smaller groups for focused discussions. 
          Each room has separate video, chat, and collaboration tools.
        </p>
      </Card>

      <div className="flex gap-2">
        <Input
          placeholder="Enter breakout room name..."
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && createBreakoutRoom()}
        />
        <Button onClick={createBreakoutRoom}>
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      {getCurrentUserAssignment() && (
        <Card className="p-4 bg-primary/10 border-primary">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              You are in: <strong>{breakoutRooms.find((r) => r.id === getCurrentUserAssignment()?.breakout_room_id)?.name}</strong>
            </p>
            <Button variant="outline" size="sm" onClick={leaveBreakoutRoom}>
              Leave Room
            </Button>
          </div>
        </Card>
      )}

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {breakoutRooms.map((room) => {
            const roomAssignments = getAssignmentsForRoom(room.id);
            return (
              <Card key={room.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                        {room.room_number}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{room.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {roomAssignments.length} participant{roomAssignments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!getCurrentUserAssignment() && (
                        <Button
                          size="sm"
                          onClick={() => joinBreakoutRoom(room.id)}
                        >
                          <LogIn className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBreakoutRoom(room.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {roomAssignments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {roomAssignments.map((assignment) => (
                        <Badge key={assignment.id} variant="secondary">
                          {assignment.user_name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {breakoutRooms.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No breakout rooms yet</p>
              <p className="text-sm">Create a breakout room to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
