import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { performanceApi, ComingSoonCard } from '../api/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';
import ReservationButton from '../../components/common/ReservationButton';
import '../styles/ComingSoon.css';

// 이미지 로딩 상태를 관리하는 컴포넌트
const ImageWithSkeleton: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className="performance-soon-image">
      {!isLoaded && <div className="performance-soon-skeleton" />}
      <img 
        src={src} 
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={isLoaded ? 'loaded' : ''}
        style={{ display: hasError ? 'none' : 'block' }}
        loading="lazy"
        decoding="async"
      />
      {hasError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999',
          fontSize: '0.9rem'
        }}>
          이미지 로드 실패
        </div>
      )}
    </div>
  );
};

const ComingSoon: React.FC = () => {
  const { formatDate } = useTimeConversion();
  const [comingSoonEvents, setComingSoonEvents] = useState<ComingSoonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComingSoonPerformances = async () => {
      try {
        setLoading(true);
        const response = await performanceApi.getComingSoonPerformances();
        console.log('오픈예정 API 응답:', response);
        
        if (response.data && Array.isArray(response.data)) {
          const mappedEvents = response.data.map(dto => ({
              id: dto.performanceId,
              title: dto.title,
              date: formatDate(dto.date, 'date'),
              time: formatDate(dto.date, 'time'),
              img: dto.img,
              reservationType: '일반예매',
              buttonType: 'default',
              buttonText: '단독판매',
              startDate: dto.startDate,
              endDate: dto.endDate
            }));
          setComingSoonEvents(mappedEvents);
        } else {
          console.error('API 응답 데이터가 올바르지 않습니다:', response);
          setError('데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('오픈예정 조회 오류:', err);
        setError('오픈예정 공연을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchComingSoonPerformances();
  }, []); // 빈 배열로 변경

  if (loading) {
    return (
      <section className="performance-soon">
        <div className="container">
          <h2 className="performance-soon-title">오픈 예정</h2>
          <div className="loading">로딩 중...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="performance-soon">
        <div className="container">
          <h2 className="performance-soon-title">오픈 예정</h2>
          <div className="error">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="performance-soon">
      <div className="container">
        <h2 className="performance-soon-title">오픈 예정</h2>
        <div className="performance-soon-grid">
          {comingSoonEvents.map((event) => (
            <div key={event.id} className="performance-soon-card">
              <Link to={`/performance/${event.id}`}>
                <ImageWithSkeleton src={event.img} alt={event.title} />
                <div className="performance-soon-details">
                  <div className="performance-soon-date">
                    {event.date} {event.time}
                  </div>
                  <h3 className="performance-soon-name">{event.title}</h3>
                  <p className="performance-soon-type">{event.reservationType}</p>
                  <button className={`reservation-button ${event.buttonType}`}>
                    {event.buttonText}
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComingSoon; 