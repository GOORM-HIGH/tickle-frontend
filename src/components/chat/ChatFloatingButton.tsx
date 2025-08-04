import React from 'react';

interface Props {
  onClick: () => void;
  unreadCount: number;
}

export const ChatFloatingButton: React.FC<Props> = ({ onClick, unreadCount }) => (
  <div
    onClick={onClick}
    style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '60px',
      height: '60px',
      backgroundColor: '#007bff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '24px',
      zIndex: 1000,
      color: 'white',
      boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
    }}
  >
    💬
    {unreadCount > 0 && (
      <span style={{
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: '#dc3545',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </div>
);
