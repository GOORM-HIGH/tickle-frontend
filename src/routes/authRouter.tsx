import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignInPage from "./member/SignInPage";
import SignUpPage from "./member/SignUpPage";
import FindPasswordPage from "./member/FindPasswordPage";
import HostSignUpPage from "./member/HostSignUpPage";

const AuthRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />
      <Route path="/host-sign-up" element={<HostSignUpPage />} />
    </Routes>
  );
};

export default AuthRouter; 