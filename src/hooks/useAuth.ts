import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

// 🎯 JWT 디코딩 함수 추가
const decodeJWT = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number, nickname: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [authKey, setAuthKey] = useState(0); // 강제 리렌더링을 위한 키

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 🎯 JWT에서 실제 사용자 정보 추출
      const decoded = decodeJWT(token);
      if (decoded) {
        console.log('🔍 JWT 디코딩 결과:', decoded);
        
        // 🎯 실제 사용자 정보 설정 (JWT payload 구조에 맞게 수정)
        setCurrentUser({ 
          id: decoded.memberId || 1, // JWT에서 실제 사용자 ID
          nickname: decoded.nickname || decoded.sub || decoded.name || '사용자' // JWT에서 실제 닉네임
        });
      }
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('accessToken', response.accessToken);
      
      // 🎯 로그인 후에도 JWT에서 실제 정보 추출
      const decoded = decodeJWT(response.accessToken);
      if (decoded) {
        setCurrentUser({ 
          id: decoded.memberId || 1,
          nickname: decoded.nickname || decoded.sub || decoded.name || '사용자'
        });
      }
      
      setIsLoggedIn(true);
      setAuthKey(prev => prev + 1); // 강제 리렌더링
      console.log('✅ 로그인 완료, 상태 업데이트됨');
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthKey(prev => prev + 1); // 강제 리렌더링
    console.log('✅ 로그아웃 완료, 상태 업데이트됨');
  };

  return { isLoggedIn, currentUser, loading, login, logout, authKey };
};
