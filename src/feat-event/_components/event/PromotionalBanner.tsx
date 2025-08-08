import React from 'react';
import { Gift, Star, Zap } from 'lucide-react';
import styles from '../../styles/detail.module.css';

const PromotionalBanner: React.FC = () => {
  return (
    <div className={styles['promotional-banner']}>
      <div className={styles['banner-content']}>
        <div className={styles['banner-icon']}>
          🎫
        </div>
        <h2>특별 이벤트 혜택!</h2>
        <p>지금 응모하면 추가 혜택을 받을 수 있어요</p>
        <div className={styles['banner-features']}>
          <span>
            <Gift size={16} style={{ marginRight: '4px' }} />
            무료 티켓
          </span>
          <span>
            <Star size={16} style={{ marginRight: '4px' }} />
            특별 좌석
          </span>
          <span>
            <Zap size={16} style={{ marginRight: '4px' }} />
            즉시 발급
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
