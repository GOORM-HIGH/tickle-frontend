// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { FaBell, FaUser, FaTicketAlt, FaSearch, FaChevronDown } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { PERFORMANCE_GENRES } from '../../../constants/categories';

export default function Header() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <header
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '100%',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 로고 */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Tickle Logo" style={{ width: '36px', height: '36px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#222' }}>Ticket Cloud</h1>
        </Link>

        {/* 검색창 */}
        <form 
          onSubmit={handleSearch}
          style={{
            flex: 1,
            margin: '0 2rem', 
            marginLeft: '1rem',
            position: 'relative',
            maxWidth: '800px',
          }}
        >
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="어떤 공연을 찾으시나요?"
            style={{
              width: '100%',
              padding: '0.6rem 2.5rem 0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              backgroundColor: '#f8f8f8',
              fontSize: '0.95rem',
              color: 'black',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <FaSearch style={{ color: '#666' }} />
          </button>
        </form>

        {/* 로그인/회원가입 */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              backgroundColor: '#fff',
              color: '#222',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            회원가입
          </button>
          <button
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              backgroundColor: '#fff',
              color: '#222',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            로그인
          </button>
        </div>
      </div>

      {/* 기능 메뉴 */}
      <div
        style={{
          background: 'linear-gradient(to right, #ffffff, #f9fbff)',
          borderTop: '1px solid #eee',
          padding: '0.75rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            justifyContent:'flex-end',
            alignItems: 'center',
            fontSize: '0.95rem',
          }}
        >
          {/* 왼쪽: 쿠폰, 이벤트 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#222',textDecoration:'none' }}>
              <FaTicketAlt /> 쿠폰
            </Link>
            <Link to="/event-ticket" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#222',textDecoration:'none' }}>
              🎉 이벤트
            </Link>

          {/* 오른쪽: 마이페이지, 알림 */}
            {/* <Link to="/performance/create" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#222',textDecoration:'none' }}>
              <FaTicketAlt /> 공연생성
            </Link> */}
            <Link to="/mypage" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#222',textDecoration:'none' }}>
              <FaUser /> 마이페이지
            </Link>
            <Link to="/notifications" style={{ color: '#222' }}>
              <FaBell />
            </Link>
          </div>
        </div>
      </div>

      {/* 장르 메뉴 */}
      <div
        style={{
          background: '#f8f9fa',
          borderTop: '1px solid #eee',
          padding: '0.75rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
          }}
        >
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {PERFORMANCE_GENRES.map((genre) => (
              <Link
                key={genre.id}
                to={`/performance/${genre.id}`}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.9rem',
                  backgroundColor: 'transparent',
                  color: '#333',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#e6f0ff';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#006FF5';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#333';
                }}
              >
                {genre.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}