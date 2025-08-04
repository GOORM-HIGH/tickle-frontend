// 채팅방 목록 모달

import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Users, ChevronRight } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { chatService } from '../services/chatService';

const ChatListModal: React.FC = () => {
  const { 
    isChatListOpen, 
    toggleChatList, 
    myRooms, 
    setMyRooms, 
    setCurrentRoom,
    toggleChatRoom 
  } = useChatStore();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isChatListOpen) {
      loadMyRooms();
    }
  }, [isChatListOpen]);

  const loadMyRooms = async () => {
    try {
      const rooms = await chatService.getMyRooms();
      setMyRooms(rooms);
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: any) => {
    setCurrentRoom(room);
    toggleChatRoom();
  };

  const goToReservations = () => {
    toggleChatList();
    // 실제로는 라우터로 예매내역 페이지 이동
    alert('예매내역 페이지로 이동합니다 (구현 예정)');
  };

  if (!isChatListOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>💬 내 채팅방</h2>
            <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
              참여 중인 채팅방 {myRooms.length}개
            </p>
          </div>
          <button
            onClick={toggleChatList}
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

        {/* 내용 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              채팅방 목록을 불러오는 중...
            </div>
          ) : myRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <MessageSquare size={48} color="#ccc" style={{ marginBottom: '20px' }} />
              <h3 style={{ color: '#666', marginBottom: '10px' }}>
                참여한 채팅방이 없습니다
              </h3>
              <p style={{ color: '#999', marginBottom: '30px' }}>
                예매한 공연의 채팅방에 참여해보세요!
              </p>
              <button
                onClick={goToReservations}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                예매내역 보기
              </button>
            </div>
          ) : (
            <div>
              {myRooms.map((room) => (
                <div
                  key={room.chatRoomId}
                  onClick={() => handleRoomSelect(room)}
                  style={{
                    padding: '16px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#007bff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#eee';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                        {room.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#666' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={16} />
                          {room.participantCount || 0}명
                        </span>
                        <span>{room.status ? '활성' : '비활성'}</span>
                      </div>
                      {room.lastMessage && (
                        <p style={{ 
                          margin: '8px 0 0 0', 
                          fontSize: '14px', 
                          color: '#999',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {room.lastMessage.senderNickname}: {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {room.unreadCount && room.unreadCount > 0 && (
                        <span style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          {room.unreadCount}
                        </span>
                      )}
                      <ChevronRight size={20} color="#ccc" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListModal;
