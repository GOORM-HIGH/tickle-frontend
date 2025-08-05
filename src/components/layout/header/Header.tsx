// src/components/layout/Header.tsx
import { FaBell, FaUser, FaTicketAlt, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Header() {
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
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="Tickle Logo" style={{ width: '36px', height: '36px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#222' }}>Ticket Cloud</h1>
        </div>

        {/* 검색창 */}
        <div style={{flex: 1,
                    margin: '0 2rem', 
                    marginLeft: '1rem',
                    position: 'relative',
                    maxWidth: '800px',}}
        >
          <input
            type="text"
            placeholder="어떤 공연을 찾으시나요?"
            style={{
              width: '100%',
              padding: '0.6rem 2.5rem 0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              backgroundColor: '#f8f8f8',
              fontSize: '0.95rem',
            }}
          />
          <FaSearch
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
            }}
          />
        </div>

        {/* 로그인/회원가입 */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              backgroundColor: '#fff',
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
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            로그인
          </button>
        </div>
      </div>

      {/* 카테고리 & 기능 메뉴 */}
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
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.95rem',
          }}
        >
        {/* 카테고리 */}
        <nav style={{ display: 'flex', gap: '1rem' }}>
        {[
            '연극', '뮤지컬', '클래식', '국악', '대중음악',
            '무용', '대중무용', '서커스/마술', '복합',
        ].map((item) => (
            <span
            key={item}
            style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                fontSize: '0.95rem',
                backgroundColor: 'transparent',
                color: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLSpanElement).style.backgroundColor = '#e6f0ff';
                (e.currentTarget as HTMLSpanElement).style.color = '#006FF5';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLSpanElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLSpanElement).style.color = '#333';
            }}
            >
            {item}
            </span>
        ))}
        </nav>

          {/* 기능 메뉴 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#222' }}>
              <FaTicketAlt /> 쿠폰
            </Link>
            <Link to="/event-ticket" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#222' }}>
              🎉 이벤트
            </Link>
            <Link to="/mypage" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#222' }}>
              <FaUser /> 마이페이지
            </Link>
            <Link to="/notifications" style={{ color: '#222' }}>
              <FaBell />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}