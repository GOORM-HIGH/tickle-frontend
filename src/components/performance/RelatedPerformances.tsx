import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { performanceApi, PerformanceDto } from '../../services/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';
import '../../styles/RelatedPerformances.css';
import { useScrollToTop } from '../../hooks/useScrollToTop';

// 이미지 로딩 상태를 관리하는 컴포넌트
const ImageWithSkeleton: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  useScrollToTop();

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className="card-image">
      {!isLoaded && <div className="image-skeleton" />}
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

interface RelatedPerformancesProps {
  performanceId: number;
  showRecommendations?: boolean; // 추천 공연 표시 여부
}

const RelatedPerformances: React.FC<RelatedPerformancesProps> = ({ performanceId, showRecommendations = true }) => {
  const { formatDate } = useTimeConversion();
  const [relatedPerformances, setRelatedPerformances] = useState<PerformanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedPerformances = async () => {
      try {
        setLoading(true);
        const response = await performanceApi.getRelatedPerformances(performanceId);
        if (response.data) {
          console.log('Related performances:', response.data);
          setRelatedPerformances(response.data);
        }
      } catch (err) {
        setError('추천 공연을 불러오는데 실패했습니다.');
        console.error('Error fetching related performances:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPerformances();
  }, [performanceId]);

  if (loading) {
    return (
      <div className="related-performances">
        <h3 className="section-title">이런 공연은 어때요?</h3>
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!showRecommendations) {
    return null; // 추천 공연 표시를 비활성화한 경우
  }

  if (error) {
    return null; // 에러가 있으면 표시하지 않음
  }

  if (relatedPerformances.length === 0) {
    return null; // 추천 공연이 없으면 표시하지 않음
  }

  return (
    <div className="related-performances">
      <h3 className="section-title">이런 공연은 어때요?</h3>
      <div className="related-grid">
        {relatedPerformances.map((performance) => (
          <Link 
            key={performance.performanceId} 
            to={`/performance/${performance.performanceId}`}
            className="related-card"
          >
            <ImageWithSkeleton src={performance.img} alt={performance.title} />
            <div className="card-info">
              <h4 className="card-title">{performance.title}</h4>
              <p className="card-date">{formatDate(performance.date, 'date')}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPerformances; 