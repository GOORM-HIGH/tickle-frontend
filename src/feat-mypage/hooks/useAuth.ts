import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useGlobalAuth } from '../../hooks/useAuth';
import { getAccessToken } from '../../utils/tokenUtils';

export const useMyPageAuth = () => {
  const navigate = useNavigate();
  const { currentUser, authKey } = useGlobalAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = getAccessToken();
      const hasToken = !!token;
      setIsLoggedIn(hasToken);
      
      console.log('🔍 MyPage - 토큰 확인:', {
        hasToken,
        token: token ? `${token.substring(0, 20)}...` : 'None',
        currentUser
      });
      
      if (!hasToken) {
        alert('로그인이 필요합니다.');
        navigate('/auth/sign-in');
        return;
      }
    };

    checkLoginStatus();
  }, [navigate, authKey, currentUser]);

  return {
    isLoggedIn,
    currentUser,
    authKey
  };
};
