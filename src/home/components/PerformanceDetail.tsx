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
        const response = await performanceApi.getPerformanceDetail(parseInt(id));
        if (response.data) {
          setPerformance(response.data);
        }
      } catch (err) {
        setError('공연 정보를 불러오는데 실패했습니다.');
        console.error('Error fetching performance detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceDetail();
  }, [id]);

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
    try {
      if (!isScrapped) {
        // 스크랩 추가
        await scrapService.addScrap(performance.performanceId);
        setIsScrapped(true);
        console.log('스크랩 추가 완료');
      } else {
        // 스크랩 제거
        await scrapService.removeScrap(performance.performanceId);
        setIsScrapped(false);
        console.log('스크랩 제거 완료');
      }
    } catch (error) {
      console.error('스크랩 토글 실패:', error);
      alert('스크랩 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="performance-detail-page">
      <div className="title-section">
        <h1 className="performance-detail-title">{performance.title}</h1>
        <button 
          className={`scrap-button ${isScrapped ? 'scrapped' : ''}`}
          onClick={handleScrapToggle}
          aria-label={isScrapped ? '스크랩 해제' : '스크랩 추가'}
        >
          <Bookmark size={24} />
        </button>
      </div>
      <div className="performance-header">
          <div className="performance-image">
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
              <button className="reserve-button">예매하기</button>
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