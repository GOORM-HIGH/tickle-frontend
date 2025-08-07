import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { performanceApi, PerformanceDto } from '../../api/performanceApi';
import { useTimeConversion } from '../../../hooks/useTimeConversion';
import Layout from '../../../components/layout/Layout';
import '../../styles/SearchPage.css';

// 이미지 로딩 상태를 관리하는 컴포넌트
const ImageWithSkeleton: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
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

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('/keyword') || '';
  const { convertUTCToKST } = useTimeConversion();
  
  const [performances, setPerformances] = useState<PerformanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasShownLoadMore, setHasShownLoadMore] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword.trim()) {
        setPerformances([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPerformances([]);
        setCurrentPage(0);
        setHasNext(false);
        setHasShownLoadMore(false);
        
        const response = await performanceApi.searchPerformances(keyword, 0, 4);
        
        if (response.data) {
          const convertedPerformances = response.data.content.map(performance => ({
            ...performance,
            date: convertUTCToKST(performance.date)
          }));
          
          setPerformances(convertedPerformances);
          setHasNext(!response.data.isLast);
          setCurrentPage(1);
        }
      } catch (err) {
        setError('검색 결과를 불러오는데 실패했습니다.');
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  const loadMoreResults = async () => {
    if (loadingMore || !hasNext) return;
    
    try {
      setLoadingMore(true);
      const nextPage = currentPage;
      const response = await performanceApi.searchPerformances(keyword, nextPage, 4);
      
      if (response.data) {
        const convertedPerformances = response.data.content.map(performance => ({
          ...performance,
          date: convertUTCToKST(performance.date)
        }));
        
        setPerformances(prev => {
          const uniquePerformances = new Map();
          
          prev.forEach(performance => {
            uniquePerformances.set(performance.performanceId, performance);
          });
          
          convertedPerformances.forEach(performance => {
            uniquePerformances.set(performance.performanceId, performance);
          });
          
          return Array.from(uniquePerformances.values());
        });
        
        setCurrentPage(nextPage + 1);
        setHasNext(!response.data.isLast);
      }
    } catch (err) {
      console.error('Error loading more search results:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setHasShownLoadMore(true);
    loadMoreResults();
  };

  const handleScroll = () => {
    if (hasShownLoadMore && hasNext && !loadingMore) {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreResults();
      }
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
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
  }, [hasShownLoadMore, hasNext, loadingMore]);

  if (loading) {
    return (
      <Layout>
        <div className="search-page">
          <div className="search-header">
            <h2>검색 결과</h2>
            <p>"{keyword}"에 대한 검색 결과를 불러오는 중...</p>
          </div>
          <div className="loading">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="search-page">
          <div className="search-header">
            <h2>검색 결과</h2>
            <p>"{keyword}"에 대한 검색 결과</p>
          </div>
          <div className="error">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="search-browse">
        <div className="search-keyword">
          {keyword}
        </div>
        <div className="search-count">
          검색 결과({performances.length})
        </div>
        <hr style={{margin: '20px 0px'}}/>
        
        {performances.length === 0 ? (
          <div className="empty-browse">
            <div className="empty-icon">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>"{keyword}"에 대한 공연을 찾을 수 없습니다.</p>
            <p>다른 키워드로 검색해보세요.</p>
          </div>
        ) : (
          <>
            <div className="browse-grid">
              {performances.map((performance, index) => (
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
            
            {hasNext && !loadingMore && !hasShownLoadMore && (
              <div className="load-more-container">
                <button 
                  className="load-more-button"
                  onClick={handleLoadMore}
                >
                  티켓 더보기
                </button>
              </div>
            )}
            
            {loadingMore && (
              <div className="loading-more">
                <div className="loading-spinner"></div>
                <p>더 많은 결과를 불러오는 중...</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage; 