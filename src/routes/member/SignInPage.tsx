import React, {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import {setAccessToken} from "../../utils/token";
import {validateEmail, validatePassword} from "../../utils/validation";

const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/home"; // 기본값은 /home

    const [formData, setFormData] = useState<SignInRequest>({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));

        // 값이 비어있으면 에러 메시지를 없앰
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
            const response = await axios.post(
                "http://127.0.0.1:8081/api/v1/sign-in",
                formData,
                {
                    headers: {"Content-Type": "application/json"},
                }
            );

            if (response.data.status !== 201) {
                new Error("로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.");
                return;
            }

            const {accessToken} = response.data;
            setAccessToken(accessToken);
            navigate(from, { replace: true }); // 이전 페이지로 이동

        } catch (error: unknown) {
            alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.");
            console.log(error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formBox}>
                <img src="/logo.png" alt="Ticket Cloud" style={styles.logo}/>
                <h1 style={styles.title}>Ticket Cloud</h1>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="email"
                        placeholder="아이디"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.email && <p style={styles.error}>{errors.email}</p>}

                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호"
                        value={formData.password}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.password && <p style={styles.error}>{errors.password}</p>}

                    <button type="submit" style={styles.button}>
                        로그인
                    </button>
                </form>
                <div style={styles.links}>
                    <Link to="/find-password" style={styles.link}>
                        비밀번호 찾기
                    </Link>{" "}
                    |{" "}
                    <Link to="/sign-up" style={styles.link}>
                        회원가입
                    </Link>{" "}
                    |{" "}
                    <Link to="/host-sign-in" style={styles.link}>
                        사업자 회원가입
                    </Link>
                </div>
            </div>
            <footer style={styles.footer}>
                <span>© 2023 Your Company</span>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
            </footer>
        </div>
    );
};

export default SignInPage;

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f3f4f6, #dce3f0)",
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
    logo: {
        width: "70px",
        marginBottom: "20px",
    },
    title: {
        fontSize: "30px",
        fontWeight: "bold",
        marginBottom: "35px",
        color: "#333",
    },
    form: {
        width: "320px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    input: {
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        fontSize: "14px",
        transition: "all 0.2s ease",
    },
    error: {
        fontSize: "12px",
        color: "red",
        marginTop: "-8px",
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
        transition: "all 0.2s ease",
    },
    links: {
        marginTop: "20px",
        fontSize: "14px",
        color: "#555",
    },
    link: {
        color: "#007bff",
        textDecoration: "none",
    },
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
