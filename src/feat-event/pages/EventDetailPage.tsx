import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import { EVENT_DETAILS } from '../../constants/eventData';
import { shareEvent } from '../../utils/eventUtils';
import { getTicketEventDetail, TicketEventDetailResponseDto, applyTicketEvent, TicketApplyResponseDto, getRandomEvents, RandomEventResponseDto } from '../api/eventApi';
import styles from '../styles/detail.module.css';

// 분리된 컴포넌트들
import { ResultPopup } from '../components/event/ResultPopup';
import { EventHeader } from '../components/event/EventHeader';
import { EventDetails } from '../components/event/EventDetails';
import { RecommendedEvents } from '../components/event/RecommendedEvents';
import PromotionalBanner from '../components/event/PromotionalBanner';

export default function EventDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const eventId = id; // eventId 변수명을 유지하기 위해 별칭 사용
  const [isLiked, setIsLiked] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [apiEventDetail, setApiEventDetail] = useState<TicketEventDetailResponseDto | null>(null);
  const [randomEvents, setRandomEvents] = useState<RandomEventResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('EventDetailPage - eventId:', eventId);
    
    const fetchEventDetail = async () => {
      if (!eventId) {
        setError('이벤트 ID가 없습니다.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [eventDetailResponse, randomEventsResponse] = await Promise.all([
          getTicketEventDetail(Number(eventId)),
          getRandomEvents()
        ]);
        
        setApiEventDetail(eventDetailResponse);
        setRandomEvents(randomEventsResponse.content);
        console.log('API 이벤트 상세 정보:', eventDetailResponse);
        console.log('랜덤 이벤트 정보:', randomEventsResponse);
      } catch (error) {
        console.error('이벤트 상세 정보 가져오기 실패:', error);
        setError('이벤트 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetail();
  }, [eventId]);

  // URL 파라미터에서 이벤트 ID를 가져와서 해당 이벤트 정보를 사용
  const eventDetail = eventId ? EVENT_DETAILS[eventId] : EVENT_DETAILS['1'];

  const handleApply = async () => {
    if (!eventId) {
      alert('이벤트 ID가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      const response: TicketApplyResponseDto = await applyTicketEvent(Number(eventId));
      console.log('응모 결과:', response);
      
      setIsWinner(response.isWinner);
      setResultMessage(response.message);
      setShowResultPopup(true);
    } catch (error) {
      console.error('응모 실패:', error);
      alert('응모에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowResultPopup(false);
  };

  const handleBackToList = () => {
    navigate('/event');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    shareEvent(apiEventDetail?.performanceTitle || '이벤트', apiEventDetail?.performancePlace || '', window.location.href);
  };

  const handleEventClick = (eventId: string) => {
    // 이벤트 상세 페이지로 이동
    navigate(`/event/ticket/${eventId}`);
  };

  if (loading) {
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
  }

  if (error || !apiEventDetail) {
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
  }

  return (
    <>
      <Header />
      <div className={styles['concert-event-detail-page']}>
        <div className={styles.container}>
          <EventHeader
            eventDetail={{
              title: apiEventDetail.performanceTitle,
              description: apiEventDetail.performancePlace,
              badge: apiEventDetail.eventStatusName
            }}
            isLiked={isLiked}
            onLike={handleLike}
            onShare={handleShare}
            eventMeta={[
              { icon: 'ClockIcon', text: apiEventDetail.performanceDate },
              { icon: 'TrendingUp', text: `${apiEventDetail.perPrice}P` },
              { icon: 'Award', text: apiEventDetail.seatGrade }
            ]}
          />
          
          <div className={styles['main-section']}>
            <div className={styles['poster-section']}>
              <div className={styles['poster-container']}>
                <img 
                  src={apiEventDetail.performanceImg || 'https://picsum.photos/400/600?random=1'} 
                  alt={apiEventDetail.performanceTitle}
                  className={styles['event-poster']}
                />
              </div>
            </div>
            
            <EventDetails
              eventDetail={apiEventDetail}
              eventRules={[
                { icon: 'Target', text: '1인 1회 응모 가능' },
                { icon: 'Zap', text: '당첨 시 즉시 발급' },
                { icon: 'Gift', text: '무료 티켓 제공' }
              ]}
              onApply={handleApply}
              onBackToList={handleBackToList}
              loading={loading}
              statusId={apiEventDetail.statusId}
              eventStatusName={apiEventDetail.eventStatusName}
            />
          </div>
          
          <PromotionalBanner />
          
          <RecommendedEvents
            events={randomEvents}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Result Popup Modal */}
      <ResultPopup
        isVisible={showResultPopup}
        isWinner={isWinner}
        message={resultMessage}
        onClose={handleClosePopup}
      />

      <Footer />
    </>
  );
} 