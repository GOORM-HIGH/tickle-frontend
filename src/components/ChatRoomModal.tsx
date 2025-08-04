// 채팅방 UI

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Users } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { chatService } from '../services/chatService';
import { websocketService } from '../services/websocketService';

const ChatRoomModal: React.FC = () => {
  const { 
    isChatRoomOpen, 
    toggleChatRoom, 
    currentRoom, 
    messages, 
    setMessages, 
    addMessage,
    user,
    setConnected 
  } = useChatStore();
  
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatRoomOpen && currentRoom) {
      loadMessages();
      connectWebSocket();
    }
    
    return () => {
      websocketService.disconnect();
      setConnected(false);
    };
  }, [isChatRoomOpen, currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!currentRoom) return;
    
    try {
      const roomMessages = await chatService.getMessages(currentRoom.chatRoomId);
      setMessages(roomMessages);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!currentRoom || !user) return;
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      websocketService.connect(
        currentRoom.chatRoomId, 
        token, 
        (message) => {
          addMessage(message);
        }
      );
      setConnected(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentRoom) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      // REST API로 메시지 전송
      await chatService.sendMessage(currentRoom.chatRoomId, content);
      
      // WebSocket으로도 전송 (실시간 업데이트용)
      websocketService.sendMessage({
        messageType: 'TEXT',
        content,
        chatRoomId: currentRoom.chatRoomId
      });
      
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setMessageInput(content); // 실패 시 입력 복원
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isChatRoomOpen || !currentRoom) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px 12px 0 0'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>{currentRoom.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <Users size={16} color="#666" />
              <span style={{ fontSize: '14px', color: '#666' }}>
                {currentRoom.participantCount || 0}명 참여 중
              </span>
              {user && (
                <>
                  <span style={{ color: '#ccc' }}>•</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {user.nickname}님으로 접속
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={toggleChatRoom}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* 메시지 영역 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8f9fa'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              메시지를 불러오는 중...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
              <p>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: message.isMyMessage ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: message.isMyMessage ? '#007bff' : 'white',
                    color: message.isMyMessage ? 'white' : 'black',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: message.isMyMessage ? 'none' : '1px solid #eee'
                  }}>
                    {!message.isMyMessage && (
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '6px',
                        opacity: 0.8,
                        color: '#007bff'
                      }}>
                        {message.senderNickname}
                      </div>
                    )}
                    <div style={{ lineHeight: '1.4' }}>{message.content}</div>
                    <div style={{
                      fontSize: '11px',
                      marginTop: '6px',
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 메시지 입력 */}
        <form onSubmit={handleSendMessage} style={{
          padding: '16px',
          borderTop: '1px solid #eee',
          backgroundColor: 'white',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#007bff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd';
            }}
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            style={{
              padding: '12px 16px',
              backgroundColor: messageInput.trim() ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '80px',
              justifyContent: 'center'
            }}
          >
            <Send size={16} />
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoomModal;
