import { create } from 'zustand';

interface ChatStore {
  isOpen: boolean;
  activeConversationId: string | null;
  setIsOpen: (isOpen: boolean) => void;
  setActiveConversationId: (id: string | null) => void;
  openChatWithConversation: (id: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  activeConversationId: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  openChatWithConversation: (id) => set({ isOpen: true, activeConversationId: id }),
}));
