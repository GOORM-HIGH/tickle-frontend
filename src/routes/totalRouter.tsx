import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PerformanceRouter from './performanceRouter';
import AuthRouter from './authRouter';
import EventRouter from './eventRouter';

const TotalRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth/*" element={<AuthRouter />} />

      {/* 루트 경로를 /performance로 리다이렉트 */}
      <Route path="/" element={<Navigate to="/performance" replace />} />
      
      {/* 홈 관련 라우트 (우선순위 높음) */}
      <Route path="/performance/*" element={<PerformanceRouter />} />
      
      {/* 이벤트 관련 라우트 */}
      <Route path="/event/*" element={<EventRouter />} />
      
    </Routes>
  );
};

export default TotalRouter;