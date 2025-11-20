import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface VoiceCommand {
  command: string;
  action: () => void;
  keywords: string[];
}

export const useVoiceCommands = (enabled: boolean = true) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recognition, setRecognition] = useState<any>(null);

  const commands: VoiceCommand[] = [
    {
      command: "go home",
      action: () => navigate("/"),
      keywords: ["home", "dashboard", "go home"],
    },
    {
      command: "open chat",
      action: () => navigate("/chat"),
      keywords: ["chat", "ai", "open chat", "ai chat"],
    },
    {
      command: "start timer",
      action: () => navigate("/focus"),
      keywords: ["timer", "focus", "pomodoro", "start timer"],
    },
    {
      command: "log mood",
      action: () => navigate("/mood"),
      keywords: ["mood", "log mood", "track mood"],
    },
    {
      command: "study rooms",
      action: () => navigate("/study-rooms"),
      keywords: ["study rooms", "rooms", "collaborate"],
    },
    {
      command: "open profile",
      action: () => navigate("/profile"),
      keywords: ["profile", "my profile", "open profile"],
    },
    {
      command: "open settings",
      action: () => navigate("/settings"),
      keywords: ["settings", "open settings", "preferences"],
    },
    {
      command: "show timetable",
      action: () => navigate("/timetable"),
      keywords: ["timetable", "schedule", "calendar"],
    },
  ];

  const startListening = useCallback(() => {
    if (!recognition) return;

    try {
      recognition.start();
      setIsListening(true);
      toast({
        title: "Voice commands active",
        description: "Listening for commands...",
      });
    } catch (error) {
      console.error("Error starting recognition:", error);
    }
  }, [recognition, toast]);

  const stopListening = useCallback(() => {
    if (!recognition) return;

    try {
      recognition.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }
  }, [recognition]);

  useEffect(() => {
    if (!enabled) return;

    // Check if browser supports speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript.toLowerCase().trim();
      setTranscript(text);

      if (event.results[last].isFinal) {
        // Check for matching command
        const matchedCommand = commands.find((cmd) =>
          cmd.keywords.some((keyword) => text.includes(keyword))
        );

        if (matchedCommand) {
          toast({
            title: "Command recognized",
            description: `Executing: ${matchedCommand.command}`,
          });
          matchedCommand.action();
          setTranscript("");
        }
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [enabled, navigate, toast]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    commands,
  };
};
