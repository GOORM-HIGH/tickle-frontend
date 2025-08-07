import React from 'react';
import Header from '../../../components/layout/header/Header';
import Footer from '../../../components/layout/footer/Footer';
import styles from '../../styles/detail.module.css';

const LoadingState: React.FC = () => {
  return (
    <>
      <Header />
      <div className={styles['concert-event-detail-page']}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>이벤트 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoadingState; 