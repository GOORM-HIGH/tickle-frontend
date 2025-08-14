import React, { useState } from 'react';
import { LoginResponse } from '../../types/auth';

interface Props {
  onLogin: (email: string, password: string) => Promise<LoginResponse>; // 🎯 반환 타입 수정
  loading: boolean;
}

export const LoginForm: React.FC<Props> = ({ onLogin, loading }) => {
  const [form, setForm] = useState({ email: 'tester1@example.com', password: '1234' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(form.email, form.password);
      // 로그인 성공 시 alert 제거 (자동으로 MainPage로 이동됨)
    } catch (error) {
      alert('로그인 실패!');
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      width: '400px'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🎭 티클 채팅 로그인
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label>이메일:</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '5px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <label>비밀번호:</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '5px'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
        테스트 계정으로 미리 입력되어 있습니다
      </p>
    </div>
  );
};
