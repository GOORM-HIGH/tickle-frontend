import React, { useState, useEffect } from 'react';
import { NotificationBadge } from './NotificationBadge';
import { chatService } from '../../services/chatService';
import type { ChatRoom } from '../../services/chatService';

interface Props {
  chatRooms: ChatRoom[];
  onOpenChatRoom: (room: ChatRoom) => void;
  onJoinChatRoom: (performanceId: number) => void;
  currentUserId: number;
}

export const EnhancedChatRoomList: React.FC<Props> = ({
  chatRooms,
  onOpenChatRoom,
  onJoinChatRoom,
  currentUserId
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'unread' | 'name'>('recent');

  // 채팅방 정렬 (중복 제거 포함)
  const getSortedRooms = () => {
    // 중복 제거 (chatRoomId 기준)
    const uniqueRooms = chatRooms.filter((room, index, self) => 
      index === self.findIndex(r => r.chatRoomId === room.chatRoomId)
    );
    
    console.log('🔍 원본 채팅방 개수:', chatRooms.length);
    console.log('🔍 중복 제거 후 채팅방 개수:', uniqueRooms.length);
    
    const sorted = [...uniqueRooms];
    
    switch (sortBy) {
      case 'unread':
        return sorted.sort((a, b) => {
          const aUnread = a.unreadMessageCount || 0;
          const bUnread = b.unreadMessageCount || 0;
          return bUnread - aUnread;
        });
      case 'name':
        return sorted.sort((a, b) => 
          (a.name || `채팅방 ${a.chatRoomId}`).localeCompare(b.name || `채팅방 ${b.chatRoomId}`)
        );
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          const aLastMessage = a.lastMessage?.createdAt || '0';
          const bLastMessage = b.lastMessage?.createdAt || '0';
          return new Date(bLastMessage).getTime() - new Date(aLastMessage).getTime();
        });
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const handleRoomClick = (room: ChatRoom) => {
    setSelectedRoomId(room.chatRoomId);
    onOpenChatRoom(room);
  };

  const sortedRooms = getSortedRooms();

  return (
    <div style={{ padding: '20px' }}>
      {/* 정렬 옵션 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 10px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>내 채팅방 ({chatRooms.length})</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'unread' | 'name')}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="recent">최근 메시지순</option>
          <option value="unread">읽지 않은 메시지순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      {sortedRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>참여한 채팅방이 없습니다</h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            예매한 공연의 채팅방에 참여해보세요!
          </p>
          <button
            onClick={() => onJoinChatRoom(0)} // 예매 내역 페이지로 이동
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📋 채팅 참여하러 가기
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedRooms.map((room) => {
            // 백엔드에서 계산된 unreadMessageCount 사용
            const unreadCount = room.unreadMessageCount || 0;
            const isSelected = selectedRoomId === room.chatRoomId;
            
            return (
              <div
                key={room.chatRoomId}
                onClick={() => handleRoomClick(room)}
                style={{
                  padding: '16px',
                  border: isSelected ? '2px solid #007bff' : '1px solid #eee',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#f0f8ff' : 'white',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,123,255,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isSelected 
                    ? '0 2px 8px rgba(0,123,255,0.2)' 
                    : '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                {/* 알림 배지 */}
                <NotificationBadge 
                  count={unreadCount} 
                  showAnimation={false}
                  size="medium"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: '16px',
                        fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                        color: unreadCount > 0 ? '#333' : '#666'
                      }}>
                        {room.name || `채팅방 ${room.chatRoomId}`}
                      </h4>
                                             {room.status === false && (
                         <span style={{
                           backgroundColor: '#dc3545',
                           color: 'white',
                           fontSize: '10px',
                           padding: '2px 6px',
                           borderRadius: '8px'
                         }}>
                           비활성
                         </span>
                       )}
                       {room.lastMessage?.isDeleted && (
                         <span style={{
                           backgroundColor: '#6c757d',
                           color: 'white',
                           fontSize: '10px',
                           padding: '2px 6px',
                           borderRadius: '8px'
                         }}>
                           삭제됨
                         </span>
                       )}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>
                      👥 {room.participantCount || 0}명 참여 중
                      {room.maxParticipants && (
                        <span style={{ marginLeft: '8px', color: '#999' }}>
                          (최대 {room.maxParticipants}명)
                        </span>
                      )}
                    </div>

                    {room.lastMessage && (
                      <div style={{
                        fontSize: '13px',
                        color: unreadCount > 0 ? '#333' : '#999',
                        fontWeight: unreadCount > 0 ? '500' : 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                          {room.lastMessage.senderNickname}
                        </span>
                        <span style={{ color: '#999' }}>:</span>
                        <span style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '200px'
                        }}>
                          {room.lastMessage.content}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px'
                  }}>
                    {room.lastMessage && (
                      <div style={{
                        fontSize: '11px',
                        color: '#999'
                      }}>
                        {formatLastMessageTime(room.lastMessage.createdAt)}
                      </div>
                    )}
                    
                    {unreadCount > 0 && (
                      <div style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 