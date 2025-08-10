import React from "react";
import { Routes, Route } from "react-router-dom";
import SignInPage from "../pages/member/auth/SignInPage";
import SignUpPage from "../pages/member/auth/SignUpPage";
import FindPasswordPage from "../pages/member/auth/FindPasswordPage";
import HostSignUpPage from "../pages/member/auth/HostSignUpPage";
import MyPage from "../pages/member/mypage/MyPage";

const AuthRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />
      <Route path="/host-sign-up" element={<HostSignUpPage />} />
      <Route path="/my-page" element={<MyPage/>}/>
    </Routes>
  );
};

export default AuthRouter;
