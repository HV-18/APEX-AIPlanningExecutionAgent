import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface VoiceChatProps {
  roomId: string;
  participants: Array<{ user_id: string; user_name: string }>;
}

export default function VoiceChat({ roomId, participants }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeConnections, setActiveConnections] = useState<Set<string>>(new Set());
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const { toast } = useToast();

  const configuration: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  useEffect(() => {
    if (!isConnected) return;

    const channel = supabase
      .channel(`voice-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voice_signals',
          filter: `room_id=eq.${roomId}`,
        },
        handleSignal
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConnected, roomId]);

  const handleSignal = async (payload: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const signal = payload.new;

    if (signal.to_user_id !== user?.id) return;

    const fromUserId = signal.from_user_id;
    let pc = peerConnectionsRef.current.get(fromUserId);

    if (!pc) {
      pc = createPeerConnection(fromUserId);
    }

    try {
      if (signal.signal_type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data as RTCSessionDescriptionInit));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await supabase.from('voice_signals').insert([{
          room_id: roomId,
          from_user_id: user?.id || '',
          to_user_id: fromUserId,
          signal_type: 'answer',
          signal_data: JSON.parse(JSON.stringify(answer)),
        }]);
      } else if (signal.signal_type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data as RTCSessionDescriptionInit));
      } else if (signal.signal_type === 'ice-candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(signal.signal_data as RTCIceCandidateInit));
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  };

  const createPeerConnection = (userId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('voice_signals').insert([{
          room_id: roomId,
          from_user_id: user?.id || '',
          to_user_id: userId,
          signal_type: 'ice-candidate',
          signal_data: JSON.parse(JSON.stringify(event.candidate)),
        }]);
      }
    };

    pc.ontrack = (event) => {
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.play();
      setActiveConnections((prev) => new Set(prev).add(userId));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setActiveConnections((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peerConnectionsRef.current.set(userId, pc);
    return pc;
  };

  const startVoiceChat = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setIsConnected(true);

      // Create offers to all other participants
      const { data: { user } } = await supabase.auth.getUser();
      const otherParticipants = participants.filter((p) => p.user_id !== user?.id);

      for (const participant of otherParticipants) {
        const pc = createPeerConnection(participant.user_id);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await supabase.from('voice_signals').insert([{
          room_id: roomId,
          from_user_id: user?.id || '',
          to_user_id: participant.user_id,
          signal_type: 'offer',
          signal_data: JSON.parse(JSON.stringify(offer)),
        }]);
      }

      toast({ title: 'Voice chat connected!' });
    } catch (error) {
      console.error('Error starting voice chat:', error);
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to use voice chat',
        variant: 'destructive',
      });
    }
  };

  const stopVoiceChat = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setIsConnected(false);
    setActiveConnections(new Set());
    toast({ title: 'Voice chat disconnected' });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {!isConnected ? (
          <Button onClick={startVoiceChat}>
            <Mic className="w-4 h-4 mr-2" />
            Start Voice Chat
          </Button>
        ) : (
          <>
            <Button variant={isMuted ? 'destructive' : 'default'} onClick={toggleMute}>
              {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button variant="destructive" onClick={stopVoiceChat}>
              <PhoneOff className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </>
        )}
        {isConnected && (
          <Badge variant="secondary">
            {activeConnections.size} participant{activeConnections.size !== 1 ? 's' : ''} connected
          </Badge>
        )}
      </div>
    </div>
  );
}