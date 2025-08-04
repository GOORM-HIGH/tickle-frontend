// 채팅 상태 관리

import { create } from 'zustand';

interface ChatState {
  isChatListOpen: boolean;
  toggleChatList: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isChatListOpen: false,
  toggleChatList: () => set(state => ({ 
    isChatListOpen: !state.isChatListOpen 
  })),
}));
