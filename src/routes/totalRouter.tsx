import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PerformanceRouter from "./performanceRouter";
import AuthRouter from "./authRouter";
import EventRouter from "./eventRouter";
import MypageRouter from "./mypageRouter";
import PointRouter from "./pointRouter";
import ChatRouter from "./chatRouter";
import Layout from "../components/layout/Layout";

const TotalRouter: React.FC = () => {
  return (
    <Routes>
      {/* 헤더, 푸터 [O] */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/performance" replace />} />
        <Route path="/mypage/*" element={<MypageRouter />} />
        <Route path="/point/*" element={<PointRouter />} />
        <Route path="/performance/*" element={<PerformanceRouter />} />
        <Route path="/event/*" element={<EventRouter />} />
      </Route>
      {/* 헤더, 푸터 [X] */}
      <Route path="/auth/*" element={<AuthRouter />} />
      <Route path="/chat/*" element={<ChatRouter />} />
    </Routes>
  );
};

export default TotalRouter;
