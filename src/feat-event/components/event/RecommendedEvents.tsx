import React, { useState, useEffect } from 'react';
import { RandomEventResponseDto, PerformanceDetailResponseDto } from '../../api/eventApi';
import { getPerformanceDetail } from '../../api/eventApi';
import styles from '../../styles/detail.module.css';

interface RecommendedEventsProps {
  events: RandomEventResponseDto[];
  onEventClick: (eventId: string) => void;
}

export const RecommendedEvents: React.FC<RecommendedEventsProps> = ({ events, onEventClick }) => {
  const [eventImages, setEventImages] = useState<Record<number, string>>({});
  const [performanceDetails, setPerformanceDetails] = useState<Record<number, PerformanceDetailResponseDto>>({});
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 공연 상세 정보 및 이미지 로드
  useEffect(() => {
    const loadPerformanceData = async () => {
      const dataPromises = events.map(async (event) => {
        if (!performanceDetails[event.performanceId] && !loadingImages[event.performanceId]) {
          setLoadingImages(prev => ({ ...prev, [event.performanceId]: true }));
          try {
            const performanceDetail = await getPerformanceDetail(event.performanceId);
            setPerformanceDetails(prev => ({ ...prev, [event.performanceId]: performanceDetail }));
            setEventImages(prev => ({ ...prev, [event.performanceId]: performanceDetail.img }));
          } catch (error) {
            console.error(`공연 상세 정보 로드 실패 (performanceId: ${event.performanceId}):`, error);
            // 에러 시 기본 이미지 설정
            setEventImages(prev => ({ 
              ...prev, 
              [event.performanceId]: `https://picsum.photos/300/200?random=${event.performanceId}` 
            }));
          } finally {
            setLoadingImages(prev => ({ ...prev, [event.performanceId]: false }));
          }
        }
      });

      await Promise.all(dataPromises);
    };

    if (events.length > 0) {
      loadPerformanceData();
    }
  }, [events]);

  return (
    <div className={styles['recommended-section']}>
      <div className={styles['section-header']}>
        <h2 className={styles['section-title']}>추천 이벤트</h2>
      </div>
      <div className={styles['events-scroll-container']}>
        <div className={styles['events-scroll']}>
          {events.map((event) => (
            <div key={event.eventId} className={styles['event-card']}>
              <div className={styles['card-poster-container']}>
                <img 
                  src={eventImages[event.performanceId] || `https://picsum.photos/300/200?random=${event.performanceId}`}
                  alt={event.eventName}
                  className={styles['card-poster']}
                />
                {loadingImages[event.performanceId] && (
                  <div className={styles['image-loading']}>
                    <div className={styles['loading-spinner']}></div>
                  </div>
                )}
                <div className={styles['card-overlay']}>
                  <button 
                    className={styles['quick-view-btn']} 
                    onClick={() => onEventClick(event.eventId.toString())}
                  >
                    이동하기
                  </button>
                </div>
              </div>
              <div className={styles['card-content']}>
                <h3 className={styles['card-title']}>
                  {performanceDetails[event.performanceId]?.title || event.eventName}
                </h3>
                <p className={styles['card-period']}>
                  {performanceDetails[event.performanceId] 
                    ? `${formatDate(performanceDetails[event.performanceId].startDate)} ~ ${formatDate(performanceDetails[event.performanceId].endDate)}`
                    : `${formatDate(event.startDate)} ~ ${formatDate(event.endDate)}`
                  }
                </p>
                <p className={styles['card-seat-info']}>
                  {performanceDetails[event.performanceId] 
                    ? `${performanceDetails[event.performanceId].runtime}분 • ${performanceDetails[event.performanceId].hallAddress}`
                    : `좌석: ${event.seatNumber}`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 