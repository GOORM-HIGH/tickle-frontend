import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Ticket, Star, Heart, Share2, Eye, Clock as ClockIcon, MessageCircle, Award, TrendingUp, Target, Users as UsersIcon, Zap, Gift } from 'lucide-react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import '../styles/ConcertEventDetailPage.css';

interface EventDetail {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  duration: string;
  ageLimit: string;
  seatInfo: string;
  validityPeriod: string;
  entryPrice: string;
  posterUrl: string;
  badge?: string;
  description?: string;
}

interface RecommendedEvent {
  id: string;
  title: string;
  period: string;
  seatInfo: string;
  posterUrl: string;
  badge?: string;
}

// 이벤트 데이터를 ID별로 매핑
const eventDetails: Record<string, EventDetail> = {
  '1': {
    id: '1',
    title: '뮤지컬 <프리다>',
    description: '뮤지컬 정보 내용입니다 어쩌고 저쩌고 간략하게 적을예정입니다.',
    venue: 'NOL 유니플렉스 1관(구 인터파크 플렉스)',
    date: '2025.06.17 ~ 2026.09.07',
    time: '110분',
    duration: '110분',
    ageLimit: '15세 이상 관람가',
    seatInfo: 'R석 14번',
    validityPeriod: '2025.06.17 ~ 2026.09.07',
    entryPrice: '100',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  },
  '2': {
    id: '2',
    title: '뮤지컬 <오페라의 유령>',
    description: '클래식 뮤지컬의 대표작, 오페라의 유령을 만나보세요.',
    venue: '예술의전당',
    date: '2025.07.01 ~ 2026.08.15',
    time: '150분',
    duration: '150분',
    ageLimit: '12세 이상 관람가',
    seatInfo: 'VIP석 5번',
    validityPeriod: '2025.07.01 ~ 2026.08.15',
    entryPrice: '150',
    posterUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  },
  '3': {
    id: '3',
    title: '콘서트 <클래식 심포니>',
    description: '세계적인 오케스트라와 함께하는 클래식 음악의 향연.',
    venue: '세종문화회관',
    date: '2025.08.10 ~ 2026.10.20',
    time: '120분',
    duration: '120분',
    ageLimit: '전체 관람가',
    seatInfo: 'A석 12번',
    validityPeriod: '2025.08.10 ~ 2026.10.20',
    entryPrice: '80',
    posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  },
  '4': {
    id: '4',
    title: '연극 <햄릿>',
    description: '셰익스피어의 대표작을 현대적으로 재해석한 연극.',
    venue: '대학로 예술극장',
    date: '2025.09.05 ~ 2026.11.30',
    time: '180분',
    duration: '180분',
    ageLimit: '16세 이상 관람가',
    seatInfo: 'S석 8번',
    validityPeriod: '2025.09.05 ~ 2026.11.30',
    entryPrice: '120',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  },
  '5': {
    id: '5',
    title: '발레 <백조의 호수>',
    description: '클래식 발레의 정점, 백조의 호수를 감상하세요.',
    venue: '예술의전당',
    date: '2025.10.15 ~ 2026.12.25',
    time: '140분',
    duration: '140분',
    ageLimit: '전체 관람가',
    seatInfo: 'P석 3번',
    validityPeriod: '2025.10.15 ~ 2026.12.25',
    entryPrice: '200',
    posterUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=600&fit=crop',
    badge: '이벤트 진행 중'
  }
};

const mockRecommendedEvents: RecommendedEvent[] = [
  {
    id: '2',
    title: 'Jazz Night Under the Stars',
    period: 'Aug 20, 2024',
    seatInfo: 'Reserved Seating',
    posterUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=300&fit=crop',
    badge: 'Popular'
  },
  {
    id: '3',
    title: 'Rock Concert Extravaganza',
    period: 'Sep 5, 2024',
    seatInfo: 'VIP Access',
    posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=300&fit=crop',
    badge: 'New'
  },
  {
    id: '4',
    title: 'Classical Symphony Evening',
    period: 'Sep 18, 2024',
    seatInfo: 'Premium Seating',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=300&fit=crop'
  },
  {
    id: '5',
    title: 'Electronic Dance Festival',
    period: 'Oct 2, 2024',
    seatInfo: 'General Admission',
    posterUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=300&fit=crop',
    badge: 'Hot'
  },
  {
    id: '6',
    title: 'Acoustic Unplugged Session',
    period: 'Oct 15, 2024',
    seatInfo: 'Intimate Setting',
    posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=300&fit=crop'
  }
];

