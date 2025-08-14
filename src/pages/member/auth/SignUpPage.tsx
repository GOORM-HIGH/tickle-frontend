import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  validateEmail,
  validateEmailCode,
  validateNickName,
  validatePassword,
} from "../../../utils/validations";
import { toInstant } from "../../../utils/dateUtils";
import ProfileImageUploader from "../../../components/member/ProfileImageUploader";
import AuthInput from "../../../components/member/AuthInput";
import AuthCard from "../../../components/member/AuthCard";
import Button from "../../../components/common/Button";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignUpRequest>({
    email: "",
    password: "",
    birthday: "",
    nickname: "",
    img: "",
    phoneNumber: "",
    role: "MEMBER",
    hostBizNumber: "",
    hostBizCeoName: "",
    hostBizName: "",
    hostBizAddress: "",
    hostBizEcommerceRegistrationNumber: "",
    hostBizBankName: "",
    hostBizDepositor: "",
    hostBizBankNumber: "",
    hostContractCharge: 0,
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [emailAuthCode, setEmailAuthCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    emailCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files) {
      setProfileImage(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 실시간 검증
    if (name === "email")
      setErrors((prev) => ({
        ...prev,
        email: value === "" ? "" : validateEmail(value) || "",
      }));
    if (name === "password")
      setErrors((prev) => ({
        ...prev,
        password: value === "" ? "" : validatePassword(value) || "",
      }));
    if (name === "passwordConfirm")
      setErrors((prev) => ({
        ...prev,
        passwordConfirm:
          value !== formData.password ? "비밀번호가 일치하지 않습니다." : "",
      }));
    if (name === "nickname")
      setErrors((prev) => ({
        ...prev,
        nickname: value === "" ? "" : validateNickName(value) || "",
      }));
    if (name === "emailCode")
      setErrors((prev) => ({
        ...prev,
        emailCode: value === "" ? "" : validateEmailCode(value) || "",
      }));
  };

  const handleSendEmailCode = async () => {
    try {
      const emailError: string = validateEmail(formData.email);
      if (emailError) {
        alert("올바른 이메일 주소를 입력해주세요.");
        return;
      }

      await axios.post(
        "https://api.tickle.kr/api/v1/auth/email-verification",
        { email: formData.email },
        { headers: { "Content-Type": "application/json" } }
      );

      alert("인증번호가 발송되었습니다.");
      setIsCodeSent(true);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 409) {
          console.error("이미 가입된 이메일입니다.");
          alert("이미 가입된 이메일입니다.");
          return;
        }
      }

      alert("인증번호 발송 실패");
      console.error(error);
    }
  };

  const handleVerifyEmailCode = async () => {
    try {
      const emailError: string = validateEmail(formData.email);
      if (emailError) {
        alert("올바른 이메일 주소를 입력해주세요.");
        return;
      }

      await axios.post(
        "http://127.0.0.1:8081/api/v1/auth/email-verification/confirm",
        { email: formData.email, code: emailAuthCode },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("이메일 인증 완료");
      setEmailVerified(true);
    } catch (error) {
      alert("인증 실패: 올바른 인증번호가 아닙니다.");
      console.error(error);
    }
  };

  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage) return null;
    const imageData = new FormData();
    imageData.append("file", profileImage);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8081/api/v1/upload",
        imageData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.url;
    } catch (error) {
      alert("이미지 업로드 실패");
      console.error(error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailVerified) {
      alert("이메일 인증이 필요합니다.");
      return;
    }

    try {
      const birthday = toInstant(formData.birthday, false);
      const imageUrl = await uploadProfileImage();
      const payload = { ...formData, img: imageUrl || "", birthday };

      const response = await axios.post(
        "http://127.0.0.1:8081/api/v1/sign-up",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status !== 201) {
        alert("회원가입 실패");
        return;
      }

      alert("회원가입 성공");
      navigate("/auth/sign-in");
    } catch (error) {
      alert("회원가입 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <AuthCard title="회원가입" minWidth="1000px">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6"
      >
        {/* 프로필 업로더 */}
        <ProfileImageUploader
          imageUrl={
            profileImage ? URL.createObjectURL(profileImage) : undefined
          }
          onChange={(file) => setProfileImage(file)}
        />

        {/* 입력칸 + 버튼 */}
        <div className="flex flex-col gap-4">
          <AuthInput
            label="이메일"
            variant="large"
            placeholder="이메일"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          {/* 이메일 인증 */}
          <div className="flex flex-col w-[460px]">
            <label className="mb-1 text-sm font-medium text-gray-700">
              이메일 인증
            </label>
            <div className="flex gap-2 items-start">
              <input
                type="text"
                className="border border-gray-300 rounded px-3 text-base h-11 flex-grow focus:outline-none focus:border-[#006ff5]"
                style={{ fontFamily: "NEXON Lv1 Gothic OTF, sans-serif" }}
                placeholder="인증번호"
                name="emailCode"
                value={emailAuthCode}
                onChange={(e) => setEmailAuthCode(e.target.value)}
              />
              <Button
                size="small"
                type="button"
                onClick={
                  !isCodeSent ? handleSendEmailCode : handleVerifyEmailCode
                }
              >
                {!isCodeSent
                  ? "인증번호 전송"
                  : emailVerified
                  ? "인증완료"
                  : "인증하기"}
              </Button>
            </div>
            {errors.emailCode && (
              <span className="mt-1 text-sm text-red-500">
                {errors.emailCode}
              </span>
            )}
          </div>

          <AuthInput
            label="비밀번호"
            type="password"
            variant="large"
            placeholder="비밀번호"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <AuthInput
            label="비밀번호 확인"
            type="password"
            variant="large"
            placeholder="비밀번호 확인"
            name="passwordConfirm"
            onChange={handleChange}
            error={errors.passwordConfirm}
          />
          <AuthInput
            label="생년월일"
            type="date"
            variant="large"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
          />
          <AuthInput
            label="닉네임"
            variant="large"
            placeholder="닉네임"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            error={errors.nickname}
          />
          <Button size="large" type="submit" disabled={!emailVerified}>
            회원가입
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignUpPage;
