// 백엔드 API 연결

import api from './api';

export interface ChatRoom {
  chatRoomId: number;
  performanceId: number;
  name: string;
  status: boolean;
  maxParticipants: number;
  participantCount?: number;
  unreadCount?: number;
  lastMessage?: {
    id: number;
    content: string;
    senderNickname: string;
    createdAt: string;
  };
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
}

export const chatService = {
  // 내 채팅방 목록
  getMyRooms: async (): Promise<ChatRoom[]> => {
    const response = await api.get<{data: ChatRoom[]}>('/api/v1/chat/participants/my-rooms');
    return response.data.data;
  },

  // 채팅방 정보
  getChatRoomById: async (chatRoomId: number): Promise<ChatRoom> => {
    const response = await api.get<{data: ChatRoom}>(`/api/v1/chat/rooms/${chatRoomId}`);
    return response.data.data;
  },

  // 메시지 목록 조회
  getMessages: async (chatRoomId: number, page: number = 0, size: number = 50): Promise<ChatMessage[]> => {
    const response = await api.get(`/api/v1/chat/rooms/${chatRoomId}/messages`, {
      params: { page, size }
    });
    return response.data.data.messages || [];
  },

  // 메시지 전송
  sendMessage: async (chatRoomId: number, content: string): Promise<ChatMessage> => {
    const response = await api.post<{data: ChatMessage}>(`/api/v1/chat/rooms/${chatRoomId}/messages`, {
      messageType: 'TEXT',
      content
    });
    return response.data.data;
  },

  // 채팅방 참여
  joinChatRoom: async (chatRoomId: number): Promise<void> => {
    await api.post(`/api/v1/chat/participants/rooms/${chatRoomId}/join`, {
      message: "채팅방에 참여했습니다."
    });
  },

  getChatRoomByPerformance: async (performanceId: number): Promise<ChatRoom> => {
      console.log('🔥 API 호출: getChatRoomByPerformance', performanceId);
      const response = await api.get<{data: ChatRoom}>(`/api/v1/chat/rooms/performance/${performanceId}`);
      return response.data.data;
    },

};
