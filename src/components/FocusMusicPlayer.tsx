import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const musicCategories = {
  binaural: [
    { name: 'Deep Focus 40Hz', videoId: 'WPni755-Krg' },
    { name: 'Study & Concentration', videoId: 'kJww__6CgNU' },
  ],
  lofi: [
    { name: 'Lofi Hip Hop', videoId: 'jfKfPfyJRdk' },
    { name: 'Chill Beats', videoId: '5qap5aO4i9A' },
  ],
  nature: [
    { name: 'Rain Sounds', videoId: 'nDq6TstdEi8' },
    { name: 'Forest Ambience', videoId: 'WEW0NpGdGLY' },
  ],
  whitenoise: [
    { name: 'Pure White Noise', videoId: 'nMfPqeZjc2c' },
    { name: 'Brown Noise', videoId: 'RqzGzwTY-6w' },
  ],
};

export default function FocusMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [currentTrack, setCurrentTrack] = useState(musicCategories.binaural[0]);
  const [category, setCategory] = useState('binaural');
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (iframeRef.current) {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          videoId: currentTrack.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            loop: 1,
            playlist: currentTrack.videoId,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(volume[0]);
            },
          },
        });
      }
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById({
        videoId: currentTrack.videoId,
        startSeconds: 0,
      });
      playerRef.current.setLoop(true);
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume[0]);
    }
  }, [volume]);

  const handleTrackChange = (track: typeof currentTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = () => {
    const tracks = musicCategories[category as keyof typeof musicCategories];
    const currentIndex = tracks.findIndex(t => t.videoId === currentTrack.videoId);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
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

      {/* Embedded Player (Hidden but functional) */}
      <div ref={iframeRef} className="mt-4">
        <div id="youtube-player" className="w-full h-0" />
      </div>
    </Card>
  );
}