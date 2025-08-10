// authRouter.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "../pages/member/auth/SignInPage";
import SignUpPage from "../pages/member/auth/SignUpPage";
import FindPasswordPage from "../pages/member/auth/FindPasswordPage";
import HostSignUpPage from "../pages/member/auth/HostSignUpPage";
import MyPageLayout from "../pages/member/mypage/MyPageLayout";

import MyInfo from "../pages/member/mypage/MyInfo";
// TODO: Mypage 나머지 추가하기

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
        <Route path="info" element={<MyInfo />} />
      </Route>
    </Routes>
  );
};

export default AuthRouter;
