import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MyPage from '../feat-mypage/pages/MyPage';
import PointHistoryPage from '../feat-mypage/pages/PointHistoryPage';
import PointChargePage from '../feat-mypage/pages/PointChargePage';

const MypageRouter: React.FC = () => {
  return (
    <Routes>
      {/* 마이페이지 메인 */}
      <Route path="/" element={<MyPage />} />

      {/* 포인트 관련 라우트 */}
      <Route path="/point/history" element={<PointHistoryPage />} />
      <Route path="/point/charge" element={<PointChargePage />} />
    </Routes>
  );
};

export default MypageRouter;
