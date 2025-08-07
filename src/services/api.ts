import axios from 'axios';
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: '',
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
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 오류 시 로그인 페이지로 리다이렉트
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       alert('로그인이 필요합니다!');
//       localStorage.removeItem('accessToken');
//       // 실제로는 로그인 페이지로 이동
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
