// src/components/coupon/CouponCard.tsx
import React, { useState } from 'react';
import { issueEventCoupon } from '../../api/eventApi';

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
  variant?: 'card' | 'list';
};

export default function CouponCard({ title, description, discount, date, eventId, variant = 'card' }: Props) {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim = async () => {
    if (!eventId) {
      alert('쿠폰 정보를 찾을 수 없습니다.');
      return;
    }

    console.log('쿠폰 발급 시도:', { eventId, title });
    setIsLoading(true);
    try {
      const result = await issueEventCoupon(eventId);
      setIsClaimed(true);
      alert(`쿠폰이 발급되었습니다!\n${result.message}`);
      console.log('쿠폰 발급 성공:', result);
    } catch (error) {
      console.error('쿠폰 발급 요청 실패:', error);
      alert(`쿠폰 발급에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 리스트 형태일 때의 새로운 디자인
  if (variant === 'list') {
    return (
      <div
        style={{
          position: 'relative',
          width: '80%',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 8px 25px rgba(96, 165, 250, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(96, 165, 250, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(96, 165, 250, 0.2)';
        }}
      >
        {/* 배경 패턴 */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3,
            pointerEvents: 'none'
          }}
        />

        {/* 쿠폰 내용 */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* 헤더 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}
              >
                🎫
              </div>
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    margin: '0 0 0.25rem 0',
                    lineHeight: '1.3'
                  }}
                >
                  {title}
                </h4>
                <p
                  style={{
                    fontSize: '0.875rem',
                    margin: '0',
                    opacity: '0.9',
                    fontWeight: '500'
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
            
            {/* 할인 배지 */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#667eea',
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                fontSize: '0.875rem',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {discount} 할인
            </div>
          </div>

          {/* 하단 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}
              >
              </div>
              <span style={{ fontSize: '0.875rem', opacity: '0.9', fontWeight: '500' }}>
                {date || '2025.12.31까지'}
              </span>
            </div>

            {/* 쿠폰 받기 버튼 */}
            <button
              onClick={handleClaim}
              disabled={isClaimed || isLoading}
              style={{
                background: isClaimed ? 'rgba(255, 255, 255, 0.3)' : isLoading ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                color: isClaimed ? 'white' : '#667eea',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: (isClaimed || isLoading) ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                ...(isClaimed || isLoading ? {} : {
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
                  }
                })
              }}
            >
              {isLoading && (
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid #f9a8d4',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {isClaimed ? '발급 완료' : isLoading ? '발급 중...' : '쿠폰 받기'}
            </button>
          </div>
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
            border: '2px solid rgba(255, 255, 255, 0.3)',
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
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        />
      </div>
    );
  }

  // 카드 형태 (기본) - 새로운 디자인
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        background: 'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)',
        borderRadius: '20px',
        padding: '1.5rem',
        color: 'white',
        boxShadow: '0 12px 35px rgba(244, 114, 182, 0.25)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
              onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 16px 45px rgba(244, 114, 182, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(244, 114, 182, 0.25)';
        }}
    >
      {/* 배경 패턴 */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '25px 25px',
          opacity: 0.4,
          pointerEvents: 'none'
        }}
      />

      {/* 쿠폰 내용 */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* 상단 영역 */}
        <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0',
                  lineHeight: '1.3'
                }}
              >
                {title}
              </h4>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#667eea',
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                fontSize: '0.875rem',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {discount} 할인
            </div>
          </div>
          

          <p
            style={{
              fontSize: '0.875rem',
              margin: '0 0 0.25rem 0',
              opacity: '0.9',
              lineHeight: '1.4'
            }}
          >
            {description}
          </p>
          {date && (
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', opacity: '0.9', fontWeight: '500' }}>
                {date}
              </span>
            </div>
          )}
        </div>

        {/* 쿠폰 받기 버튼 */}
        <button
          onClick={handleClaim}
          disabled={isClaimed || isLoading}
          style={{
            background: isClaimed ? 'rgba(255, 255, 255, 0.3)' : isLoading ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.95)',
            color: isClaimed ? 'white' : '#667eea',
            border: 'none',
            padding: '0.875rem 1.75rem',
            borderRadius: '25px',
            fontSize: '0.875rem',
            fontWeight: '700',
            cursor: (isClaimed || isLoading) ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            ...(isClaimed || isLoading ? {} : {
              '&:hover': {
                background: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
              }
            })
          }}
        >
          {isLoading && (
            <div style={{
              width: '14px',
              height: '14px',
                               border: '2px solid #3b82f6',
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
          border: '2px solid rgba(255, 255, 255, 0.3)',
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
          border: '2px solid rgba(255, 255, 255, 0.3)',
        }}
      />
    </div>
  );
}