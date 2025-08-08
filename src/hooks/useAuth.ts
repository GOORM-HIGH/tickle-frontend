import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { LoginResponse } from '../types/auth';
import Cookies from 'js-cookie';

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
    const token = Cookies.get('accessToken');
    console.log('🔍 useAuth - 쿠키에서 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
    
    if (token) {
      try {
        // 🎯 JWT에서 정보 추출
        const decoded = decodeJWT(token);
        console.log('🔍 useAuth - JWT 디코딩 결과:', decoded);
        
        if (decoded && decoded.userId && decoded.nickname) {
          setCurrentUser({ 
            id: decoded.userId,
            nickname: decoded.nickname
          });
          setIsLoggedIn(true);
          console.log('🔍 useAuth - 로그인 상태 설정됨:', decoded.nickname);
        } else {
          console.log('🔍 useAuth - JWT에 사용자 정보 없음');
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('🔍 useAuth - JWT 디코딩 실패:', error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } else {
      console.log('🔍 useAuth - 토큰 없음, 로그아웃 상태');
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response: LoginResponse = await authService.login({ email, password });
      // 쿠키에 토큰 저장 (7일간 유효)
      Cookies.set('accessToken', response.accessToken, { expires: 7 });
      
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
    Cookies.remove('accessToken');
    localStorage.removeItem('userInfo'); // 🎯 사용자 정보도 삭제
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthKey(prev => prev + 1); // 강제 리렌더링
    console.log('✅ 로그아웃 완료, 상태 업데이트됨');
  };

  return { isLoggedIn, currentUser, loading, login, logout, authKey };
};
