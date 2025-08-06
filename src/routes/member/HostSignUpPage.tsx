import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    validateEmail,
    validateEmailCode,
    validateNickName,
    validatePassword,
    validateBizNumber,
    validateBizName,
    validateEcommerceNumber,
    validateDepositor,
    validateBankNumber,
} from "../../utils/validations.ts";
import { toInstant } from "../../utils/dateUtils.ts";
import { toBigDecimalString } from "../../utils/numberUtils.ts";

const bankList = ["국민은행", "신한은행", "우리은행", "하나은행", "농협은행"];
const chargeList = [0, 5, 10, 15, 20];

const HostSignUpPage: React.FC = () => {
    const navigate = useNavigate();

    // refs 추가
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const passwordConfirmRef = useRef<HTMLInputElement | null>(null);
    const nicknameRef = useRef<HTMLInputElement | null>(null);
    const bizNumberRef = useRef<HTMLInputElement | null>(null);
    const bizNameRef = useRef<HTMLInputElement | null>(null);
    const ecomNumberRef = useRef<HTMLInputElement | null>(null);
    const depositorRef = useRef<HTMLInputElement | null>(null);
    const bankNumberRef = useRef<HTMLInputElement | null>(null);

    // 입력값
    const [formData, setFormData] = useState<SignUpRequest>({
        email: "",
        password: "",
        birthday: "",
        nickname: "",
        img: "",
        phoneNumber: "",
        role: "HOST",
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
        hostBizNumber: "",
        hostBizName: "",
        hostBizEcommerceRegistrationNumber: "",
        hostBizDepositor: "",
        hostBizBankNumber: "",
    });

    // 입력 변화 감지
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, files } = e.target as HTMLInputElement & HTMLSelectElement;
        if (name === "profileImage" && files) {
            setProfileImage(files[0]);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        // 실시간 검증
        if (name === "email") setErrors((prev) => ({ ...prev, email: value === "" ? "" : validateEmail(value) || "" }));
        if (name === "password") setErrors((prev) => ({ ...prev, password: value === "" ? "" : validatePassword(value) || "" }));
        if (name === "passwordConfirm") setErrors((prev) => ({ ...prev, passwordConfirm: value !== formData.password ? "비밀번호가 일치하지 않습니다." : "" }));
        if (name === "nickname") setErrors((prev) => ({ ...prev, nickname: value === "" ? "" : validateNickName(value) || "" }));
        if (name === "emailCode") setErrors((prev) => ({ ...prev, emailCode: value === "" ? "" : validateEmailCode(value) || "" }));
        if (name === "hostBizNumber") setErrors((prev) => ({ ...prev, hostBizNumber: value === "" ? "" : validateBizNumber(value) || "" }));
        if (name === "hostBizName") setErrors((prev) => ({ ...prev, hostBizName: value === "" ? "" : validateBizName(value) || "" }));
        if (name === "hostBizEcommerceRegistrationNumber") setErrors((prev) => ({ ...prev, hostBizEcommerceRegistrationNumber: value === "" ? "" : validateEcommerceNumber(value) || "" }));
        if (name === "hostBizDepositor") setErrors((prev) => ({ ...prev, hostBizDepositor: value === "" ? "" : validateDepositor(value) || "" }));
        if (name === "hostBizBankNumber") setErrors((prev) => ({ ...prev, hostBizBankNumber: value === "" ? "" : validateBankNumber(value) || "" }));
    };

    // 전체 유효성 검사
    const validateAll = () => {
        const fieldOrder: { name: keyof typeof errors; ref: React.RefObject<HTMLInputElement> }[] = [
            { name: "email", ref: emailRef },
            { name: "password", ref: passwordRef },
            { name: "passwordConfirm", ref: passwordConfirmRef },
            { name: "nickname", ref: nicknameRef },
            { name: "hostBizNumber", ref: bizNumberRef },
            { name: "hostBizName", ref: bizNameRef },
            { name: "hostBizEcommerceRegistrationNumber", ref: ecomNumberRef },
            { name: "hostBizDepositor", ref: depositorRef },
            { name: "hostBizBankNumber", ref: bankNumberRef },
        ];

        for (const field of fieldOrder) {
            if (errors[field.name]) {
                field.ref.current?.focus();
                return false;
            }
        }
        return true;
    };

    // 프로필 이미지 업로드
    const uploadProfileImage = async (): Promise<string | null> => {
        if (!profileImage) return null;
        const imageData = new FormData();
        imageData.append("file", profileImage);
        try {
            const response = await axios.post("http://127.0.0.1:8081/api/v1/upload", imageData, { headers: { "Content-Type": "multipart/form-data" } });
            return response.data.url;
        } catch (error) {
            alert("이미지 업로드 실패");
            console.error(error);
            return null;
        }
    };

    // 인증번호 발송
    const handleSendEmailCode = async () => {
        try {
            const emailError: string = validateEmail(formData.email);
            if (emailError) {
                alert("올바른 이메일 주소를 입력해주세요.");
                emailRef.current?.focus();
                return;
            }

            const response = await axios.post(
                "http://127.0.0.1:8081/api/v1/auth/email-verification",
                { email: formData.email },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.status !== 201) {
                throw new Error("인증번호 발송 실패");
            }

            alert("인증번호가 발송되었습니다.");
            setIsCodeSent(true);
        } catch (error) {
            alert("인증번호 발송 실패");
            console.error(error);
        }
    };

