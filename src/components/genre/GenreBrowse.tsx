import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { performanceApi, PerformanceDto, Cursor } from '../../services/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';
import '../../styles/GenreBrowse.css';

// 이미지 로딩 컴포넌트
const ImageWithSkeleton: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="card-image">
      {!isLoaded && <div className="image-skeleton" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setHasError(true); setIsLoaded(true); }}
        className={isLoaded ? 'loaded' : ''}
        style={{ display: hasError ? 'none' : 'block' }}
      />
      {hasError && (
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', color:'#999', fontSize:'0.9rem' }}>
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
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 최신 cursor를 ref로 관리
  const cursorRef = useRef<Cursor | null>(null);

  const getGenreId = (category: string): number => {
    const numericId = parseInt(category);
    if (!isNaN(numericId)) return numericId;

    const genreMap: Record<string, number> = {
      'circus': 1, 'concert': 2, 'play': 3, 'classical': 4,
      'dance': 5, 'musical': 6, 'complex': 7, 'traditional': 8,
      'popular-dance': 9
    };
    return genreMap[category] || 1;
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        setPerformances([]);
        cursorRef.current = null;
        setHasNext(false);

        const genreId = getGenreId(category);
        const response = await performanceApi.getPerformancesByGenre(genreId, 20);

        if (response) {
          const converted = response.items.map(p => ({ ...p, date: convertUTCToKST(p.date) }));
          setPerformances(converted);
          cursorRef.current = response.nextCursor;
          setHasNext(response.hasNext);
          console.log('초기 cursor:', response.nextCursor, 'hasNext:', response.hasNext);
        }
      } catch (err) {
        console.error('Error fetching initial performances:', err);
        setError('공연 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [category, convertUTCToKST]);

  // 더보기 로딩
  const loadMorePerformances = useCallback(async () => {
    if (loadingMore || !hasNext || !cursorRef.current) return;

    setLoadingMore(true);
    try {
      const genreId = getGenreId(category);
      const response = await performanceApi.getPerformancesByGenre(
        genreId, 
        20, 
        cursorRef.current.lastDate, 
        cursorRef.current.lastId
      );

      if (response) {
        const converted = response.items.map(p => ({ ...p, date: convertUTCToKST(p.date) }));

        setPerformances(prev => {
          const map = new Map<number, PerformanceDto>();
          prev.forEach(p => map.set(p.performanceId, p));
          converted.forEach(p => map.set(p.performanceId, p));
          return Array.from(map.values());
        });

        cursorRef.current = response.nextCursor;
        setHasNext(response.hasNext);
        console.log('더보기 cursor:', response.nextCursor, 'hasNext:', response.hasNext);
      }
    } catch (err) {
      console.error('Error loading more performances:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [category, hasNext, loadingMore, convertUTCToKST]);

  // Intersection Observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elem = loadMoreRef.current;
    if (!elem) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNext && !loadingMore && cursorRef.current) {
          loadMorePerformances();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(elem);
    return () => observer.disconnect();
  }, [hasNext, loadingMore, loadMorePerformances]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

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
            {performances.map(p => (
              <Link key={p.performanceId} to={`/performance/${p.performanceId}`} style={{ textDecoration: 'none' }}>
                <div className="browse-card">
                  <ImageWithSkeleton src={p.img} alt={p.title} />
                  <div className="card-details">
                    <h3 className="title">{p.title}</h3>
                    <p className="date">{p.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 무한 스크롤 트리거 */}
          <div ref={loadMoreRef} style={{ height: '1px' }} />
          {loadingMore && <div className="loading-more">더 많은 공연을 불러오는 중...</div>}
        </>
      )}
    </div>
  );
};

export default GenreBrowse;