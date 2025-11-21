import { Mic, MicOff, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useVoiceCommands, SUPPORTED_LANGUAGES } from "@/hooks/useVoiceCommands";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const VoiceCommandsButton = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { isListening, transcript, startListening, stopListening, commands } =
    useVoiceCommands(true, selectedLanguage);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeInTimezone = (timezone: string) => {
    return currentTime.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? (
            <Mic className="w-5 h-5 text-primary animate-pulse" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] max-h-[650px] overflow-y-auto border-border/50 shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="pb-3 border-b border-border/50">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              Voice Assistant
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Control APEX with your voice in 40+ languages
            </p>
          </div>

          {/* Status Card */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            isListening 
              ? 'bg-primary/5 border-primary/50 shadow-lg shadow-primary/20' 
              : 'bg-muted/50 border-border/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Status</span>
              <Badge 
                variant={isListening ? "default" : "secondary"}
                className={isListening ? "animate-pulse" : ""}
              >
                {isListening ? "🎤 Listening..." : "⏸️ Inactive"}
              </Badge>
            </div>
            {transcript && (
              <div className="mt-3 p-2 bg-background/80 rounded border border-border/30">
                <p className="text-xs font-medium text-muted-foreground mb-1">Heard:</p>
                <p className="text-sm">{transcript}</p>
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Language
            </label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Zones */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Time Zones
            </label>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30 hover:border-border/50 transition-colors">
                <span className="text-sm font-medium">🌍 UTC</span>
                <span className="text-sm font-mono">{getTimeInTimezone('UTC')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30 hover:border-border/50 transition-colors">
                <span className="text-sm font-medium">🇮🇳 IST (India)</span>
                <span className="text-sm font-mono">{getTimeInTimezone('Asia/Kolkata')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30 hover:border-border/50 transition-colors">
                <span className="text-sm font-medium">📍 Local</span>
                <span className="text-sm font-mono">{currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Available Commands */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Commands</label>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {commands.map((cmd, index) => (
                <div 
                  key={index} 
                  className="group p-2.5 bg-muted/20 hover:bg-muted/40 rounded-lg border border-border/20 hover:border-border/40 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-medium">
                      {cmd.command}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pl-1">
                    Say: "{cmd.keywords[0]}" or "{cmd.keywords[1]}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={isListening ? stopListening : startListening}
            className="w-full h-11 font-medium"
            variant={isListening ? "destructive" : "default"}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
