// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer
      style={{
        padding: '2rem',
        background: '#f8f9fa',
        borderTop: '1px solid #e1e4e8',
        fontSize: '0.95rem',
        color: '#555',
        marginTop: '4rem',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* 왼쪽 회사 정보 */}
        <div>
          <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Ticket Cloud</h4>
          <p>대표: 홍길동 | 사업자등록번호: 123-45-67890</p>
          <p>서울특별시 티켓구역 123로 456, 7층</p>
          <p>고객센터: 1544-1234 | 이메일: support@tickle.co.kr</p>
        </div>

        {/* 오른쪽 링크 */}
        <div>
          <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>고객지원</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><a href="/terms" style={{ textDecoration: 'none', color: '#555' }}>이용약관</a></li>
            <li><a href="/privacy" style={{ textDecoration: 'none', color: '#555' }}>개인정보처리방침</a></li>
            <li><a href="/faq" style={{ textDecoration: 'none', color: '#555' }}>자주 묻는 질문</a></li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
        © 2025 Ticket Cloud. All rights reserved.
      </div>
    </footer>
  );
}