import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import { Badge } from "@/components/ui/badge";

export const VoiceCommandsButton = () => {
  const { isListening, transcript, startListening, stopListening, commands } = useVoiceCommands();

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
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Voice Commands</h3>
            <p className="text-sm text-muted-foreground">
              {isListening
                ? "Listening for commands..."
                : "Click the microphone to start voice commands"}
            </p>
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
