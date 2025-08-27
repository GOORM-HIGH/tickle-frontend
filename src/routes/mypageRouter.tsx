// routes/MypageRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MyInfoPage from "../pages/member/mypage/MyInfoPage";
import MyPointPage from "../pages/member/mypage/MyPointHistories";
import MyScrapedPerformancePage from "../pages/member/mypage/MyScrapedPerformancePage";
import MyReservationHistoriesPage from "../pages/member/mypage/MyReservationPage";
import MyCoponPage from "../pages/member/mypage/MyCoponPage";
import MyPerforamnceDashboardPage from "../pages/member/mypage/MyPerforamnceDashboardPage";
import MySettlementDashboardPage from "../pages/member/mypage/MySettlementDashboardPage";
import MyPage from "../pages/member/mypage/MyPage";

const MypageRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MyPage />}>
        <Route index element={<Navigate to="info" replace />} />
        <Route path="info" element={<MyInfoPage />} />
        <Route
          path="reservationhistories"
          element={<MyReservationHistoriesPage />}
        />
        <Route
          path="scraped-performance"
          element={<MyScrapedPerformancePage />}
        />
        <Route
          path="performance-dashboard"
          element={<MyPerforamnceDashboardPage />}
        />
        <Route path="coupons" element={<MyCoponPage />} />
        <Route path="settlement" element={<MySettlementDashboardPage />} />
        <Route path="points" element={<MyPointPage />} />
      </Route>
    </Routes>
  );
};

export default MypageRouter;
