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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Collaborative Study Rooms
            </h1>
            <p className="text-muted-foreground text-lg">
              Join or create study rooms with real-time collaboration
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create Study Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Room Name</label>
                  <Input
                    placeholder="e.g., Advanced Calculus Study Group"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Topic</label>
                  <Input
                    placeholder="e.g., Math, Physics, Chemistry"
                    value={newRoom.topic}
                    onChange={(e) => setNewRoom({ ...newRoom, topic: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Describe what you'll be studying..."
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button onClick={createRoom} className="w-full h-11" size="lg">
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground mt-4 text-lg">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <Card className="border-2 border-dashed border-border/50 bg-muted/5">
            <div className="p-12 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">No Active Rooms</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Be the first to create a study room and start collaborating with others!
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                size="lg"
                className="mt-4"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Room
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card 
                key={room.id} 
                className="group overflow-hidden border-border/50 bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {room.name}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-medium text-primary">{room.topic}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {room.participant_count || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
                    {room.description || 'No description provided'}
                  </p>

                  {/* Features */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Video className="w-4 h-4" />
                      <span className="text-xs">Video</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs">Share</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">Chat</span>
                    </div>
                  </div>

                  {/* Join Button */}
                  <Button 
                    onClick={() => joinRoom(room.id)} 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    size="lg"
                  >
                    Join Room
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}