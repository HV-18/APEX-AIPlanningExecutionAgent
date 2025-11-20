import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, CheckSquare, FileText, Palette, Video, Monitor, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Whiteboard from '@/components/Whiteboard';
import VideoChat from '@/components/VideoChat';
import ScreenShare from '@/components/ScreenShare';
import TextChat from '@/components/TextChat';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_to_name: string | null;
}

interface Note {
  id: string;
  content: string;
  created_by_name: string;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  user_name: string;
  is_active: boolean;
}

export default function StudyRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (roomId) {
      loadRoomData();
      subscribeToChanges();
    }
  }, [roomId]);

  const loadRoomData = async () => {
    const [participantsRes, tasksRes, notesRes] = await Promise.all([
      supabase.from('room_participants').select('*').eq('room_id', roomId).eq('is_active', true),
      supabase.from('room_tasks').select('*').eq('room_id', roomId).order('created_at', { ascending: false }),
      supabase.from('room_notes').select('*').eq('room_id', roomId).order('created_at', { ascending: false }),
    ]);

    if (participantsRes.data) setParticipants(participantsRes.data);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (notesRes.data) setNotes(notesRes.data);
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, loadRoomData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_tasks', filter: `room_id=eq.${roomId}` }, loadRoomData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_notes', filter: `room_id=eq.${roomId}` }, loadRoomData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('room_tasks').insert({
        room_id: roomId,
        title: newTask,
        created_by: user.id,
      });

      setNewTask('');
      toast({ title: 'Task added!' });
    } catch (error) {
      toast({ title: 'Error adding task', variant: 'destructive' });
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      await supabase.from('room_notes').insert({
        room_id: roomId,
        content: newNote,
        created_by: user.id,
        created_by_name: profile?.full_name || 'Student',
      });

      setNewNote('');
      toast({ title: 'Note added!' });
    } catch (error) {
      toast({ title: 'Error adding note', variant: 'destructive' });
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await supabase.from('room_tasks').update({ status }).eq('id', taskId);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/study-rooms')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Study Room</h1>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{participants.length} active</span>
          </div>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="tasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="w-4 h-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="whiteboard">
              <Palette className="w-4 h-4 mr-2" />
              Whiteboard
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </TabsTrigger>
            <TabsTrigger value="screen">
              <Monitor className="w-4 h-4 mr-2" />
              Screen Share
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="w-4 h-4 mr-2" />
              Participants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <Button onClick={addTask}>Add</Button>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{task.title}</p>
                      {task.assigned_to_name && (
                        <p className="text-sm text-muted-foreground">Assigned to: {task.assigned_to_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button onClick={addNote}>Add Note</Button>
            </div>
            <div className="space-y-2">
              {notes.map((note) => (
                <Card key={note.id} className="p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {note.created_by_name} • {new Date(note.created_at).toLocaleString()}
                  </p>
                  <p className="text-foreground">{note.content}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="whiteboard" className="space-y-4">
            {roomId && <Whiteboard roomId={roomId} />}
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            {roomId && <VideoChat roomId={roomId} participants={participants} />}
          </TabsContent>

          <TabsContent value="screen" className="space-y-4">
            {roomId && (
              <ScreenShare 
                roomId={roomId} 
                onStreamChange={(stream) => console.log('Screen share stream:', stream)} 
              />
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            {roomId && <TextChat roomId={roomId} />}
          </TabsContent>

          <TabsContent value="participants" className="space-y-2">
            {participants.map((participant) => (
              <Card key={participant.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{participant.user_name}</span>
                  <Badge variant={participant.is_active ? 'default' : 'secondary'}>
                    {participant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}