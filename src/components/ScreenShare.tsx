import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, MonitorOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScreenShareProps {
  roomId: string;
  onStreamChange: (stream: MediaStream | null) => void;
}

export default function ScreenShare({ roomId, onStreamChange }: ScreenShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

      setStream(displayStream);
      setIsSharing(true);
      onStreamChange(displayStream);

      toast({
        title: 'Screen sharing started',
        description: 'Your screen is now visible to room participants',
      });
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        title: 'Screen share failed',
        description: 'Could not access your screen',
        variant: 'destructive',
      });
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsSharing(false);
      onStreamChange(null);

      toast({
        title: 'Screen sharing stopped',
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!isSharing ? (
        <Button onClick={startScreenShare} variant="outline">
          <Monitor className="w-4 h-4 mr-2" />
          Share Screen
        </Button>
      ) : (
        <Button onClick={stopScreenShare} variant="destructive">
          <MonitorOff className="w-4 h-4 mr-2" />
          Stop Sharing
        </Button>
      )}
    </div>
  );
}
