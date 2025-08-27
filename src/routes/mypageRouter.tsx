// routes/MypageRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MyInfoPage from "../pages/member/mypage/MyInfoPage";
import MyPointPage from "../pages/member/mypage/MyPointHistories";
import MyScrapedPerformancesPages from "../pages/member/mypage/MyScrapedPerformancesPages.tsx";
import MyReservationHistoriesPage from "../pages/member/mypage/MyReservationHistoriesPage.tsx";
import MyCouponsPage from "../pages/member/mypage/MyCouponsPage.tsx";
import MyPerformanceDashboardPage from "../pages/member/mypage/MyPerformanceDashboardPage.tsx";
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
          element={<MyScrapedPerformancesPages />}
        />
        <Route
          path="performance-dashboard"
          element={<MyPerformanceDashboardPage />}
        />
        <Route path="coupons" element={<MyCouponsPage />} />
        <Route path="settlement" element={<MySettlementDashboardPage />} />
        <Route path="points" element={<MyPointPage />} />
      </Route>
    </Routes>
  );
};

export default MypageRouter;
