import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  validateEmail,
  validatePassword,
  validateNickName,
} from "../../utils/validation";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  // 입력한 회원가입 정보
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
    hostBizBank: "",
    hostBizDepositor: "",
    hostBizBankNumber: "",
    hostContractCharge: 0,
  });

  // 입력한 이메일 인증 코드
  const [emailAuthCode, setEmailAuthCode] = useState("");

  // 이메일 인증 여부 (기본값: False)
  const [emailVerified, setEmailVerified] = useState(false);

  // 입력 에러
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });

  // 입력값 변화 확인 메서드
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files) {
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 실시간 검증
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
    if (name === "passwordConfirm") {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm:
          value !== formData.password ? "비밀번호가 일치하지 않습니다." : "",
      }));
    }
    if (name === "nickname") {
      setErrors((prev) => ({
        ...prev,
        nickname: value === "" ? "" : validateNickName(value) || "",
      }));
    }
  };

  // 이메일 인증코드 생성 메서드
  const handleEmailValidationCodeCreate =(e) => {
    try {
      const response = await axios.post("http://127.0.0.1:8081/api/v1/email-verification",
          )
    }
  }

  // 이메일 인증코드 인증 메서드
  const handleEmailValidation = (e) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8081/api/v1/auth/email-verification/confirm",
        emailAuthCode,
        {
          headers: {"Content-Type": "application/json"},
        }
      );



    } catch (error: any) {}
  };

  // 폼 메서드
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const signupData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        // "" 또는 0 → null 처리
        const normalizedValue = value === "" || value === 0 ? null : value;

        if (normalizedValue !== null && normalizedValue !== undefined) {
          signupData.append(key, normalizedValue as any);
        }
      });

      const response = await axios.post(
        "http://127.0.0.1:8081/api/v1/sign-up",
        signupData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status !== 201) {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }

      alert("회원가입이 완료되었습니다.");
      navigate("/sign-in");
    } catch (error: any) {
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <img src="/logo.png" alt="Ticket Cloud" style={styles.logo} />
        <h1 style={styles.title}>회원가입</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.email && <p style={styles.error}>{errors.email}</p>}

          <div style={styles.row}>
            <input
              type="text"
              name="emailCode"
              placeholder="이메일 인증번호"
              value={emailAuthCode}
              onChange={handleChange}
              style={{ ...styles.input, flex: 1 }}
            />
            <button
              type="button"
              style={styles.verifyButton}
              onClick={handleEmailValidation}
            >
              인증하기
            </button>
          </div>

          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.password && <p style={styles.error}>{errors.password}</p>}

          <input
            type="password"
            name="passwordConfirm"
            placeholder="비밀번호 확인"
            value={formData.passwordConfirm}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.passwordConfirm && (
            <p style={styles.error}>{errors.passwordConfirm}</p>
          )}

          <input
            type="date"
            name="birth"
            value={formData.birth}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="nickname"
            placeholder="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.nickname && <p style={styles.error}>{errors.nickname}</p>}

          <div style={styles.profileBox}>
            <label htmlFor="profileImage" style={styles.profileLabel}>
              <img
                src={
                  formData.profileImage
                    ? URL.createObjectURL(formData.profileImage)
                    : "/default-avatar.png"
                }
                alt="프로필"
                style={styles.profileImage}
              />
              사진변경
            </label>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              style={{ display: "none" }}
            />
          </div>

          <button type="submit" style={styles.button}>
            회원가입
          </button>
        </form>
      </div>
      <footer style={styles.footer}>
        <span>© 2023 Your Company</span>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </footer>
    </div>
  );
};

export default SignUpPage;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
  },
  formBox: {
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "50px 40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
  logo: { width: "70px", marginBottom: "20px" },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#333",
  },
  form: {
    width: "340px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },
  row: { display: "flex", gap: "10px", alignItems: "center" },
  verifyButton: {
    padding: "12px",
    border: "none",
    background: "#ccc",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  profileBox: { display: "flex", alignItems: "center", gap: "10px" },
  profileLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
  },
  profileImage: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "5px",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  error: { fontSize: "12px", color: "red", marginTop: "-8px" },
  footer: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    padding: "20px",
    fontSize: "14px",
    color: "#666",
  },
};
