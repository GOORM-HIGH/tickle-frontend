import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import ChatRoom from './components/ChatRoom';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 새로고침 시 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 간단하게 로그인 상태 복원
      setUser({
        id: 1,
        email: 'user@example.com',
        nickname: 'User'
      });
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string, userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        로딩중...
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <ChatRoom user={user} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
