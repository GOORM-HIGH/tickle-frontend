// src/components/coupon/CouponCard.tsx
import { useState } from 'react';

// 스핀 애니메이션을 위한 CSS
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// CSS 스타일을 head에 추가
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinAnimation;
  document.head.appendChild(style);
}

type Props = {
  title: string;
  description: string;
  discount: string;
  date?: string;
  eventId?: number;
};

export default function CouponCard({ title, description, discount, date, eventId }: Props) {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim = async () => {
    if (!eventId) {
      alert('쿠폰 정보를 찾을 수 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/v1/event/coupon/${eventId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setIsClaimed(true);
        alert(`쿠폰이 발급되었습니다!\n${result.message}`);
        console.log('쿠폰 발급 성공:', result);
      } else {
        const errorData = await response.json();
        alert(`쿠폰 발급 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
        console.error('쿠폰 발급 실패:', errorData);
      }
    } catch (error) {
      console.error('쿠폰 발급 요청 실패:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '160px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '1.5rem',
        color: 'white',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
    >
      {/* 할인율 태그 */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        {discount} 할인
      </div>

      {/* 쿠폰 내용 */}
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h4
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              margin: '0 0 0.5rem 0',
              lineHeight: '1.3',
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontSize: '0.875rem',
              margin: '0 0 0.25rem 0',
              opacity: '0.9',
              lineHeight: '1.4',
            }}
          >
            {description}
          </p>
          {date && (
            <p
              style={{
                fontSize: '0.75rem',
                margin: '0',
                opacity: '0.8',
                fontWeight: '500',
              }}
            >
              {date}
            </p>
          )}
        </div>

        {/* 쿠폰 받기 버튼 */}
        <button
          onClick={handleClaim}
          disabled={isClaimed || isLoading}
          style={{
            background: isClaimed ? 'rgba(255,255,255,0.3)' : isLoading ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)',
            color: isClaimed ? 'white' : '#333',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: (isClaimed || isLoading) ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            ...(isClaimed || isLoading ? {} : {
              '&:hover': {
                background: 'rgba(255,255,255,1)',
                transform: 'scale(1.05)',
              }
            })
          }}
        >
          {isLoading && (
            <div style={{
              width: '12px',
              height: '12px',
              border: '2px solid #333',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {isClaimed ? '발급 완료' : isLoading ? '발급 중...' : '쿠폰 받기'}
        </button>
      </div>

      {/* 쿠폰 테두리 효과 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '0',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          background: '#f6f8fa',
          borderRadius: '50%',
          border: '2px solid #e5e7eb',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          background: '#f6f8fa',
          borderRadius: '50%',
          border: '2px solid #e5e7eb',
        }}
      />
    </div>
  );
}