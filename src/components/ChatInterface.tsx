import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Paperclip, X, History, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AIModeSelector } from "./AIModeSelector";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Message = { 
  role: "user" | "assistant"; 
  content: string;
  images?: string[]; // base64 encoded images
};
type AIMode = "casual" | "interview" | "viva" | "notes" | "study_plan";

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>("casual");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, [mode]);

  const loadChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const groupedHistory = data?.reduce((acc: any[], msg) => {
        const date = new Date(msg.created_at).toLocaleDateString();
        const existing = acc.find(g => g.date === date);
        if (existing) {
          existing.messages.push(msg);
        } else {
          acc.push({ date, messages: [msg] });
        }
        return acc;
      }, []) || [];

      setChatHistory(groupedHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "Maximum 5 files allowed",
        variant: "destructive",
      });
      return;
    }
    
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isImage && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only images under 10MB are supported",
        variant: "destructive",
      });
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateImage = async () => {
    if (!input.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe the image you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    const prompt = input;
    setInput("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` })
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate an image: ${prompt}` }],
          mode: "image_generation",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const data = await response.json();
      
      if (data.imageUrl) {
        const imageMessage: Message = {
          role: "assistant",
          content: `Generated image: ${prompt}`,
          images: [data.imageUrl]
        };
        setMessages(prev => [...prev, { role: "user", content: `Generate: ${prompt}` }, imageMessage]);
        
        toast({
          title: "Image generated!",
          description: "Your study diagram is ready",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const loadHistoryMessages = (historyMessages: any[]) => {
    const userMessages = historyMessages.filter(m => m.role === 'user');
    const assistantMessages = historyMessages.filter(m => m.role === 'assistant');
    
    const reconstructed: Message[] = [];
    const maxLength = Math.max(userMessages.length, assistantMessages.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (userMessages[i]) {
        reconstructed.push({ role: 'user', content: userMessages[i].content });
      }
      if (assistantMessages[i]) {
        reconstructed.push({ role: 'assistant', content: assistantMessages[i].content });
      }
    }
    
    setMessages(reconstructed);
    setShowHistory(false);
    toast({
      title: "History loaded",
      description: "Previous conversation restored",
    });
  };

  const sendMessage = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    // Convert images to base64
    const imagePromises = uploadedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const images = await Promise.all(imagePromises);
    const userMessage: Message = { 
      role: "user", 
      content: input || "What do you see in these images?",
      images: images.length > 0 ? images : undefined
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check for quota exceeded error
        if (response.status === 402 || errorData.error?.includes('quota') || errorData.error?.includes('insufficient_quota')) {
          throw new Error('AI quota exceeded. Please add credits to your OpenAI account or check your billing settings.');
        }
        
        // Check for rate limit error
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("Failed to get response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantContent && session?.user) {
        await supabase.from('chat_messages').insert({
          user_id: session.user.id,
          role: 'assistant',
          content: assistantContent,
        });
      }
      
      loadChatHistory();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <AIModeSelector selectedMode={mode} onModeChange={setMode} />
          
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Chat History</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              {chatHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No chat history yet</p>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((group, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold mb-2">{group.date}</h4>
                      <div className="space-y-2">
                        {group.messages.map((msg: any) => (
                          <div
                            key={msg.id}
                            className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted"
                            onClick={() => loadHistoryMessages(group.messages)}
                          >
                            <p className="text-sm font-medium capitalize">{msg.role}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {msg.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
        </div>
        
        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-muted/30 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Powered by <span className="text-primary font-semibold">Google Gemini 2.5</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">👋 Hi! I'm your AI study companion</p>
            <p className="text-sm">Start chatting or upload images for analysis!</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.images && message.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {message.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Uploaded ${idx + 1}`}
                      className="rounded max-h-40 object-cover"
                    />
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t space-y-2">
        {uploadedFiles.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name}
                  className="rounded w-full h-20 object-cover"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={uploadedFiles.length > 0 ? "Ask about the images..." : "Type your message..."}
          className="min-h-[80px]"
          disabled={isLoading}
        />
        
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || uploadedFiles.length >= 5}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              {uploadedFiles.length > 0 ? `${uploadedFiles.length} Image${uploadedFiles.length > 1 ? 's' : ''}` : 'Add Images'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={generateImage}
              disabled={isLoading || isGeneratingImage || !input.trim()}
            >
              {isGeneratingImage ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Image
            </Button>
          </div>
          
          <Button onClick={sendMessage} disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};
