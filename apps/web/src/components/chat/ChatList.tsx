'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  type: string;
  participants: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    }
  }[];
  messages: {
    content: string;
    createdAt: string;
  }[];
  updatedAt: string;
}

export function ChatList({ onSelectConversation }: { onSelectConversation: (id: string) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { accessToken, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await apiClient('/chat/conversations');
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading chats...</div>;

  if (conversations.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>;
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="flex flex-col">
        {conversations.map((conv) => {
          const otherParticipant = conv.participants.find(p => p.user.id !== user?.id)?.user;
          const lastMessage = conv.messages?.[0]; 
          
          if (!otherParticipant) return null;

          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b last:border-0"
            >
              <Avatar>
                <AvatarImage src={otherParticipant.avatar} />
                <AvatarFallback>{otherParticipant.firstName[0]}{otherParticipant.lastName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold truncate text-sm">{otherParticipant.firstName} {otherParticipant.lastName}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {lastMessage?.content || 'No messages'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
