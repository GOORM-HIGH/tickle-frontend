import React from 'react';
import styles from '../../styles/event.module.css';

const HeroSection: React.FC = () => {
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
            <button className={styles.primaryButton}>쿠폰 이벤트 보기</button>
            <button className={styles.secondaryButton}>티켓 이벤트 보기</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection; 