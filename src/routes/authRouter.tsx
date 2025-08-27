// authRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "../pages/member/auth/SignInPage";
import SignUpPage from "../pages/member/auth/SignUpPage";
import FindPasswordPage from "../pages/member/auth/FindPasswordPage";
import HostSignUpPage from "../pages/member/auth/HostSignUpPage";

import MyInfoPage from "../pages/member/mypage/MyInfoPage";
import MyPageLayout from "../components/member/mypage/MyPageLayout";

const AuthRouter: React.FC = () => {
  return (
    <Routes>
      {/* 여기서부터는 /auth 하위 상대경로 */}
      <Route path="sign-in" element={<SignInPage />} />
      <Route path="sign-up" element={<SignUpPage />} />
      <Route path="find-password" element={<FindPasswordPage />} />
      <Route path="host-sign-up" element={<HostSignUpPage />} />

      {/* 마이페이지 레이아웃 + 중첩 */}
      <Route path="my-page/*" element={<MyPageLayout />}>
        <Route index element={<Navigate to="info" replace />} />
        <Route path="info" element={<MyInfoPage />} />
      </Route>
    </Routes>
  );
};

export default AuthRouter;
