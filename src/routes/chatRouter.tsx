import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatMainPage from '../pages/chat/ChatMainPage';
import ChatRoomPage from '../pages/chat/ChatRoomPage';
import ReservationPage from '../pages/chat/ReservationPage';

const ChatRouter: React.FC = () => {
  return (
    <Routes>
      {/* 채팅 메인 페이지 */}
      <Route path="/" element={<ChatMainPage />} />
      
      {/* 채팅방 상세 페이지 */}
      <Route path="/rooms/:roomId" element={<ChatRoomPage />} />
      
      {/* 예매 페이지 */}
      <Route path="/reservations" element={<ReservationPage />} />
    </Routes>
  );
};

export default ChatRouter; 