import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { performanceApi, PerformanceDetailDto } from '../../services/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';
import RelatedPerformances from './RelatedPerformances';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { scrapService } from '../../services/scrapService';
import { useReservationCountdown } from '../../hooks/useReservationCountdown';
import '../../styles/PerformanceDetailPage.css';

const PerformanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatDate } = useTimeConversion();
  const { isLoggedIn } = useAuth();

  const [performance, setPerformance] = useState<PerformanceDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrapped, setIsScrapped] = useState(false);

  // ✅ 훅은 항상 호출되므로 안전값 전달
  const safeStart = performance?.startDate ?? '';
  const safeEnd   = performance?.endDate ?? '';

  const { phase, disabled: reserveDisabled, buttonLabel: reserveLabel, helperText } =
    useReservationCountdown(safeStart, safeEnd);

  const reserveClassName = `reserve-button ${
    reserveDisabled ? (phase === 'ENDED' ? 'btn-ended' : 'btn-not-started') : ''
  }`;

  useEffect(() => {
    const fetchPerformanceDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await performanceApi.getPerformanceDetail(parseInt(id, 10));
        if (response.data) {
          setPerformance(response.data);

          if (isLoggedIn) {
            try {
              const scrapStatus = await scrapService.checkScrapStatus(response.data.performanceId);
              setIsScrapped(scrapStatus);
            } catch (err) {
              console.error('스크랩 상태 확인 실패:', err);
              setIsScrapped(false);
            }
          }
        } else {
          setError('공연 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('Error fetching performance detail:', err);
        setError('공연 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceDetail();
  }, [id, isLoggedIn]);

  const handleScrapToggle = async () => {
    if (!performance) return;
    try {
      if (!isScrapped) {
        await scrapService.addScrap(performance.performanceId);
        setIsScrapped(true);
      } else {
        await scrapService.removeScrap(performance.performanceId);
        setIsScrapped(false);
      }
    } catch (error: any) {
      console.error('스크랩 토글 실패:', error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || '';

      if (status === 500) {
        if (message.includes('unique result') || message.includes('duplicate')) {
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
              <span className="meta-value">{formatDate(performance.date, 'full')}</span>
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
              onClick={() => navigate(`/performance/${performance.performanceId}/reservation`)}
              disabled={reserveDisabled}
              title={helperText}
            >
              {reserveLabel}
            </button>
            <button className="share-button">공유하기</button>

            <div className="info-grid" />
          </div>
        </div>
      </div>

      <RelatedPerformances performanceId={performance.performanceId} />
    </div>
  );
};

export default PerformanceDetail;
