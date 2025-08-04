export interface ChatRoom {
  chatRoomId: number;
  name: string;
  participantCount: number;
  unreadCount?: number;
  lastMessage?: ChatMessage;
}

export interface ChatMessage {
  id: number;
  chatRoomId: number;
  memberId: number;
  messageType: string;
  content: string;
  createdAt: string;
  senderNickname: string;
  isMyMessage: boolean;
}
