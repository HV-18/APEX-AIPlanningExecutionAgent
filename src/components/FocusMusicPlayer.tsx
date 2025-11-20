import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipForward, Volume2, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const musicCategories = {
  binaural: [
    { name: 'Deep Focus 40Hz', url: 'https://www.youtube.com/embed/WPni755-Krg?autoplay=1' },
    { name: 'Study & Concentration', url: 'https://www.youtube.com/embed/kJww__6CgNU?autoplay=1' },
  ],
  lofi: [
    { name: 'Lofi Hip Hop', url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1' },
    { name: 'Chill Beats', url: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1' },
  ],
  nature: [
    { name: 'Rain Sounds', url: 'https://www.youtube.com/embed/nDq6TstdEi8?autoplay=1' },
    { name: 'Forest Ambience', url: 'https://www.youtube.com/embed/WEW0NpGdGLY?autoplay=1' },
  ],
  whitenoise: [
    { name: 'Pure White Noise', url: 'https://www.youtube.com/embed/nMfPqeZjc2c?autoplay=1' },
    { name: 'Brown Noise', url: 'https://www.youtube.com/embed/RqzGzwTY-6w?autoplay=1' },
  ],
};

export default function FocusMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [currentTrack, setCurrentTrack] = useState(musicCategories.binaural[0]);
  const [category, setCategory] = useState('binaural');

  const handleTrackChange = (track: typeof currentTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
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
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon">
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

      {/* Embedded Player */}
      {isPlaying && (
        <div className="mt-4 rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="60"
            src={currentTrack.url}
            title={currentTrack.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-0"
          />
        </div>
      )}
    </Card>
  );
}