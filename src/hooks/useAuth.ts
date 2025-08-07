import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { LoginResponse } from '../types/auth';

// 🎯 JWT 토큰 디코딩 함수
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
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
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        // 🎯 저장된 사용자 정보 사용
        const user = JSON.parse(userInfo);
        setCurrentUser({ 
          id: user.id,
          nickname: user.nickname
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error('저장된 사용자 정보 파싱 실패:', error);
        // 🎯 JWT에서 정보 추출 (fallback)
        const decoded = decodeJWT(token);
        if (decoded && decoded.userId && decoded.nickname) {
          setCurrentUser({ 
            id: decoded.userId,
            nickname: decoded.nickname
          });
          setIsLoggedIn(true);
        }
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response: LoginResponse = await authService.login({ email, password });
      localStorage.setItem('accessToken', response.accessToken);
      
      // 🎯 사용자 정보 저장
      if (response.user) {
        localStorage.setItem('userInfo', JSON.stringify(response.user));
        setCurrentUser({ 
          id: response.user.id,
          nickname: response.user.nickname
        });
      }
      
      setIsLoggedIn(true);
      setAuthKey(prev => prev + 1); // 강제 리렌더링
      console.log('✅ 로그인 완료, 사용자 정보:', response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo'); // 🎯 사용자 정보도 삭제
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthKey(prev => prev + 1); // 강제 리렌더링
    console.log('✅ 로그아웃 완료, 상태 업데이트됨');
  };

  return { isLoggedIn, currentUser, loading, login, logout, authKey };
};
