import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { performanceApi, PerformanceDetailDto } from '../api/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';
import RelatedPerformances from './RelatedPerformances';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { scrapService } from '../api/scrapService';
import '../styles/PerformanceDetailPage.css';

const PerformanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatDate } = useTimeConversion();
  const { isLoggedIn } = useAuth();
  const [performance, setPerformance] = useState<PerformanceDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrapped, setIsScrapped] = useState(false);

  useEffect(() => {
    const fetchPerformanceDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('🔍 로그인 상태:', isLoggedIn);
        const response = await performanceApi.getPerformanceDetail(parseInt(id));
        if (response.data) {
          setPerformance(response.data);
          console.log('🔍 공연 정보 로드 완료:', response.data.performanceId);
          
          // 로그인한 사용자인 경우 스크랩 상태 확인
          if (isLoggedIn) {
            try {
              console.log('🔍 스크랩 상태 확인 시작...');
              const scrapStatus = await scrapService.checkScrapStatus(response.data.performanceId);
              console.log('🔍 스크랩 상태 확인 결과:', scrapStatus);
              setIsScrapped(scrapStatus);
            } catch (error) {
              console.error('스크랩 상태 확인 실패:', error);
              setIsScrapped(false);
            }
          } else {
            console.log('🔍 로그인하지 않은 사용자 - 스크랩 상태 확인 건너뜀');
          }
        }
      } catch (err) {
        setError('공연 정보를 불러오는데 실패했습니다.');
        console.error('Error fetching performance detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceDetail();
  }, [id, isLoggedIn]);

  if (loading) {
    return (
      <div className="performance-detail-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="performance-detail-page">
        <div className="error">{error || '공연 정보를 찾을 수 없습니다.'}</div>
        <button onClick={() => navigate(-1)} className="back-button">
          뒤로 가기
        </button>
      </div>
    );
  }

  const handleScrapToggle = async () => {        
    console.log('🔍 스크랩 토글 버튼 클릭됨');
    console.log('🔍 현재 스크랩 상태:', isScrapped);
    console.log('🔍 공연 ID:', performance.performanceId);
    
    try {
      if (!isScrapped) {
        // 스크랩 추가
        console.log('🔍 스크랩 추가 시도...');
        await scrapService.addScrap(performance.performanceId);
        setIsScrapped(true);
        console.log('스크랩 추가 완료');
      } else {
        // 스크랩 제거
        console.log('🔍 스크랩 제거 시도...');
        await scrapService.removeScrap(performance.performanceId);
        setIsScrapped(false);
        console.log('스크랩 제거 완료');
      }
    } catch (error: any) {
      console.error('스크랩 토글 실패:', error);
      console.error('에러 상세:', error.response?.data);
      
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || error.message;
        if (errorMessage.includes('unique result') || errorMessage.includes('duplicate')) {
          alert('스크랩 데이터에 문제가 있습니다. 페이지를 새로고침 후 다시 시도해주세요.');
          window.location.reload();
        } else {
          alert('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        alert('스크랩 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 예매 버튼 상태: 단순 날짜 비교
  const now = new Date();
  const start = new Date(performance.startDate);
  const end = new Date(performance.endDate);
  const isNotStarted = now < start;
  const isEnded = now > end;

  const reserveLabel = isNotStarted ? '예매 예정' : isEnded ? '예매종료' : '예매하기';
  const reserveDisabled = isNotStarted || isEnded;
  const reserveClassName = `reserve-button ${reserveDisabled ? (isNotStarted ? 'btn-not-started' : 'btn-ended') : ''}`;

  console.log('🔍 PerformanceDetail - isLoggedIn:', isLoggedIn);
  
  return (
    <div className="performance-detail-page">
      <div className="title-section">
        <h1 className="performance-detail-title">{performance.title}</h1>
        {isLoggedIn && (
          <button 
            className={`scrap-button ${isScrapped ? 'scrapped' : ''}`}
            onClick={handleScrapToggle}
            aria-label={isScrapped ? '스크랩 해제' : '스크랩 추가'}
          >
            <Bookmark size={24} />
          </button>
        )}
      </div>
      <div className="performance-header">
          <div className="performance-detail-image">
            <img src={performance.img} alt={performance.title} />
          </div>
          <div className="performance-info">
            <div className="performance-meta">
              <div className="meta-item">
                <span className="meta-label">공연일시</span>
                <span className="meta-value">
                  {formatDate(performance.date, 'full')}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">공연장소</span>
                <span className="meta-value">{performance.hallAddress}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">관람시간</span>
                <span className="meta-value">{performance.runtime}분</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">가격</span>
                <span className="meta-value">{performance.price}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">주최측</span>
                <span className="meta-value">{performance.hostBizName}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">예매기간</span>
                <span className="meta-value">
                  {formatDate(performance.startDate, 'date')} ~ {formatDate(performance.endDate, 'date')}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">상태</span>
                <span className="meta-value">{performance.statusDescription}</span>
              </div>
            </div>
            <div className="performance-actions">
              <button
                className={reserveClassName}
                onClick={() => {
                  if (reserveDisabled) return;
                  console.log('예매하기 클릭');
                }}
                disabled={reserveDisabled}
                title={isNotStarted ? `예매 시작: ${formatDate(performance.startDate, 'date')}` : undefined}
              >
                {reserveLabel}
              </button>
              <button className="share-button">공유하기</button>
              <div className="info-grid">
              </div>
            </div>
          </div>
      </div>
      <RelatedPerformances performanceId={performance.performanceId} />
    </div>
  );
};

export default PerformanceDetail; 