// routes/MypageRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MyPage from "../feat-mypage/pages/MyPage";
import MyInfoPage from "../pages/member/mypage/MyInfoPage";
import MyPointPage from "../pages/member/mypage/MyPoint";
import MyScrapedPerformancePage from "../pages/member/mypage/MyScrapedPerformancePage";
import MyReservationHistoriesPage from "../pages/member/mypage/MyReservationPage";
import MyCoponPage from "../pages/member/mypage/MyCoponPage";
import MyPerforamnceDashboardPage from "../pages/member/mypage/MyPerforamnceDashBoardPage";
import MySettlementDashboardPage from "../pages/member/mypage/MySettlementDashBoardPage";

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
