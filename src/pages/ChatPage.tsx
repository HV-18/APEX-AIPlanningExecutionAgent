import { MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";

const ChatPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="w-8 h-8" />
          AI Chat
        </h1>
        <p className="text-muted-foreground mt-1">
          Ask me anything about your studies, doubts, or just chat casually!
        </p>
      </div>

      <ChatInterface />
    </div>
  );
};

export default ChatPage;
