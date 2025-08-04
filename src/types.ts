// 타입 정의

export interface ChatRoom {
  chatRoomId: number;
  performanceId: number;
  name: string;
  status: boolean;
  maxParticipants: number;
  participantCount?: number;
  unreadCount?: number;
  lastMessage?: ChatMessage;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  chatRoomId: number;
  memberId: number;
  messageType: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  content: string;
  createdAt: string;
  senderNickname: string;
  isMyMessage: boolean;
  filePath?: string;
  fileName?: string;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

export interface Reservation {
  id: number;
  performanceId: number;
  performanceTitle: string;
  reservationDate: string;
  hasJoinedChat: boolean;
}