// 인증번호 확인
    const handleVerifyEmailCode = async () => {
        const codeError = validateEmailCode(emailAuthCode);
        if (codeError) {
            alert(codeError);
            return;
        }

        try {
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

    // 회원가입
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) return;
        if (!emailVerified) {
            alert("이메일 인증이 필요합니다.");
            emailRef.current?.focus();
            return;
        }

        try {
            const birthday = toInstant(formData.birthday, false);
            const hostContractCharge: string = toBigDecimalString(formData.hostContractCharge);
            const imageUrl = await uploadProfileImage();
            const payload = { ...formData, img: imageUrl || "", birthday, hostContractCharge };

            const response = await axios.post("http://127.0.0.1:8081/api/v1/sign-up", payload, { headers: { "Content-Type": "application/json" } });
            if (response.data.status !== 201) {
                alert("회원가입 실패");
                return;
            }

            alert("회원가입 성공");
            navigate("/home");
        } catch (error) {
            alert("회원가입 중 오류가 발생했습니다.");
            console.error(error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formBox}>
                <img src="/logo.png" alt="Ticket Cloud" style={styles.logo} />
                <h1 style={styles.title}>사업자 회원가입</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* 이메일 */}
                    <input ref={emailRef} type="email" name="email" placeholder="이메일" value={formData.email} onChange={handleChange} style={styles.input} />
                    {errors.email && <p style={styles.error}>{errors.email}</p>}

                    {/* 인증번호 입력 & 버튼 */}
                    <div style={styles.row}>
                        <input
                            type="text"
                            name="emailCode"
                            placeholder="이메일 인증번호"
                            value={emailAuthCode}
                            onChange={(e) => {
                                setEmailAuthCode(e.target.value);
                                handleChange(e);
                            }}
                            style={{ ...styles.input, flex: 1 }}
                            disabled={!isCodeSent || emailVerified}
                        />
                        <button
                            type="button"
                            style={{
                                ...styles.verifyButton,
                                background: !isCodeSent ? "#007bff" : emailVerified ? "#28a745" : "#ccc",
                                color: "#fff",
                                cursor: emailVerified ? "not-allowed" : "pointer",
                            }}
                            onClick={!isCodeSent ? handleSendEmailCode : handleVerifyEmailCode}
                            disabled={emailVerified}
                        >
                            {!isCodeSent ? "인증번호 발송" : emailVerified ? "인증완료" : "인증하기"}
                        </button>
                    </div>
                    {errors.emailCode && <p style={styles.error}>{errors.emailCode}</p>}


                    {/* 비밀번호 */}
                    <input ref={passwordRef} type="password" name="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} style={styles.input} />
                    {errors.password && <p style={styles.error}>{errors.password}</p>}

                    {/* 비밀번호 확인 */}
                    <input ref={passwordConfirmRef} type="password" name="passwordConfirm" placeholder="비밀번호 확인" onChange={handleChange} style={styles.input} />
                    {errors.passwordConfirm && <p style={styles.error}>{errors.passwordConfirm}</p>}

                    {/* 닉네임 */}
                    <input ref={nicknameRef} type="text" name="nickname" placeholder="닉네임" value={formData.nickname} onChange={handleChange} style={styles.input} />
                    {errors.nickname && <p style={styles.error}>{errors.nickname}</p>}

                    {/* 사업자등록번호 */}
                    <input ref={bizNumberRef} type="text" name="hostBizNumber" placeholder="사업자등록번호 (10자리)" value={formData.hostBizNumber} onChange={handleChange} style={styles.input} />
                    {errors.hostBizNumber && <p style={styles.error}>{errors.hostBizNumber}</p>}

                    {/* 사업자명 */}
                    <input ref={bizNameRef} type="text" name="hostBizName" placeholder="사업자명" value={formData.hostBizName} onChange={handleChange} style={styles.input} />
                    {errors.hostBizName && <p style={styles.error}>{errors.hostBizName}</p>}

                    {/* 통신판매업 신고번호 */}
                    <input
                        ref={ecomNumberRef}
                        type="text"
                        name="hostBizEcommerceRegistrationNumber"
                        placeholder="통신판매업 신고번호 (예: 2023-서울강남-12345)"
                        value={formData.hostBizEcommerceRegistrationNumber}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.hostBizEcommerceRegistrationNumber && <p style={styles.error}>{errors.hostBizEcommerceRegistrationNumber}</p>}

                    {/* 예금주 */}
                    <input ref={depositorRef} type="text" name="hostBizDepositor" placeholder="예금주" value={formData.hostBizDepositor} onChange={handleChange} style={styles.input} />
                    {errors.hostBizDepositor && <p style={styles.error}>{errors.hostBizDepositor}</p>}

                    {/* 계좌번호 */}
                    <input ref={bankNumberRef} type="text" name="hostBizBankNumber" placeholder="계좌번호" value={formData.hostBizBankNumber} onChange={handleChange} style={styles.input} />
                    {errors.hostBizBankNumber && <p style={styles.error}>{errors.hostBizBankNumber}</p>}

                    {/* 나머지 필드 동일... */}

                    <button type="submit" style={{ ...styles.button, backgroundColor: emailVerified ? "#007bff" : "#ccc" }} disabled={!emailVerified}>
                        회원가입
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HostSignUpPage;

const styles: { [key: string]: React.CSSProperties } = {
    container: { display: "flex", flexDirection: "column", minHeight: "100vh", justifyContent: "center", alignItems: "center", background: "#fff" },
    formBox: { backgroundColor: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "50px 40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" },
    logo: { width: "70px", marginBottom: "20px" },
    title: { fontSize: "28px", fontWeight: "bold", marginBottom: "30px", color: "#333" },
    form: { width: "340px", display: "flex", flexDirection: "column", gap: "12px" },
    input: { padding: "12px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px" },
    row: { display: "flex", gap: "10px", alignItems: "center" },
    verifyButton: { padding: "12px", border: "none", background: "#ccc", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
    profileBox: { display: "flex", alignItems: "center", gap: "10px" },
    profileLabel: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" },
    profileImage: { width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "5px" },
    button: { color: "#fff", padding: "12px", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold" },
    error: { fontSize: "12px", color: "red", marginTop: "-8px" },
    footer: { marginTop: "auto", display: "flex", justifyContent: "center", gap: "20px", padding: "20px", fontSize: "14px", color: "#666" },
};

