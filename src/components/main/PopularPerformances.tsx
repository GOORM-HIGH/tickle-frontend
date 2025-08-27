import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { performanceApi, PerformanceCard } from '../../services/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';
import '../../styles/PopularPerformances.css';

// 이미지 로딩 상태를 관리하는 컴포넌트
const ImageWithSkeleton: React.FC<{ src: string; alt: string; rank: number }> = ({ src, alt, rank }) => {
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
    <div className="performance-poster">
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
        <div className="image-placeholder">
          <span>이미지 없음</span>
        </div>
      )}
      <div className="performance-rank">{rank}</div>
    </div>
  );
};

interface PerformanceCardWithLoading extends PerformanceCard {
  imageLoaded: boolean;
  imageError: boolean;
}

const PopularPerformances: React.FC = () => {
  const { convertUTCToKST } = useTimeConversion();
  const [performances, setPerformances] = useState<PerformanceCardWithLoading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPopularPerformances = async () => {
      try {
        setLoading(true);
        const response = await performanceApi.getPopularPerformances();
        console.log('인기공연 API 응답:', response);
        
        if (response.data && Array.isArray(response.data)) {
          const mappedPerformances = response.data.map(dto => ({
            id: dto.performanceId,
            title: dto.title,
            date: convertUTCToKST(dto.date), // UTC를 한국 시간으로 변환
            img: dto.img, // 원본 이미지 URL 유지
            imageLoaded: false,
            imageError: false
          }));
          setPerformances(mappedPerformances);
        } else {
          console.error('API 응답 데이터가 올바르지 않습니다:', response);
          setError('데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('인기공연 조회 오류:', err);
        setError('인기공연을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPerformances();
  }, []); // 빈 배열로 변경

  const handlePrevClick = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNextClick = () => {
    const maxSlides = Math.ceil(performances.length / 5) - 1;
    setCurrentSlide(prev => Math.min(maxSlides, prev + 1));
  };

  const handleImageLoad = (performanceId: number) => {
    setPerformances(prev => 
      prev.map(p => 
        p.id === performanceId 
          ? { ...p, imageLoaded: true }
          : p
      )
    );
  };

  const handleImageError = (performanceId: number) => {
    setPerformances(prev => 
      prev.map(p => 
        p.id === performanceId 
          ? { ...p, imageError: true }
          : p
      )
    );
  };

  if (loading) {
    return (
      <div className="popular-performances">
        <div className="popular-performances-header">
          <h2>인기공연</h2>
        </div>
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popular-performances">
        <div className="popular-performances-header">
          <h2>인기공연</h2>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="popular-performances">
      <div className="popular-performances-header">
        <h2>인기공연</h2>
      </div>
      
      <div className="performances-container" ref={containerRef}>
        {currentSlide > 0 && (
          <button 
            className="nav-button prev-button" 
            onClick={handlePrevClick}
            aria-label="이전 공연"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        <div className="performances-scroll">
          {performances
            .slice(currentSlide * 5, (currentSlide + 1) * 5)
            .map((performance, index) => (
              <div key={performance.id} className="performance-home-item">
                <Link 
                  to={`/performance/${performance.id}`}
                  className="performance-card-link"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="performance-card">
                    <ImageWithSkeleton 
                      src={performance.img} 
                      alt={performance.title} 
                      rank={currentSlide * 5 + index + 1}
                    />
                  </div>
                </Link>
                <div className="performance-info">
                  <p className="performance-title">{performance.title}</p>
                  <p className="performance-date">{performance.date}</p>
                </div>
              </div>
            ))}
        </div>
        
        {currentSlide < Math.ceil(performances.length / 5) - 1 && (
          <button 
            className="nav-button next-button" 
            onClick={handleNextClick}
            aria-label="다음 공연"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default PopularPerformances; 