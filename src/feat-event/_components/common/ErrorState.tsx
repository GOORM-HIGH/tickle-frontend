import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/header/Header';
import Footer from '../../../components/layout/footer/Footer';
import styles from '../../styles/detail.module.css';

interface ErrorStateProps {
  error: string | null;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className={styles['concert-event-detail-page']}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc2626' }}>❌</div>
            <h2>오류가 발생했습니다</h2>
            <p>{error || '이벤트 정보를 찾을 수 없습니다.'}</p>
            <button 
              onClick={() => navigate('/event')}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#006ff5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ErrorState; 