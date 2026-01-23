'use client';

import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export function ChatWindow({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const { socket, sendMessage, joinRoom } = useChat();
  const { user, accessToken } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    joinRoom(conversationId);

    const fetchMessages = async () => {
      try {
        const res = await apiClient(`/chat/conversations/${conversationId}/messages`);
        if (res.ok) {
          const data = await res.json();
          // Assume API returns newest first (DESC), so we reverse to show oldest at top
          setMessages(data.reverse()); 
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, joinRoom]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      // Check if message belongs to current conversation
      // The msg object might have conversation object or just ID depending on backend return
      const msgConvId = msg.conversationId || (msg as any).conversation?.id;
      
      if (msgConvId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(conversationId, inputValue);
    setInputValue('');
  };

  if (loading) return <div className="p-4 text-center">Loading messages...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-sm">Chat</span>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {!isMe && msg.sender && (
                    <p className="text-xs text-muted-foreground mb-1 font-medium">{msg.sender.firstName}</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-[10px] opacity-70 block text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t flex gap-2">
        <Input 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
