'use client';

import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { useChat } from '@/context/ChatContext';
import { useChatStore } from '@/lib/chat-store';

export function ChatWidget() {
  const { isOpen, setIsOpen, activeConversationId, setActiveConversationId } = useChatStore();
  const { isConnected } = useChat();

  if (!isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <CardHeader className="p-3 border-b flex flex-row justify-between items-center space-y-0">
            <CardTitle className="text-base font-bold">
              {activeConversationId ? 'Chat' : 'Messages'}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            {activeConversationId ? (
              <ChatWindow 
                conversationId={activeConversationId} 
                onBack={() => setActiveConversationId(null)} 
              />
            ) : (
              <ChatList onSelectConversation={setActiveConversationId} />
            )}
          </CardContent>
        </Card>
      ) : (
        <Button 
          className="h-14 w-14 rounded-full shadow-xl" 
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
