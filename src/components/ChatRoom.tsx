import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { chatAPI } from '../services/api';
import MessageInput from './MessageInput';

interface Props {
  user: any;
  onLogout: () => void;
}

const ChatRoom: React.FC<Props> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const CHAT_ROOM_ID = 1; // 임시로 채팅방 ID 1번 사용

  useEffect(() => {
    joinRoomAndLoadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const joinRoomAndLoadMessages = async () => {
    try {
      // 채팅방 참여
      await chatAPI.joinRoom(CHAT_ROOM_ID);
      
      // 메시지 목록 로드
      const messageData = await chatAPI.getMessages(CHAT_ROOM_ID);
      setMessages(messageData.messages || []);
    } catch (error) {
      console.error('채팅방 로드 실패:', error);
      alert('채팅방 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      const newMessage = await chatAPI.sendMessage(CHAT_ROOM_ID, content);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>채팅방을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2>🎭 티클 채팅방</h2>
        <div>
          <span style={{ marginRight: '15px' }}>
            안녕하세요, {user.nickname}님!
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: '5px 15px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
            <p>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: message.isMyMessage ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '10px 15px',
                borderRadius: '18px',
                backgroundColor: message.isMyMessage ? '#007bff' : 'white',
                color: message.isMyMessage ? 'white' : 'black',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {!message.isMyMessage && (
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '5px',
                    opacity: 0.8
                  }}>
                    {message.senderNickname}
                  </div>
                )}
                <div>{message.content}</div>
                <div style={{
                  fontSize: '11px',
                  marginTop: '5px',
                  opacity: 0.7
                }}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;
