import axios from "axios";
import { getAccessToken } from "../utils/tokenUtils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://tickle/kr",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터: 토큰 자동 주입
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 처리: 토큰 제거
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      console.error("인증 오류: 토큰이 유효하지 않습니다.");
      localStorage.removeItem("accessToken");
    } else {
      console.error("API 오류:", status, err.response?.data);
    }
    return Promise.reject(err);
  }
);

export default api;
