import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, Square, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SessionRecorderProps {
  roomId: string;
}

export default function SessionRecorder({ roomId }: SessionRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await saveRecording(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast({ title: 'Recording started' });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Failed to start recording',
        description: 'Please allow screen recording access',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({ title: 'Recording stopped, saving...' });
    }
  };

  const saveRecording = async (blob: Blob) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const fileName = `${user.id}/${Date.now()}.webm`;

      const { error: uploadError } = await supabase.storage
        .from('room-files')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('session_recordings').insert({
        room_id: roomId,
        recorded_by: user.id,
        recorded_by_name: profile?.full_name || 'Student',
        recording_path: fileName,
        duration_seconds: recordingTime,
        file_size: blob.size,
      });

      if (dbError) throw dbError;

      // Also add to room_files for easy access
      await supabase.from('room_files').insert({
        room_id: roomId,
        user_id: user.id,
        user_name: profile?.full_name || 'Student',
        file_name: `Session Recording ${new Date().toLocaleString()}.webm`,
        file_path: fileName,
        file_size: blob.size,
        file_type: 'video/webm',
      });

      toast({ title: 'Recording saved successfully!' });
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: 'Failed to save recording',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Session Recording</h3>
              <p className="text-sm text-muted-foreground">
                Record your study session for later review
              </p>
            </div>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}
          </div>

          {isRecording && (
            <div className="text-center py-6">
              <div className="text-4xl font-mono font-bold text-foreground mb-2">
                {formatTime(recordingTime)}
              </div>
              <p className="text-sm text-muted-foreground">Recording in progress</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex-1">
                <Video className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopRecording} className="flex-1">
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Recordings capture your screen and audio. They will be saved 
              to the Files tab for all participants to download. Maximum recording size is 
              limited by available storage.
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
}
