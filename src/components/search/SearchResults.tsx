import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { performanceApi, PerformanceDto, SearchCountResponse, CursorPage } from '../../services/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';

import '../../styles/SearchPage.css';
import ImageWithSkeleton from './ImageWithSkeleton';

const PAGE_SIZE = 8;

interface Cursor {
  lastDate: string;
  lastId: number;
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const { convertUTCToKST } = useTimeConversion();

  const [performances, setPerformances] = useState<PerformanceDto[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0); // 현재 화면에 보여줄 카드 개수
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0); // 전체 검색 결과 수

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [countLoading, setCountLoading] = useState(true);

  // "더보기" 버튼을 눌러 첫 페이지 나머지 4개를 펼쳤는지 여부
  const [hasShownLoadMore, setHasShownLoadMore] = useState(false);

  // 검색 결과 카운트 조회
  useEffect(() => {
    const fetchCount = async () => {
      if (!keyword.trim()) {
        setTotalCount(0);
        setCountLoading(false);
        return;
      }

      try {
        setCountLoading(true);
        const countRes = await performanceApi.getSearchCount(keyword);
        setTotalCount(countRes.count);
      } catch (err) {
        console.error('Error fetching search count:', err);
        setTotalCount(0);
      } finally {
        setCountLoading(false);
      }
    };

    fetchCount();
  }, [keyword]);

  // 초기 검색 (첫 페이지)
  useEffect(() => {
    const fetchInitial = async () => {
      if (!keyword.trim()) {
        setPerformances([]);
        setVisibleCount(0);
        setCursor(null);
        setHasNext(false);
        setLoading(false);
        setHasShownLoadMore(false);
        return;
      }

      try {
        setLoading(true);
        setPerformances([]);
        setVisibleCount(0);
        setCursor(null);
        setHasNext(false);
        setHasShownLoadMore(false);

        const res = await performanceApi.searchPerformances(keyword, PAGE_SIZE);

        if (res) {
          const converted = res.items.map((p: PerformanceDto) => ({
            ...p,
            date: convertUTCToKST(p.date),
          }));

          setPerformances(converted);
          setCursor(res.nextCursor);
          setHasNext(res.hasNext);

          // 첫 화면은 4개만 노출
          setVisibleCount(Math.min(4, converted.length));
        } else {
          // 응답이 없거나 빈 경우
          setPerformances([]);
          setCursor(null);
          setHasNext(false);
          setVisibleCount(0);
        }
      } catch (err) {
        setError('검색 결과를 불러오는데 실패했습니다.');
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  // 더보기 버튼 클릭 시: 첫 페이지의 나머지를 노출
  const handleLoadMoreFirstPage = () => {
    setHasShownLoadMore(true);
    setVisibleCount(Math.min(PAGE_SIZE, performances.length));
  };

  // 다음 페이지 로드
  const loadMoreResults = async () => {
    if (loadingMore || !hasNext || !cursor) return;

    try {
      setLoadingMore(true);

      const res = await performanceApi.searchPerformances(
        keyword,
        PAGE_SIZE,
        cursor.lastDate,
        cursor.lastId
      );

      if (res) {
        const converted = res.items.map((p: PerformanceDto) => ({
          ...p,
          date: convertUTCToKST(p.date),
        }));

        setPerformances((prev) => {
          const unique = new Map<number, PerformanceDto>();
          prev.forEach((p) => unique.set(p.performanceId, p));
          converted.forEach((p) => unique.set(p.performanceId, p));
          return Array.from(unique.values());
        });

        setCursor(res.nextCursor);
        setHasNext(res.hasNext);

        // visibleCount는 합쳐진 전체 개수로 확장
        setVisibleCount((prevCount) => Math.max(prevCount, performances.length + converted.length));
      }
    } catch (err) {
      console.error('Error loading more search results:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Intersection Observer를 사용한 무한 스크롤
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasShownLoadMore || !hasNext || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasShownLoadMore && hasNext && !loadingMore && cursor) {
          loadMoreResults();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [hasShownLoadMore, hasNext, loadingMore, cursor, loadMoreResults]);

  if (loading) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h2>검색 결과</h2>
          <p>"{keyword}"에 대한 검색 결과를 불러오는 중...</p>
        </div>
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h2>검색 결과</h2>
          <p>"{keyword}"에 대한 검색 결과</p>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  // 보여줄 목록
  const visibleList = performances.slice(0, visibleCount);

  // 카운트 표시 포맷팅 함수
  const formatCount = (count: number): string => {
    if (count > 3000) {
      return '3000+';
    }
    return count.toString();
  };

  return (
    <div className="search-browse">
      <div className="search-keyword">{keyword}</div>
      <div className="search-count">
        검색 결과({countLoading ? '...' : formatCount(totalCount)})
      </div>
      <hr style={{ margin: '20px 0px' }} />

      {!loading && !countLoading && totalCount === 0 ? (
        <div className="empty-browse">
          <div className="empty-icon">🔍</div>
          <h3>검색 결과가 없습니다</h3>
          <p>"{keyword}"에 대한 공연을 찾을 수 없습니다.</p>
          <p>다른 키워드로 검색해보세요.</p>
        </div>
      ) : (
        <>
          <div className="browse-grid">
            {visibleList.map((performance, index) => (
              <div key={`${performance.performanceId}-${index}`} className="browse-card">
                <Link to={`/performance/${performance.performanceId}`}>
                  <ImageWithSkeleton src={performance.img} alt={performance.title} />
                  <div className="card-details">
                    <div className="title">{performance.title}</div>
                    <div className="date">{performance.date}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {!hasShownLoadMore && performances.length > 4 && visibleCount === 4 && (
            <div className="load-more-container">
              <button className="load-more-button" onClick={handleLoadMoreFirstPage}>
                더보기
              </button>
            </div>
          )}

          {/* 무한 스크롤 트리거 요소 */}
          {hasShownLoadMore && hasNext && (
            <div ref={loadMoreRef} className="load-more-trigger">
              {loadingMore && (
                <div className="loading-more">
                  <div className="loading-spinner"></div>
                  <p>더 많은 결과를 불러오는 중...</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
