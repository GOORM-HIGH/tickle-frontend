import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { performanceApi, PerformanceDto, PagingResponse } from '../../api/performanceApi';
import { useTimeConversion } from '../../../hooks/useTimeConversion';
import '../../styles/GenreBrowse.css';

// 이미지 로딩 상태를 관리하는 컴포넌트
const ImageWithSkeleton: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // 에러 시에도 로딩 상태를 true로 설정
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

interface CategoryBrowseProps {
  category: string;
}

const GenreBrowse: React.FC<CategoryBrowseProps> = ({ category }) => {
  const { convertUTCToKST } = useTimeConversion();
  const [performances, setPerformances] = useState<PerformanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

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
    const fetchBrowseData = async () => {
      try {
        setLoading(true);
        setPerformances([]); // 카테고리 변경 시 데이터 초기화
        setCurrentPage(0); // 페이지 초기화
        setHasNext(false); // hasNext 초기화
        
        const genreId = getGenreId(category);
        const response = await performanceApi.getPerformancesByGenre(genreId, 0, 8);
        
        if (response.data) {
          // UTC를 한국 시간으로 변환
          const convertedPerformances = response.data.content.map(performance => ({
            ...performance,
            date: convertUTCToKST(performance.date)
          }));
          
          setPerformances(convertedPerformances);
          // isLast가 false면 다음 페이지가 있다는 의미
          setHasNext(!response.data.isLast);
          setCurrentPage(response.data.page + 1); // 다음 페이지는 현재 페이지 + 1
        }
      } catch (err) {
        setError('공연 목록을 불러오는데 실패했습니다.');
        console.error('Error fetching browse data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrowseData();
  }, [category]);

  const loadMorePerformances = async () => {
    if (loadingMore || !hasNext) return;
    
    // 이미 로딩 중이면 중복 호출 방지
    setLoadingMore(true);
    
    try {
      const nextPage = currentPage;
      const genreId = getGenreId(category);
      const response = await performanceApi.getPerformancesByGenre(genreId, nextPage, 8);
      
      if (response.data) {
        const convertedPerformances = response.data.content.map(performance => ({
          ...performance,
          date: convertUTCToKST(performance.date)
        }));
        
        setPerformances(prev => {
          // 중복 제거를 위해 Map 사용
          const uniquePerformances = new Map();
          
          // 기존 데이터 추가
          prev.forEach(performance => {
            uniquePerformances.set(performance.performanceId, performance);
          });
          
          // 새 데이터 추가 (중복된 경우 덮어씀)
          convertedPerformances.forEach(performance => {
            uniquePerformances.set(performance.performanceId, performance);
          });
          
          return Array.from(uniquePerformances.values());
        });
        setCurrentPage(response.data.page + 1);
        // isLast가 false면 다음 페이지가 있다는 의미
        setHasNext(!response.data.isLast);
      }
    } catch (err) {
      console.error('Error loading more performances:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 스크롤 이벤트 핸들러 (디바운싱 적용)
  const handleScroll = () => {
    if (loadingMore || !hasNext) return;
    
    const scrollTop = document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.offsetHeight;
    
    // 스크롤이 하단에서 1000px 남았을 때 로드
    if (scrollTop + windowHeight >= documentHeight - 1000) {
      loadMorePerformances();
    }
  };

  useEffect(() => {
    // 디바운싱을 위한 타이머
    let timeoutId: NodeJS.Timeout;
    
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100); // 100ms 디바운싱
    };
    
    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [hasNext, loadingMore]);

  if (loading) {
    return (
      <div className="category-browse">
        <h2 className="section-title">작품 둘러보기</h2>
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-browse">
        <h2 className="section-title">작품 둘러보기</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="category-browse">
      <h2 className="section-title">작품 둘러보기</h2>
      
      {performances.length === 0 ? (
        <div className="empty-browse">
          <div className="empty-icon">🎭</div>
          <h3>공연 정보가 없습니다</h3>
          <p>이 장르의 공연이 아직 등록되지 않았습니다.</p>
        </div>
      ) : (
        <>
          <div className="browse-grid">
            {performances.map((performance, index) => (
              <Link key={`${performance.performanceId}-${index}`} to={`/performance/${performance.performanceId}`} style={{ textDecoration: 'none' }}>
                <div className="browse-card">
                  <ImageWithSkeleton src={performance.img} alt={performance.title} />
                  <div className="card-details">
                    <h3 className="title">{performance.title}</h3>
                    <p className="date">{performance.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* 로딩 더보기 */}
          {loadingMore && (
            <div className="loading-more">
              <div className="loading-spinner"></div>
              <p>더 많은 공연을 불러오는 중...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GenreBrowse; 