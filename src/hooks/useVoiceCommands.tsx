import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface VoiceCommand {
  command: string;
  action: () => void;
  keywords: string[];
}

export const SUPPORTED_LANGUAGES = {
  // Asia (10)
  'en-US': 'English (US)',
  'zh-CN': 'Chinese (Mandarin)',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'hi-IN': 'Hindi',
  'ar-SA': 'Arabic',
  'th-TH': 'Thai',
  'vi-VN': 'Vietnamese',
  'id-ID': 'Indonesian',
  'fil-PH': 'Filipino',
  
  // Africa (10)
  'ar-EG': 'Arabic (Egypt)',
  'sw-KE': 'Swahili',
  'am-ET': 'Amharic',
  'zu-ZA': 'Zulu',
  'af-ZA': 'Afrikaans',
  'fr-MA': 'French (Morocco)',
  'ha-NG': 'Hausa',
  'ig-NG': 'Igbo',
  'yo-NG': 'Yoruba',
  'rw-RW': 'Kinyarwanda',
  
  // Europe (10)
  'en-GB': 'English (UK)',
  'de-DE': 'German',
  'fr-FR': 'French',
  'es-ES': 'Spanish (Spain)',
  'it-IT': 'Italian',
  'pt-PT': 'Portuguese',
  'ru-RU': 'Russian',
  'pl-PL': 'Polish',
  'nl-NL': 'Dutch',
  'sv-SE': 'Swedish',
  
  // Americas (10)
  'es-MX': 'Spanish (Mexico)',
  'pt-BR': 'Portuguese (Brazil)',
  'en-CA': 'English (Canada)',
  'fr-CA': 'French (Canada)',
  'es-AR': 'Spanish (Argentina)',
  'es-CO': 'Spanish (Colombia)',
  'es-CL': 'Spanish (Chile)',
  'es-PE': 'Spanish (Peru)',
  'en-AU': 'English (Australia)',
  'es-VE': 'Spanish (Venezuela)',
};

export const useVoiceCommands = (enabled: boolean = true, selectedLanguage: string = 'en-US') => {
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
    recognitionInstance.lang = selectedLanguage;

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
  }, [enabled, navigate, toast, selectedLanguage]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    commands,
  };
};
