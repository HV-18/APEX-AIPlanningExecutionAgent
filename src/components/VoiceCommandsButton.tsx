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
      <PopoverContent className="w-96 max-h-[600px] overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Language Selection
            </h4>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
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

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Zones
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-muted rounded">
                <span className="font-medium">UTC:</span>
                <span>{getTimeInTimezone('UTC')}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span className="font-medium">IST (India):</span>
                <span>{getTimeInTimezone('Asia/Kolkata')}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span className="font-medium">Local:</span>
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Voice Commands Status</h4>
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? "Listening..." : "Inactive"}
            </Badge>
          </div>

          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Heard:</p>
              <p className="text-sm text-muted-foreground">{transcript}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Available Commands:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {commands.map((cmd, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="flex-shrink-0">
                    {cmd.command}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {cmd.keywords.slice(0, 2).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={isListening ? stopListening : startListening}
            className="w-full"
            variant={isListening ? "destructive" : "default"}
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
