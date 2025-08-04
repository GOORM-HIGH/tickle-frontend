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
      setChatRooms(rooms);
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

  const totalUnreadCount = chatRooms.reduce((total, room) => total + (room.unreadCount || 0), 0);

  return { 
    chatRooms, 
    totalUnreadCount, 
    loading,
    loadMyChatRooms
  };
};
