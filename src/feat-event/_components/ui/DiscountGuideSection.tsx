import React from 'react';
import styles from '../../styles/event.module.css';

const DiscountGuideSection: React.FC = () => {
  return (
    <section className={styles.discountGuide}>
      <div className={styles.guideContent}>
        <h2>할인 가이드</h2>
        <div className={styles.guideGrid}>
          <div className={styles.guideItem}>
            <h3>쿠폰 사용법</h3>
            <p>쿠폰을 받고 원하는 공연에 적용하세요</p>
          </div>
          <div className={styles.guideItem}>
            <h3>티켓 응모</h3>
            <p>티켓 이벤트에 응모하여 무료 티켓을 받으세요</p>
          </div>
          <div className={styles.guideItem}>
            <h3>포인트 적립</h3>
            <p>구매 시 포인트를 적립하여 다음 구매에 사용하세요</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscountGuideSection; 