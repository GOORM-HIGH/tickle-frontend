import axios from 'axios';
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 개발 환경에서 임시 토큰 자동 설정
if (process.env.NODE_ENV === 'development') {
  // 여기에 실제 토큰을 넣으세요
  const tempToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJubjEzMTEzQGV4YW1wbGUuY29tIiwiYXV0aG9yaXRpZXMiOlsiQURNSU4iXSwiZXhwIjoxNzU0NDY2NTQ2fQ.x_Jv2Ign34qwxISLDx0rBkugl1soz8rahxw6pAqcSEmRgJe09O7dI0odXe-i-zAeFFkxHTJNvZmRiOZWjtnL0A';
  
  // 토큰이 없을 때만 설정
  if (!localStorage.getItem('accessToken')) {
    setTempToken(tempToken);
  }
}

// JWT 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 오류 시 로그인 페이지로 리다이렉트
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 오류:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('인증 오류: 토큰이 유효하지 않습니다.');
      localStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);

export default api;