export const ConcertEventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 1000) + 500);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  
  // URL 파라미터에서 이벤트 ID를 가져와서 해당 이벤트 정보를 사용
  const eventDetail = eventId ? eventDetails[eventId] : eventDetails['1'];

  const handleApply = () => {
    // DTO에서 받아올 isWinner 값 (임시로 랜덤으로 설정)
    const mockIsWinner = Math.random() > 0.5; // 50% 확률로 당첨
    setIsWinner(mockIsWinner);
    setShowResultPopup(true);
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
    if (navigator.share) {
      navigator.share({
        title: eventDetail.title,
        text: eventDetail.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <>
      <Header />
      <div className="concert-event-detail-page">
        <div className="container">
          {/* Event Header Section */}
          <div className="event-header">
            <div className="header-top">
              {eventDetail.badge && (
                <div className="event-status-badge">
                  <div className="badge-dot"></div>
                  {eventDetail.badge}
                </div>
              )}
              <div className="header-actions">
                <button className="action-btn" onClick={handleLike}>
                  <Heart size={20} className={isLiked ? 'liked' : ''} />
                  <span>{isLiked ? '좋아요 취소' : '좋아요'}</span>
                </button>
                <button className="action-btn" onClick={handleShare}>
                  <Share2 size={20} />
                  <span>공유</span>
                </button>
                <div className="view-count">
                  <Eye size={16} />
                  <span>{viewCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <h1 className="event-main-title">{eventDetail.title}</h1>
            {eventDetail.description && (
              <p className="event-description">{eventDetail.description}</p>
            )}
            <div className="event-meta">
              <div className="meta-item">
                <ClockIcon size={16} />
                <span>이벤트 종료까지 3일 남음</span>
              </div>
              <div className="meta-item">
                <TrendingUp size={16} />
                <span>인기 이벤트 TOP 5</span>
              </div>
              <div className="meta-item">
                <Award size={16} />
                <span>인기</span>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="main-section">
            {/* Poster Image */}
            <div className="poster-section">
              <div className="poster-container">
                <img 
                  src={eventDetail.posterUrl} 
                  alt={eventDetail.title}
                  className="event-poster"
                />
                <div className="poster-overlay">
                  <div className="overlay-content">
                    <Star size={24} className="star-icon" />
                    <span>특별 이벤트</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Event Rules */}
              <div className="event-rules">
                <h4>이벤트 규칙</h4>
                <div className="rules-list">
                  <div className="rule-item">
                    <Target size={16} />
                    <span>목표 금액에 도달하면 이벤트 당첨</span>
                  </div>
                  <div className="rule-item">
                    <Zap size={16} />
                    <span>포인트로 즉시 응모 가능</span>
                  </div>
                  <div className="rule-item">
                    <Gift size={16} />
                    <span>당첨 시 티켓 자동 발급</span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="details-section">
                              <div className="section-header">
                <h3>이벤트 상세 정보</h3>
              </div>
                
                <div className="event-info">
                  <div className="info-item">
                    <span className="info-label">장소</span>
                    <span className="info-value">{eventDetail.venue}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">공연기간</span>
                    <span className="info-value">{eventDetail.date}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">공연시간</span>
                    <span className="info-value">{eventDetail.time}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">관람연령</span>
                    <span className="info-value">{eventDetail.ageLimit}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">이벤트 티켓 좌석</span>
                    <span className="info-value">{eventDetail.seatInfo}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">이벤트 티켓 사용기한</span>
                    <span className="info-value">{eventDetail.validityPeriod}</span>
                  </div>

                  <div className="info-item highlight">
                    <span className="info-label">이벤트 응모 가격</span>
                    <span className="info-value price">{eventDetail.entryPrice}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={handleApply}>
                    <Ticket size={20} />
                    응모하기
                  </button>
                  <button className="btn btn-secondary" onClick={handleBackToList}>
                    <ArrowLeft size={20} />
                    목록으로
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="promotional-banner">
            <div className="banner-content">
              <div className="banner-icon">🎵</div>
              <h2>Get your free concert ticket!</h2>
              <p>Limited time offer - Don't miss out on this amazing opportunity!</p>
              <div className="banner-features">
                <span>✓ 무료 티켓</span>
                <span>✓ 특별 혜택</span>
                <span>✓ 한정 수량</span>
              </div>
            </div>
          </div>

          {/* Recommended Events */}
          <div className="recommended-section">
            <div className="section-header">
              <h2 className="section-title">Recommended Events</h2>
              <button className="view-all-btn">전체보기</button>
            </div>
            <div className="events-scroll-container">
              <div className="events-scroll">
                {mockRecommendedEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="card-poster-container">
                      <img 
                        src={event.posterUrl} 
                        alt={event.title}
                        className="card-poster"
                      />
                      {event.badge && (
                        <div className="card-badge">
                          <Star size={10} />
                          {event.badge}
                        </div>
                      )}
                      <div className="card-overlay">
                        <button 
                          className="quick-view-btn" 
                          onClick={() => navigate(`/event/${event.id}`)}
                        >
                          이동하기
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{event.title}</h3>
                      <p className="card-period">{event.period}</p>
                      <p className="card-seat-info">{event.seatInfo}</p>
                      <div className="card-footer">
                        <span className="card-price">₩{Math.floor(Math.random() * 100) + 50}k</span>
                        <button className="card-apply-btn">응모</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Popup Modal */}
      {showResultPopup && (
        <div className="result-popup-overlay">
          <div className="result-popup">
            <div className="result-content">
              <h2 className="result-title">
                {isWinner ? '당첨!' : '꽝...'}
              </h2>
              <div className="result-image">
                <img 
                  src={isWinner ? '/winning.png' : '/boom.png'} 
                  alt={isWinner ? '당첨' : '꽝'} 
                />
              </div>
              <p className="result-message">
                {isWinner 
                  ? '축하드립니다. 당첨입니다!' 
                  : '아쉽네요. 다음 기회에...'
                }
              </p>
              <button className="close-btn" onClick={handleClosePopup}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}; 