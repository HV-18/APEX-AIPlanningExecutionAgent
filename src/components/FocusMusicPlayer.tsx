import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const musicCategories = {
  binaural: [
    { name: 'Deep Focus - Alpha Waves', videoId: 'WPni755-Krg' },
    { name: 'Super Intelligence - Memory', videoId: 'ghxkXb5p4Yw' },
    { name: 'Focus & Concentration', videoId: 'seGWLwmsMZU' },
  ],
  lofi: [
    { name: 'Lofi Hip Hop Radio - 24/7', videoId: 'jfKfPfyJRdk' },
    { name: 'Chill Lofi Study Beats', videoId: '5qap5aO4i9A' },
    { name: 'Lofi Girl - Beats to Study', videoId: 'lTRiuFIWV54' },
  ],
  nature: [
    { name: 'Rain Sounds - 10 Hours', videoId: 'mPZkdNFkNps' },
    { name: 'Ocean Waves - Relaxing', videoId: 'WHPYKLQB-9g' },
    { name: 'Forest Rain & Birds', videoId: 'xNN7iTA57jM' },
  ],
  whitenoise: [
    { name: 'White Noise - 10 Hours', videoId: 'nMfPqeZjc2c' },
    { name: 'Brown Noise for Studying', videoId: 'RqzGzwTY-6w' },
    { name: 'Pink Noise - Sleep & Study', videoId: 'ZXtimhT-ff4' },
  ],
};

export default function FocusMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [currentTrack, setCurrentTrack] = useState(musicCategories.binaural[0]);
  const [category, setCategory] = useState('binaural');
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      if (iframeRef.current && !playerRef.current) {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '360',
          width: '640',
          videoId: currentTrack.videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            loop: 1,
            playlist: currentTrack.videoId,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log('Player ready');
              event.target.setVolume(volume[0]);
              setPlayerReady(true);
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
            },
          },
        });
      }
    };

    // Trigger if API already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      (window as any).onYouTubeIframeAPIReady();
    }
  }, []);

  useEffect(() => {
    if (playerRef.current && playerReady && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById({
        videoId: currentTrack.videoId,
        startSeconds: 0,
      });
      if (isPlaying) {
        setTimeout(() => {
          playerRef.current.playVideo();
        }, 500);
      }
    }
  }, [currentTrack, playerReady]);

  useEffect(() => {
    if (playerRef.current && playerReady && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume[0]);
    }
  }, [volume, playerReady]);

  const handleTrackChange = (track: typeof currentTrack) => {
    setCurrentTrack(track);
    setTimeout(() => {
      if (playerRef.current && playerReady) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }, 500);
  };

  const togglePlayPause = () => {
    if (playerRef.current && playerReady) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleSkip = () => {
    const tracks = musicCategories[category as keyof typeof musicCategories];
    const currentIndex = tracks.findIndex(t => t.videoId === currentTrack.videoId);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handleTrackChange(tracks[nextIndex]);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <Music className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Focus Music Player</h3>
      </div>

      <Tabs defaultValue="binaural" onValueChange={setCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="binaural">Binaural</TabsTrigger>
          <TabsTrigger value="lofi">Lo-Fi</TabsTrigger>
          <TabsTrigger value="nature">Nature</TabsTrigger>
          <TabsTrigger value="whitenoise">White Noise</TabsTrigger>
        </TabsList>

        {Object.entries(musicCategories).map(([key, tracks]) => (
          <TabsContent key={key} value={key} className="space-y-3">
            {tracks.map((track) => (
              <button
                key={track.name}
                onClick={() => handleTrackChange(track)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  currentTrack.name === track.name && isPlaying
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted border-border hover:bg-muted/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{track.name}</span>
                  {currentTrack.name === track.name && isPlaying && (
                    <span className="text-xs text-primary">Playing</span>
                  )}
                </div>
              </button>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Player Controls */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleSkip}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-10">{volume[0]}%</span>
        </div>
      </div>

      {/* Embedded YouTube Player */}
      <div ref={iframeRef} className="mt-6">
        <div id="youtube-player" className="w-full aspect-video rounded-lg overflow-hidden" />
      </div>
    </Card>
  );
}