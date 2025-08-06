import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';

interface ReadStatus {
  [chatRoomId: number]: {
    lastReadMessageId: number;
    lastReadAt: string;
    unreadCount: number;
    // ERD의 Chat_participants 테이블 필드들
    participantStatus?: boolean; // chat_participants_status
    joinedAt?: string; // chat_participants_joined_at
  };
}

export const useReadStatus = () => {
  const [readStatus, setReadStatus] = useState<ReadStatus>({});

  // 마지막 읽은 메시지 업데이트
  const updateLastRead = useCallback(async (chatRoomId: number, messageId: number) => {
    try {
      await chatService.markAsRead(chatRoomId, messageId);
      
      setReadStatus(prev => ({
        ...prev,
        [chatRoomId]: {
          lastReadMessageId: messageId,
          lastReadAt: new Date().toISOString(),
          unreadCount: 0
        }
      }));
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  }, []);

  // 읽지 않은 메시지 개수 조회
  const getUnreadCount = useCallback(async (chatRoomId: number) => {
    try {
      const response = await chatService.getUnreadCount(chatRoomId);
      setReadStatus(prev => ({
        ...prev,
        [chatRoomId]: {
          ...prev[chatRoomId],
          unreadCount: response.unreadCount
        }
      }));
      return response.unreadCount;
    } catch (error) {
      console.error('읽지 않은 메시지 개수 조회 실패:', error);
      return 0;
    }
  }, []);

  // 채팅방별 읽음 상태 초기화 (API 오류 시 기본값 사용)
  const initializeReadStatus = useCallback(async (chatRoomId: number) => {
    // 이미 초기화된 채팅방은 건너뛰기
    if (readStatus[chatRoomId]) {
      return;
    }
    
    try {
      const response = await chatService.getUnreadCount(chatRoomId);
      setReadStatus(prev => ({
        ...prev,
        [chatRoomId]: {
          lastReadMessageId: 0,
          lastReadAt: new Date().toISOString(),
          unreadCount: response.unreadCount
        }
      }));
    } catch (error) {
      console.warn(`읽음 상태 초기화 실패 (채팅방 ${chatRoomId}):`, error);
      // 오류 시에도 기본 상태 설정
      setReadStatus(prev => ({
        ...prev,
        [chatRoomId]: {
          lastReadMessageId: 0,
          lastReadAt: new Date().toISOString(),
          unreadCount: 0
        }
      }));
    }
  }, [readStatus]);

  // 새 메시지 수신 시 읽지 않은 메시지 개수 증가
  const incrementUnreadCount = useCallback((chatRoomId: number) => {
    setReadStatus(prev => ({
      ...prev,
      [chatRoomId]: {
        ...prev[chatRoomId],
        unreadCount: (prev[chatRoomId]?.unreadCount || 0) + 1
      }
    }));
  }, []);

  return {
    readStatus,
    updateLastRead,
    getUnreadCount,
    initializeReadStatus,
    incrementUnreadCount
  };
}; 