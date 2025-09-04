import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { performanceApi, PerformanceDto } from '../../services/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';

import '../../styles/SearchPage.css';
import ImageWithSkeleton from './ImageWithSkeleton';

const PAGE_SIZE = 8;

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const { convertUTCToKST } = useTimeConversion();

  const [performances, setPerformances] = useState<PerformanceDto[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0); // 현재 화면에 보여줄 카드 개수
  const [totalCount, setTotalCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // currentPage는 다음에 불러올 페이지 번호(0-index). 최초 fetch 후 1로 설정.
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // “더보기”를 눌러 첫 페이지의 나머지 4개를 펼쳤는지 여부
  const [hasShownLoadMore, setHasShownLoadMore] = useState(false);

  // 초기 검색: size=8로 0페이지 가져오되, 화면엔 4개만 노출
  useEffect(() => {
    const fetchInitial = async () => {
      if (!keyword.trim()) {
        setPerformances([]);
        setVisibleCount(0);
        setTotalCount(0);
        setLoading(false);
        setHasNext(false);
        setHasShownLoadMore(false);
        setCurrentPage(0);
        return;
      }

      try {
        setLoading(true);
        setPerformances([]);
        setVisibleCount(0);
        setHasNext(false);
        setHasShownLoadMore(false);
        setCurrentPage(0);

        const res = await performanceApi.searchPerformances(keyword, 0, PAGE_SIZE);
        if (res?.data) {
          const converted = res.data.content.map((p: PerformanceDto) => ({
            ...p,
            date: convertUTCToKST(p.date),
          }));

          setPerformances(converted);
          setTotalCount(res.data.totalElements ?? converted.length);
          setHasNext(!res.data.isLast);

          // 다음 요청은 page=1부터
          setCurrentPage(1);

          // 첫 화면은 4개만
          setVisibleCount(Math.min(4, converted.length));
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

  // 더보기: 이미 받아둔 첫 페이지의 나머지 4개를 펼치기만 함 (추가 API 호출 없음)
  const handleLoadMoreFirstPage = () => {
    setHasShownLoadMore(true);
    // 첫 페이지의 나머지까지 전부 보이도록
    setVisibleCount(Math.min(PAGE_SIZE, performances.length));
  };

  // 무한 스크롤: 더보기 이후에만 동작하며 size=8 기준으로 추가 로드
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      if (!hasShownLoadMore || !hasNext || loadingMore) return;

      const bottomThreshold = 1000; // px
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - bottomThreshold) {
        loadMoreResults();
      }
    };

    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    if (hasShownLoadMore) {
      window.addEventListener('scroll', debouncedHandleScroll);
      return () => {
        window.removeEventListener('scroll', debouncedHandleScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [hasShownLoadMore, hasNext, loadingMore]); // eslint-disable-line react-hooks/exhaustive-deps

  // 다음 페이지 로드 (size=8)
  const loadMoreResults = async () => {
    if (loadingMore || !hasNext) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage;

      const res = await performanceApi.searchPerformances(keyword, nextPage, PAGE_SIZE);
      if (res?.data) {
        const converted = res.data.content.map((p: PerformanceDto) => ({
          ...p,
          date: convertUTCToKST(p.date),
        }));

        setPerformances(prev => {
          const unique = new Map<number, PerformanceDto>();
          prev.forEach(p => unique.set(p.performanceId, p));
          converted.forEach(p => unique.set(p.performanceId, p));
          return Array.from(unique.values());
        });

        setTotalCount(res.data.totalElements ?? totalCount);
        setHasNext(!res.data.isLast);
        setCurrentPage(nextPage + 1);

        // 무한스크롤 이후에는 추가된 항목까지 전부 보이도록 visibleCount를 전체 길이로 맞춤
        setVisibleCount(prevCount => {
          // 새로 합쳐진 전체 길이로 확장
          return Math.max(prevCount, (converted.length ? (converted.length + performances.length) : performances.length));
        });
      }
    } catch (err) {
      console.error('Error loading more search results:', err);
    } finally {
      setLoadingMore(false);
    }
  };

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

  // 실제로 보여줄 목록은 visibleCount만큼만 slice
  const visibleList = performances.slice(0, visibleCount);

  return (
    <div className="search-browse">
      <div className="search-keyword">{keyword}</div>
      <div className="search-count">검색 결과({totalCount})</div>
      <hr style={{ margin: '20px 0px' }} />

      {visibleList.length === 0 ? (
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

          {/* 첫 페이지에서만 보이는 “더보기”: 처음 4개만 노출 중이고, 5~8번째가 존재할 때 */}
          {!hasShownLoadMore && performances.length > 4 && visibleCount === 4 && (
            <div className="load-more-container">
              <button className="load-more-button" onClick={handleLoadMoreFirstPage}>
                더보기
              </button>
            </div>
          )}

          {/* 스크롤 로딩 상태 표시 (더보기 이후에만 스크롤 로딩이 동작) */}
          {hasShownLoadMore && loadingMore && (
            <div className="loading-more">
              <div className="loading-spinner"></div>
              <p>더 많은 결과를 불러오는 중...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
