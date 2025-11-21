import { useState } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

export const VoiceAssistant = () => {
  const [agentId, setAgentId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      toast({
        title: "Connected",
        description: "Voice assistant is ready to talk!",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      toast({
        title: "Disconnected",
        description: "Voice assistant session ended",
      });
    },
    onMessage: (message) => {
      console.log("Message received:", message);
    },
    onError: (error) => {
      console.error("Voice assistant error:", error);
      toast({
        title: "Error",
        description: "Voice assistant encountered an error",
        variant: "destructive",
      });
    },
  });

  const startConversation = async () => {
    if (!agentId.trim()) {
      toast({
        title: "Agent ID required",
        description: "Please enter your ElevenLabs Agent ID",
        variant: "destructive",
      });
      return;
    }

    // Validate that it's not an API key
    if (agentId.startsWith('sk_')) {
      toast({
        title: "Invalid Agent ID",
        description: "This looks like an API key. Please enter the Agent ID instead (e.g., 9BWtsMINqrJLrRacOk9x)",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-session', {
        body: { agentId }
      });

      if (error) throw error;

      if (data?.signedUrl) {
        await conversation.startSession({ signedUrl: data.signedUrl });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = async () => {
    await conversation.endSession();
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    await conversation.setVolume({ volume: isMuted ? 0 : newVolume });
  };

  const toggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    await conversation.setVolume({ volume: newMutedState ? 0 : volume });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic className="w-8 h-8" />
            Voice Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Have natural conversations with your AI study companion
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <Volume2 className="w-3 h-3 mr-1" />
          ElevenLabs AI
        </Badge>
      </div>

      <Card className="p-6 space-y-6">
        {conversation.status === "disconnected" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ElevenLabs Agent ID
              </label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Enter your agent ID"
                className="w-full px-4 py-2 border rounded-md bg-background"
              />
              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-2 text-foreground">Setup Instructions:</p>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>
                    Visit{" "}
                    <a
                      href="https://elevenlabs.io/app/conversational-ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      ElevenLabs Conversational AI
                    </a>
                  </li>
                  <li>Create a new Conversational AI agent</li>
                  <li>Copy the <strong>Agent ID</strong> from your agent (short alphanumeric code)</li>
                  <li>Paste it above (e.g., <code className="bg-background px-1 py-0.5 rounded">9BWtsMINqrJLrRacOk9x</code>)</li>
                </ol>
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    ⚠️ <strong>Note:</strong> Enter your Agent ID, not your API key (API keys start with "sk_")
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={startConversation}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Conversation
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={conversation.isSpeaking ? "default" : "secondary"} className="text-lg py-2 px-4">
                  {conversation.isSpeaking ? (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Speaking...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Listening...
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Volume</label>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                disabled={isMuted}
              />
            </div>

            <div className="flex items-center justify-center py-12">
              <div className={`w-32 h-32 rounded-full ${conversation.isSpeaking ? 'bg-primary/20 animate-pulse' : 'bg-muted'} flex items-center justify-center`}>
                <Mic className={`w-16 h-16 ${conversation.isSpeaking ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>

            <Button
              onClick={endConversation}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <MicOff className="w-4 h-4 mr-2" />
              End Conversation
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Speak naturally - the AI will respond with voice</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">Tips for better conversations:</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Speak clearly and at a normal pace</li>
          <li>• Use a good microphone for better recognition</li>
          <li>• Minimize background noise</li>
          <li>• Wait for the AI to finish speaking before responding</li>
          <li>• Ask specific questions for better answers</li>
        </ul>
      </Card>
    </div>
  );
};
