import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeRouter from '../home/router/HomeRouter';

const TotalRouter: React.FC = () => {
  return (
    <Routes>
      {/* 홈 관련 라우트 */}
      <Route path="/*" element={<HomeRouter />} />

      {/* 추후 다른 섹션 라우트들을 여기에 추가 */}
      {/* 예: <Route path="/auth/*" element={<AuthRouter />} /> */}
      {/* 예: <Route path="/reservation/*" element={<ReservationRouter />} /> */}
    </Routes>
  );
};

export default TotalRouter; 