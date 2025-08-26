import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { getAccessToken } from '../utils/tokenUtils';
import type { ChatRoom } from '../services/chatService';

export const useChat = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyChatRooms = async () => {
    setLoading(true);
    try {
      console.log('🔍 채팅방 목록 로드 시작');
      console.log('🔍 현재 토큰:', getAccessToken() ? '토큰 있음' : '토큰 없음');
      const rooms = await chatService.getMyRooms();
      console.log('🔍 백엔드에서 받은 채팅방 데이터:', rooms);
      
          // 중복 제거 (chatRoomId 기준)
    const uniqueRooms = rooms.filter((room, index, self) => 
      index === self.findIndex(r => r.chatRoomId === room.chatRoomId)
    );
      
      // unreadMessageCount 필드가 없으면 테스트용 값 설정
      const processedRooms = uniqueRooms.map(room => {
        console.log(`채팅방 ${room.chatRoomId} 원본 데이터:`, room);
        console.log(`채팅방 ${room.chatRoomId} unreadMessageCount 값:`, room.unreadMessageCount);
        
        if (room.unreadMessageCount === undefined || room.unreadMessageCount === null) {
          console.log(`채팅방 ${room.chatRoomId}에 unreadMessageCount 필드가 없음 - 0으로 설정`);
          return { ...room, unreadMessageCount: 0 };
        }
        return room;
      });
      
      console.log('중복 제거 후 채팅방 데이터:', processedRooms);
      setChatRooms(processedRooms);
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
      // API 실패 시 빈 배열로 설정 (테스트 데이터 제거)
      console.log('API 실패로 인해 빈 채팅방 목록 설정');
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // 로그인 상태 확인 후 채팅방 로드
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      loadMyChatRooms();
    }
  }, []);

  // 실제 API를 호출해서 읽지 않은 메시지 개수 계산
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // 새 메시지 수신 시 읽지 않은 메시지 개수 증가
  const incrementUnreadCount = useCallback((chatRoomId: number) => {
    console.log(`읽지 않은 메시지 개수 증가: 채팅방 ${chatRoomId}`);
    setTotalUnreadCount(prev => prev + 1);
  }, []);

  // 채팅방 읽음 처리 시 읽지 않은 메시지 개수 감소
  const decrementUnreadCount = useCallback((chatRoomId: number, count: number = 1) => {
    console.log(`읽지 않은 메시지 개수 감소: 채팅방 ${chatRoomId}, 감소량 ${count}`);
    setTotalUnreadCount(prev => Math.max(0, prev - count));
  }, []);

  // 새 채팅방 추가
  const addChatRoom = useCallback((newRoom: ChatRoom) => {
    console.log(`➕ 새 채팅방 추가: ${newRoom.name}`);
    setChatRooms(prev => {
      // 중복 체크
      const isDuplicate = prev.some(room => room.chatRoomId === newRoom.chatRoomId);
      if (isDuplicate) {
        console.log(`⚠️ 채팅방 ${newRoom.chatRoomId}는 이미 존재함`);
        return prev;
      }
      return [...prev, newRoom];
    });
  }, []);

  // 채팅방 목록에서 읽지 않은 메시지 개수 계산 (백엔드에서 이미 계산된 값 사용)
  useEffect(() => {
    const calculateTotalUnreadCount = () => {
      console.log('읽지 않은 메시지 개수 계산 시작');
      console.log('현재 채팅방 개수:', chatRooms.length);
      console.log('채팅방 데이터:', chatRooms);
      
      if (chatRooms.length === 0) {
        console.log('채팅방이 없음 - totalUnreadCount를 0으로 설정');
        setTotalUnreadCount(0);
        return;
      }

      const total = chatRooms.reduce((sum, room) => {
        // 백엔드에서 계산된 unreadMessageCount 사용
        const unreadCount = room.unreadMessageCount || 0;
        console.log(`채팅방 ${room.chatRoomId}: 읽지 않은 메시지 ${unreadCount}개 (백엔드에서 계산)`);
        console.log(`채팅방 ${room.chatRoomId} 전체 데이터:`, room);
        return sum + unreadCount;
      }, 0);

      console.log(`전체 읽지 않은 메시지 개수: ${total} (백엔드에서 계산)`);
      setTotalUnreadCount(total);
    };

    calculateTotalUnreadCount();
  }, [chatRooms]);

  return { 
    chatRooms, 
    totalUnreadCount, 
    loading,
    loadMyChatRooms,
    incrementUnreadCount,  // 새 메시지 수신 시 증가
    decrementUnreadCount,  // 읽음 처리 시 감소
    addChatRoom            // 새 채팅방 추가
  };
};
