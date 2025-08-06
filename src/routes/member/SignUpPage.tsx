import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {validateEmail, validateEmailCode, validateNickName, validatePassword,} from "../../utils/validation";
import {toInstant} from "../../utils/dateUtils.ts";

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();

    // 입력값
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

    const [profileImage, setProfileImage] = useState<File | null>(null); // 파일은 별도 관리

    // 인증 관련
    const [emailAuthCode, setEmailAuthCode] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    // 에러
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        passwordConfirm: "",
        nickname: "",
        emailCode: "",
    });

    // 입력 변화 감지
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, files} = e.target;
        if (name === "profileImage" && files) {
            setProfileImage(files[0]);
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
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
        if (name === "emailCode") {
            setErrors((prev) => ({
                ...prev,
                emailCode: value === "" ? "" : validateEmailCode(value) || "",
            }));
        }
    };

    // 인증번호 발송
    const handleSendEmailCode = async () => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:8081/api/v1/auth/email-verification",
                {email: formData.email},
                {headers: {"Content-Type": "application/json"}}
            );

            console.log(response);

            if (response.data.status !== 201) {
                new Error("인증번호 발송 실패");
                return;
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
                {email: formData.email, code: emailAuthCode},
                {headers: {"Content-Type": "application/json"}}
            );
            alert("이메일 인증 완료");
            setEmailVerified(true);
        } catch (error) {
            alert("인증 실패: 올바른 인증번호가 아닙니다.");
            console.error(error);
        }
    };

    // 프로필 이미지 업로드 (S3/NAS)
    const uploadProfileImage = async (): Promise<string | null> => {
        if (!profileImage) return null;
        const imageData = new FormData();
        imageData.append("file", profileImage);
        try {
            const response = await axios.post(
                "http://127.0.0.1:8081/api/v1/upload",
                imageData,
                {headers: {"Content-Type": "multipart/form-data"}}
            );
            return response.data.url;
        } catch (error) {
            alert("이미지 업로드 실패");
            console.error(error);
            return null;
        }
    };

    // 회원가입
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailVerified) {
            alert("이메일 인증이 필요합니다.");
            return;
        }

        try {
            const birthday = await toInstant(formData.birthday, false);
            const imageUrl = await uploadProfileImage();
            const payload = { ...formData, img: imageUrl || "", birthday };

            const response = await axios.post(
                "http://127.0.0.1:8081/api/v1/sign-up",
                payload,
                {headers: {"Content-Type": "application/json"}}
            );

            if (response.data.status !== 201) {
                alert("회원가입 실패");
                return;
            }

            console.log(response.data);
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
                <img src="/logo.png" alt="Ticket Cloud" style={styles.logo}/>
                <h1 style={styles.title}>회원가입</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* 이메일 */}
                    <input
                        type="email"
                        name="email"
                        placeholder="이메일"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.email && <p style={styles.error}>{errors.email}</p>}

                    {/* 인증번호 */}
                    {/* 인증번호 */}
                    <div>
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
                                style={{...styles.input, flex: 1}}
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
                    </div>

                    {/* 비밀번호 */}
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호"
                        value={formData.password}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.password && <p style={styles.error}>{errors.password}</p>}

                    {/* 비밀번호 확인 */}
                    <input
                        type="password"
                        name="passwordConfirm"
                        placeholder="비밀번호 확인"
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.passwordConfirm && <p style={styles.error}>{errors.passwordConfirm}</p>}

                    {/* 생일 */}
                    <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    {/* 닉네임 */}
                    <input
                        type="text"
                        name="nickname"
                        placeholder="닉네임"
                        value={formData.nickname}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.nickname && <p style={styles.error}>{errors.nickname}</p>}

                    {/* 프로필 이미지 */}
                    <div style={styles.profileBox}>
                        <label htmlFor="profileImage" style={styles.profileLabel}>
                            <img
                                src={profileImage ? URL.createObjectURL(profileImage) : "/default-avatar.png"}
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
                            style={{display: "none"}}
                        />
                    </div>

                    {/* 회원가입 버튼 */}
                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            backgroundColor: emailVerified ? "#007bff" : "#ccc",
                            cursor: emailVerified ? "pointer" : "not-allowed",
                        }}
                        disabled={!emailVerified}
                    >
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
        background: "#fff"
    },
    formBox: {
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "50px 40px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
    },
    logo: {width: "70px", marginBottom: "20px"},
    title: {fontSize: "28px", fontWeight: "bold", marginBottom: "30px", color: "#333"},
    form: {width: "340px", display: "flex", flexDirection: "column", gap: "12px"},
    input: {padding: "12px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px"},
    row: {display: "flex", gap: "10px", alignItems: "center"},
    verifyButton: {
        padding: "12px",
        border: "none",
        background: "#ccc",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold"
    },
    profileBox: {display: "flex", alignItems: "center", gap: "10px"},
    profileLabel: {display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer"},
    profileImage: {width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "5px"},
    button: {
        color: "#fff",
        padding: "12px",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "bold",
    },
    error: {fontSize: "12px", color: "red", marginTop: "-8px"},
    footer: {
        marginTop: "auto",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        padding: "20px",
        fontSize: "14px",
        color: "#666"
    },
};
