import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 오류 시 로그인 페이지로 리다이렉트
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API 오류:', error.response?.status, error.response?.data);
//     if (error.response?.status === 401) {
//     console.log('인증 오류: 토큰이 유효하지 않습니다.');
//       localStorage.removeItem('accessToken');
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
