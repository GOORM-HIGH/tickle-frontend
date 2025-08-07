import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { performanceApi, PerformanceDto } from '../../api/performanceApi';
import { useTimeConversion } from '../../../hooks/useTimeConversion';
import '../../styles/CategoryRanking.css';

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

interface CategoryRankingProps {
  category: string;
}

const CategoryRanking: React.FC<CategoryRankingProps> = ({ category }) => {
  const { convertUTCToKST } = useTimeConversion();
  const [performances, setPerformances] = useState<PerformanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 카테고리를 장르 ID로 매핑
  const getGenreId = (category: string): number => {
    const genreMap: { [key: string]: number } = {
      'circus': 1,      // 서커스/마술
      'concert': 2,     // 대중음악
      'play': 3,        // 연극
      'classical': 4,   // 서양음악(클래식)
      'dance': 5,       // 무용(서양/한국무용)
      'musical': 6,     // 뮤지컬
      'complex': 7,     // 복합
      'traditional': 8, // 한국음악(국악)
      'popular-dance': 9 // 대중무용
    };
    return genreMap[category] || 1; // 기본값은 서커스/마술
  };

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setLoading(true);
        const genreId = getGenreId(category);
        const response = await performanceApi.getTop10ByGenre(genreId);
        
        if (response.data) {
          // UTC를 한국 시간으로 변환
          const convertedPerformances = response.data.map(performance => ({
            ...performance,
            date: convertUTCToKST(performance.date)
          }));
          setPerformances(convertedPerformances);
        }
      } catch (err) {
        setError('랭킹 데이터를 불러오는데 실패했습니다.');
        console.error('Error fetching ranking data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [category]); // convertUTCToKST 제거

  const handlePrevClick = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNextClick = () => {
    const maxSlides = Math.ceil(performances.length / 5) - 1;
    setCurrentSlide(prev => Math.min(maxSlides, prev + 1));
  };

  if (loading) {
    return (
      <div className="category-ranking">
        <h2 className="section-title">인기 랭킹</h2>
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-ranking">
        <h2 className="section-title">인기 랭킹</h2>
        <div className="error">{error}</div>
      </div>
    );
  }



  return (
    <div className="category-ranking">
      <h2 className="section-title">인기 랭킹</h2>
      
      {performances.length === 0 ? (
        <div className="empty-ranking">
          <div className="empty-icon">🏆</div>
          <h3>아직 인기 랭킹이 없습니다</h3>
          <p>이 장르의 공연이 더 많이 등록되면 인기 랭킹이 표시됩니다.</p>
        </div>
      ) : (
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
                <div className="performance-item" key={performance.performanceId}>
                  <Link 
                    to={`/performance/${performance.performanceId}`}
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
      )}
    </div>
  );
};

export default CategoryRanking; 