import React from 'react';
import styles from '../../styles/event.module.css';

interface HeroSectionProps {
  onTabChange?: (tab: 'coupon' | 'ticket') => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onTabChange }) => {
  const handleCouponClick = () => {
    onTabChange?.('coupon');
    // 쿠폰 이벤트 섹션으로 스크롤 (배너 건너뛰기)
    setTimeout(() => {
      const couponSection = document.querySelector('[data-section="coupon"]');
      if (couponSection) {
        // 헤더 높이를 고려하여 스크롤 위치 조정
        const headerHeight = 100; // 헤더 높이 추정값
        const elementTop = couponSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleTicketClick = () => {
    onTabChange?.('ticket');
    // 티켓 이벤트 섹션으로 스크롤 (배너 건너뛰기)
    setTimeout(() => {
      const ticketSection = document.querySelector('[data-section="ticket"]');
      if (ticketSection) {
        // 헤더 높이를 고려하여 스크롤 위치 조정
        const headerHeight = 100; // 헤더 높이 추정값
        const elementTop = ticketSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <div className={styles.heroWrapper}>
      <section className={styles.heroSection}>
        <img 
          src="/event.jpg" 
          alt="이벤트 배경" 
          className={styles.heroImage}
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>특별한 이벤트를 만나보세요</h1>
          <p className={styles.heroSubtitle}>다양한 공연과 쿠폰으로 즐거운 시간을 보내세요</p>
          <div className={styles.heroButtons}>
            <button className={styles.primaryButton} onClick={handleCouponClick}>
              쿠폰 이벤트 보기
            </button>
            <button className={styles.secondaryButton} onClick={handleTicketClick}>
              티켓 이벤트 보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection; 