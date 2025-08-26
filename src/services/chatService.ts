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
  unreadMessageCount?: number;  // 백엔드 응답과 일치
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: {
    id: number;
    content: string;
    senderNickname: string;
    createdAt: string;
    isDeleted?: boolean;
    senderStatus?: boolean;
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
  isRead?: boolean;
  // ERD에 맞춘 추가 필드들
  isDeleted?: boolean;
  isEdited?: boolean;
  editedAt?: string;
  senderStatus?: boolean; // true: 활성 회원, false: 탈퇴 회원
  // 파일 관련 필드들
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
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
  joinChatRoom: async (performanceId: number): Promise<ChatRoom> => {
    try {
      // 1. 먼저 performanceId로 채팅방 정보 조회
      console.log('🔥 1단계: performanceId로 채팅방 조회', performanceId);
      const chatRoom = await chatService.getChatRoomByPerformance(performanceId);
      console.log('🔥 조회된 채팅방:', chatRoom);
      
      // 2. chatRoomId로 참여 API 호출
      console.log('🔥 2단계: chatRoomId로 참여 API 호출', chatRoom.chatRoomId);
      await api.post(`/api/v1/chat/participants/rooms/${chatRoom.chatRoomId}/join`, {
        message: "채팅방에 참여했습니다."
      });
      
      // 3. 참여 후 채팅방 정보 반환
      return chatRoom;
    } catch (error: any) {
      console.error('🔥 채팅방 참여 중 오류:', error);
      console.error('🔥 오류 상세:', error.response?.data);
      
      // 채팅방이 없는 경우 처리
      if (error.response?.status === 404) {
        console.log('🔥 채팅방이 존재하지 않음. 채팅방 생성 시도...');
        
        try {
          // 채팅방 생성 시도
          const createResponse = await api.post('/api/v1/chat/rooms', {
            performanceId: performanceId,
            roomName: `공연 ${performanceId} 채팅방`,
            maxParticipants: 100
          });
          
          console.log('🔥 채팅방 생성 성공:', createResponse.data);
          
          // 생성된 채팅방으로 다시 참여 시도
          const newChatRoom = createResponse.data.data;
          console.log('🔥 새로 생성된 채팅방으로 참여 시도:', newChatRoom.chatRoomId);
          
          await api.post(`/api/v1/chat/participants/rooms/${newChatRoom.chatRoomId}/join`, {
            message: "채팅방에 참여했습니다."
          });
          
          return newChatRoom;
        } catch (createError: any) {
          console.error('🔥 채팅방 생성 실패:', createError);
          throw new Error('채팅방 생성에 실패했습니다. 관리자에게 문의해주세요.');
        }
      }
      
      throw error;
    }
  },

  getChatRoomByPerformance: async (performanceId: number): Promise<ChatRoom> => {
      console.log('🔥 API 호출: getChatRoomByPerformance', performanceId);
      const response = await api.get<{data: ChatRoom}>(`/api/v1/chat/rooms/performance/${performanceId}`);
      return response.data.data;
    },

  // 메시지 삭제
  deleteMessage: async (chatRoomId: number, messageId: number): Promise<void> => {
    await api.delete(`/api/v1/chat/rooms/${chatRoomId}/messages/${messageId}`);
  },

  // 메시지 수정
  editMessage: async (chatRoomId: number, messageId: number, content: string): Promise<ChatMessage> => {
    const response = await api.put<{data: ChatMessage}>(`/api/v1/chat/rooms/${chatRoomId}/messages/${messageId}`, {
      content
    });
    return response.data.data;
  },

  // 읽음 처리 (ERD에 맞춰 last_read_message_id와 last_read_at 업데이트)
  markAsRead: async (chatRoomId: number, messageId: number): Promise<void> => {
    await api.patch(`/api/v1/chat/participants/rooms/${chatRoomId}/read`, {
      lastReadMessageId: messageId
    });
  },

  // 읽지 않은 메시지 개수 조회
  getUnreadCount: async (chatRoomId: number): Promise<{unreadCount: number}> => {
    try {
      const response = await api.get<{data: number}>(`/api/v1/chat/rooms/${chatRoomId}/messages/unread-count`);
      return { unreadCount: response.data.data };
    } catch (error) {
      console.warn(`⚠️ 읽지 않은 메시지 개수 조회 실패 (채팅방 ${chatRoomId}):`, error);
      // API 오류 시 기본값 반환
      return { unreadCount: 0 };
    }
  },

  // 파일 업로드
  uploadFile: async (file: File): Promise<{fileId: string; fileName: string; fileUrl: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{data: {fileId: string; fileName: string; fileUrl: string}}>('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // 파일 다운로드
  downloadFile: async (chatRoomId: number, messageId: number): Promise<Blob> => {
    const response = await api.get(`/api/v1/chat/rooms/${chatRoomId}/messages/${messageId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

};
