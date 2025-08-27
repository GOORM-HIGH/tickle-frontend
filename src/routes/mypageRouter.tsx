// routes/MypageRouter.tsx (수정본)
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MyPage from "../feat-mypage/pages/MyPage";
import PointHistoryPage from "../feat-mypage/pages/PointHistoryPage";
import PointChargePage from "../feat-mypage/pages/PointChargePage";
import { EventForm } from "../feat-mypage/components";

const MypageRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MyPage />}>
        <Route index element={<Navigate to="points" replace />} />
        <Route path="points" element={<PointHistoryPage />} />
        <Route path="point/charge" element={<PointChargePage />} />
        <Route path="event/create" element={<EventForm />} />
      </Route>
    </Routes>
  );
};

export default MypageRouter;