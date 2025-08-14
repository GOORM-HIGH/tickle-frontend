import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { ChatRoom } from '../../components/chat/ChatRoom';
import { chatService } from '../../services/chatService';
import type { ChatRoomType, ChatMessage } from '../../types/chat';

export const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { chatRooms, loadMyChatRooms } = useChat();
  
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) {
        setError('채팅방 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const roomData = await chatService.getChatRoomById(parseInt(roomId));
        setRoom(roomData);
      } catch (err) {
        console.error('채팅방 로드 실패:', err);
        setError('채팅방을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId]);

  const handleClose = () => {
    navigate('/chat');
  };

  const handleMessageUpdate = (messageId: number, updatedMessage: ChatMessage) => {
    // 메시지 업데이트 처리
    console.log('메시지 업데이트:', messageId, updatedMessage);
  };

  const handleMessageDelete = (messageId: number) => {
    // 메시지 삭제 처리
    console.log('메시지 삭제:', messageId);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '20px'
      }}>
        <p style={{ color: 'red' }}>{error || '채팅방을 찾을 수 없습니다.'}</p>
        <button
          onClick={() => navigate('/chat')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          채팅 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ChatRoom
        room={room}
        currentUserId={currentUser?.id || 0}
        currentUserNickname={currentUser?.nickname || ""}
        onClose={handleClose}
        onMessageUpdate={handleMessageUpdate}
        onMessageDelete={handleMessageDelete}
      />
    </div>
  );
};

export default ChatRoomPage; 