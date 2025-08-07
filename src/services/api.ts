import axios from 'axios';
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 임시 토큰 설정 함수
export const setTempToken = (token: string) => {
  localStorage.setItem('accessToken', token);
  console.log('임시 토큰이 설정되었습니다:', token);
};

// 토큰 유효성 확인 함수
export const validateToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log('토큰 정보:', {
      subject: payload.sub,
      authorities: payload.authorities,
      expiration: new Date(payload.exp * 1000).toLocaleString(),
      isExpired: payload.exp < currentTime
    });
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    return false;
  }
};

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
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API 요청:', config.method?.toUpperCase(), config.url, config.params);
  return config;
});

// API 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API 오류:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('인증 오류: 토큰이 유효하지 않습니다.');
      localStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);

export default api;
