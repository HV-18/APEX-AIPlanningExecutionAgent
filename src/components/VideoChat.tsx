import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface VideoChatProps {
  roomId: string;
  participants: Array<{ user_id: string; user_name: string }>;
}

export default function VideoChat({ roomId, participants }: VideoChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeConnections, setActiveConnections] = useState<Set<string>>(new Set());
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const { toast } = useToast();

  const configuration: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  useEffect(() => {
    if (!isConnected) return;

    const channel = supabase
      .channel(`video-${roomId}`)
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
      const video = document.createElement('video');
      video.srcObject = event.streams[0];
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'w-full h-full object-cover rounded-lg';
      remoteVideosRef.current.set(userId, video);
      
      const container = document.getElementById(`remote-video-${userId}`);
      if (container) {
        container.innerHTML = '';
        container.appendChild(video);
      }
      
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

  const startVideoChat = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsConnected(true);

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

      toast({ title: 'Video chat connected!' });
    } catch (error) {
      console.error('Error starting video chat:', error);
      toast({
        title: 'Camera/Microphone access denied',
        description: 'Please allow camera and microphone access to use video chat',
        variant: 'destructive',
      });
    }
  };

  const stopVideoChat = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setIsConnected(false);
    setActiveConnections(new Set());
    toast({ title: 'Video chat disconnected' });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {!isConnected ? (
          <Button onClick={startVideoChat}>
            <Video className="w-4 h-4 mr-2" />
            Start Video Chat
          </Button>
        ) : (
          <>
            <Button variant={isMuted ? 'destructive' : 'default'} onClick={toggleMute}>
              {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button variant={isVideoOff ? 'destructive' : 'default'} onClick={toggleVideo}>
              {isVideoOff ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
              {isVideoOff ? 'Start Video' : 'Stop Video'}
            </Button>
            <Button variant="destructive" onClick={stopVideoChat}>
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

      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">You</p>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>

          {Array.from(activeConnections).map((userId) => {
            const participant = participants.find((p) => p.user_id === userId);
            return (
              <Card key={userId} className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {participant?.user_name || 'Participant'}
                  </p>
                  <div
                    id={`remote-video-${userId}`}
                    className="aspect-video bg-muted rounded-lg overflow-hidden"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
