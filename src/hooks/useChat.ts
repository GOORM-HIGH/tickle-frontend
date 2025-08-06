import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import type { ChatRoom } from '../services/chatService';

export const useChat = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyChatRooms = async () => {
    setLoading(true);
    try {
      console.log('🔍 채팅방 목록 로드 시작');
      const rooms = await chatService.getMyRooms();
      console.log('🔍 백엔드에서 받은 채팅방 데이터:', rooms);
      
      // 🎯 중복 제거 (chatRoomId 기준)
      const uniqueRooms = rooms.filter((room, index, self) => 
        index === self.findIndex(r => r.chatRoomId === room.chatRoomId)
      );
      
      console.log('🔍 중복 제거 후 채팅방 데이터:', uniqueRooms);
      setChatRooms(uniqueRooms);
    } catch (error) {
      console.error('🔍 채팅방 목록 로드 실패:', error);
      // 오류 시 빈 배열로 설정
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 로그인 상태 확인 후 채팅방 로드
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadMyChatRooms();
    }
  }, []);

  // 🎯 실제 API를 호출해서 읽지 않은 메시지 개수 계산
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // 채팅방별 읽지 않은 메시지 개수 계산 (백엔드 수정 후)
  useEffect(() => {
    const calculateTotalUnreadCount = async () => {
      if (chatRooms.length === 0) {
        setTotalUnreadCount(0);
        return;
      }

      try {
        let total = 0;
        for (const room of chatRooms) {
          try {
            const response = await chatService.getUnreadCount(room.chatRoomId);
            total += response.unreadCount;
            console.log(`🔍 채팅방 ${room.chatRoomId}: 읽지 않은 메시지 ${response.unreadCount}개 (백엔드 수정 후)`);
          } catch (error: any) {
            console.warn(`채팅방 ${room.chatRoomId} 읽지 않은 메시지 개수 조회 실패:`, error);
            // 🎯 API 에러 시 기본값 사용
            total += 0;
          }
        }
        console.log(`🔍 전체 읽지 않은 메시지 개수: ${total} (백엔드 수정 후)`);
        setTotalUnreadCount(total);
      } catch (error: any) {
        console.error('전체 읽지 않은 메시지 개수 계산 실패:', error);
        setTotalUnreadCount(0);
      }
    };

    // 🎯 초기 로드만 실행 (주기적 업데이트 비활성화)
    calculateTotalUnreadCount();
    
    // 🎯 주기적 업데이트 비활성화 (API 에러 방지)
    // const interval = setInterval(calculateTotalUnreadCount, 10000);
    // return () => clearInterval(interval);
  }, [chatRooms]);

  return { 
    chatRooms, 
    totalUnreadCount, 
    loading,
    loadMyChatRooms
  };
};
