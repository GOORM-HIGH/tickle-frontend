import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { EventPage } from '../feat-event/pages/EventPage';
import EventDetailPage from '../feat-event/pages/EventDetailPage';

const EventRouter: React.FC = () => {
  return (
    <Routes>
      {/* 이벤트 메인 페이지 */}
      <Route path="/" element={<EventPage />} />
      
      {/* 이벤트 상세 페이지 */}
      <Route path="/ticket/:id" element={<EventDetailPage />} />
    </Routes>
  );
};

export default EventRouter;
