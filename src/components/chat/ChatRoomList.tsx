import React from 'react';
import { ChatRoom } from '../../services/chatService';

interface Props {
  chatRooms: ChatRoom[];
  onOpenReservation: () => void;
  onRoomClick?: (room: ChatRoom) => void;
}

export const ChatRoomList: React.FC<Props> = ({ chatRooms, onOpenReservation, onRoomClick }) => {
  return (
    <div style={{ padding: '20px' }}>
      {chatRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
          <h3 style={{ color: '#666' }}>참여한 채팅방이 없습니다</h3>
          <p style={{ color: '#999' }}>예매한 공연의 채팅방에 참여해보세요!</p>
          
          <button
            onClick={onOpenReservation}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            📋 채팅 참여하러 가기
          </button>
        </div>
      ) : (
        chatRooms.map((room) => (
          <div
            key={room.chatRoomId}
            onClick={() => onRoomClick && onRoomClick(room)}
            style={{
              padding: '16px',
              border: '1px solid #eee',
              borderRadius: '8px',
              marginBottom: '12px',
              cursor: 'pointer',
              backgroundColor: 'white',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <h4 style={{ margin: '0 0 8px 0' }}>{room.name}</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              👥 {room.participantCount || 0}명 참여 중
              {room.unreadCount && room.unreadCount > 0 && (
                <span style={{ 
                  marginLeft: '8px', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '10px', 
                  fontSize: '10px' 
                }}>
                  {room.unreadCount}
                </span>
              )}
            </p>
          </div>
        ))
      )}
    </div>
  );
};
