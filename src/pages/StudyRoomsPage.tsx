import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Video, Share2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface StudyRoom {
  id: string;
  name: string;
  description: string;
  topic: string;
  created_by: string;
  max_participants: number;
  is_active: boolean;
  created_at: string;
  participant_count?: number;
}

export default function StudyRoomsPage() {
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', topic: '' });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
    subscribeToRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load study rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRooms = () => {
    const channel = supabase
      .channel('study_rooms_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_rooms',
        },
        () => loadRooms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createRoom = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('study_rooms').insert({
        name: newRoom.name,
        description: newRoom.description,
        topic: newRoom.topic,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Room Created!',
        description: 'Your study room is ready',
      });

      setIsCreateDialogOpen(false);
      setNewRoom({ name: '', description: '', topic: '' });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await supabase.from('room_participants').insert({
        room_id: roomId,
        user_id: user.id,
        user_name: profile?.full_name || 'Student',
      });

      navigate(`/study-room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error',
        description: 'Failed to join room',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Collaborative Study Rooms</h1>
          <p className="text-muted-foreground mt-1">Join or create study rooms with real-time collaboration</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Room Name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              />
              <Input
                placeholder="Topic (e.g., Math, Physics)"
                value={newRoom.topic}
                onChange={(e) => setNewRoom({ ...newRoom, topic: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
              />
              <Button onClick={createRoom} className="w-full">
                Create Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Rooms</h3>
          <p className="text-muted-foreground mb-4">Be the first to create a study room!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground">{room.name}</h3>
                  <p className="text-sm text-primary">{room.topic}</p>
                </div>
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {room.description}
              </p>

              <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                <Video className="w-4 h-4" />
                <Share2 className="w-4 h-4" />
                <MessageSquare className="w-4 h-4" />
              </div>

              <Button onClick={() => joinRoom(room.id)} className="w-full">
                Join Room
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}