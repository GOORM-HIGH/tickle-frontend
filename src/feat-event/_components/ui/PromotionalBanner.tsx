import React from 'react';
import styles from '../../styles/detail.module.css';

const PromotionalBanner: React.FC = () => {
  return (
    <div className={styles['promotional-banner']}>
      <div className={styles['banner-content']}>
        <div className={styles['banner-icon']}>🎫</div>
        <h2>티켓 응모로 특별한 공연을 만나보세요!</h2>
        <p>지금 응모하면 원하는 공연의 티켓을 받을 수 있어요!</p>
        <div className={styles['banner-features']}>
          <span>✓ 티켓 응모</span>
          <span>✓ 당첨 확률 높음</span>
          <span>✓ 다양한 공연</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner; 