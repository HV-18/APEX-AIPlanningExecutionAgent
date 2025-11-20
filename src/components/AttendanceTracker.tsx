import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Download, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  joined_at: string;
  left_at: string | null;
  duration_minutes: number | null;
}

interface AttendanceTrackerProps {
  roomId: string;
}

export default function AttendanceTracker({ roomId }: AttendanceTrackerProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAttendance();
    subscribeToAttendance();
    startAttendance();

    return () => {
      endAttendance();
    };
  }, [roomId]);

  const loadAttendance = async () => {
    const { data, error } = await supabase
      .from('room_attendance')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error loading attendance:', error);
      return;
    }

    if (data) {
      setAttendanceRecords(data);
    }
  };

  const subscribeToAttendance = () => {
    const channel = supabase
      .channel(`attendance-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_attendance',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('room_attendance')
        .insert({
          room_id: roomId,
          user_id: user.id,
          user_name: profile?.full_name || 'Student',
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCurrentSessionId(data.id);
      }
    } catch (error) {
      console.error('Error starting attendance:', error);
    }
  };

  const endAttendance = async () => {
    if (!currentSessionId) return;

    try {
      const { data: session } = await supabase
        .from('room_attendance')
        .select('joined_at')
        .eq('id', currentSessionId)
        .single();

      if (session) {
        const joinedAt = new Date(session.joined_at).getTime();
        const leftAt = Date.now();
        const durationMinutes = Math.round((leftAt - joinedAt) / 60000);

        await supabase
          .from('room_attendance')
          .update({
            left_at: new Date().toISOString(),
            duration_minutes: durationMinutes,
          })
          .eq('id', currentSessionId);
      }
    } catch (error) {
      console.error('Error ending attendance:', error);
    }
  };

  const exportAttendance = () => {
    const csv = [
      ['Name', 'Joined', 'Left', 'Duration (minutes)'],
      ...attendanceRecords.map((record) => [
        record.user_name,
        new Date(record.joined_at).toLocaleString(),
        record.left_at ? new Date(record.left_at).toLocaleString() : 'Still in room',
        record.duration_minutes?.toString() || 'N/A',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Attendance report exported!' });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Attendance Tracker</h3>
        <Button onClick={exportAttendance} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            Tracking {attendanceRecords.filter((r) => !r.left_at).length} active participant
            {attendanceRecords.filter((r) => !r.left_at).length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {attendanceRecords.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      {record.user_name}
                      {!record.left_at && (
                        <span className="ml-2 text-xs text-green-500">• Active</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(record.joined_at).toLocaleString()}
                    </p>
                    {record.left_at && (
                      <p className="text-xs text-muted-foreground">
                        Left: {new Date(record.left_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatDuration(record.duration_minutes)}
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
            </Card>
          ))}
          {attendanceRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No attendance records yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
