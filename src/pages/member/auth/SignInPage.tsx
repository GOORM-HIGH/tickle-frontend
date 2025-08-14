import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthCard from "../../../components/member/AuthCard";
import AuthInput from "../../../components/member/AuthInput";
import Button from "../../../components/common/Button";
import { setAccessToken } from "../../../utils/tokenUtils";
import { validateEmail, validatePassword } from "../../../utils/validations";
import { useAuth } from "../../../hooks/useAuth";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const { login } = useAuth();

  const [formData, setFormData] = useState<SignInRequest>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<SignInRequest>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: value === "" ? "" : validateEmail(value) || "",
      }));
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value === "" ? "" : validatePassword(value) || "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { email, password } = formData;
      const response = await axios.post(
        "https://api.tickle.kr/api/v1/sign-in",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log(response.data);

      const { accessToken, user } = response.data;
      setAccessToken(accessToken);

      // 🎯 사용자 정보도 localStorage에 저장
      if (user) {
        localStorage.setItem("userInfo", JSON.stringify(user));
      }

      // 🎯 페이지 새로고침으로 useAuth 상태 업데이트
      window.location.href = "/performance";
    } catch (error: any) {
      let errorMessage: string = "";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401) {
          errorMessage =
            "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";
        }
      }

      alert(errorMessage);
      console.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <AuthCard title="로그인" minWidth="460px">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex flex-col gap-4 w-[460px]">
          <AuthInput
            label="이메일"
            name="email"
            type="text"
            variant="large"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <AuthInput
            label="비밀번호"
            name="password"
            type="password"
            variant="large"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
        </div>

        <Button size="large" type="submit">
          로그인
        </Button>

        <div className="text-sm text-gray-700 flex gap-2">
          {/* <Link to="/find-password" className="text-blue-600 hover:underline">
            비밀번호 찾기
          </Link> */}
          {/* <span>|</span> */}
          <Link to="/auth/sign-up" className="text-blue-600 hover:underline">
            회원가입
          </Link>
          <span>|</span>
          <Link
            to="/auth/host-sign-up"
            className="text-blue-600 hover:underline"
          >
            사업자 회원가입
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignInPage;
