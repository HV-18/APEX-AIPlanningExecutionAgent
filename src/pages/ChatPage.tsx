import { MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";
import { BackButton } from "@/components/BackButton";
import { useTranslation } from "react-i18next";

const ChatPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <BackButton to="/dashboard" />
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            {t('chat')}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Ask me anything about your studies, doubts, or just chat casually!
        </p>
      </div>

      <ChatInterface />
    </div>
  );
};

export default ChatPage;
