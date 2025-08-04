// 우측 하단 플로팅 버튼

import React from 'react';
import { useChatStore } from '../stores/chatStore';

const FloatingChatButton: React.FC = () => {
  const { toggleChatList, isChatListOpen } = useChatStore();

  const handleClick = () => {
    console.log('🔵 버튼 클릭됨!');
    console.log('🔵 현재 isChatListOpen:', isChatListOpen);
    
    toggleChatList();
    
    // 상태 변경 후 다시 확인 (비동기이므로 약간 지연)
    setTimeout(() => {
      console.log('🔵 변경 후 isChatListOpen:', useChatStore.getState().isChatListOpen);
    }, 100);
  };

  console.log('🔵 FloatingChatButton 렌더링, isChatListOpen:', isChatListOpen);

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        backgroundColor: isChatListOpen ? '#28a745' : '#007bff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '24px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
        border: '2px solid white',
        color: 'white',
        transition: 'all 0.3s ease'
      }}
    >
      💬
    </div>
  );
};

export default FloatingChatButton;
