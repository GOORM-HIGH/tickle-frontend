import { useState } from 'react';
import TicketEventCard from '../ticket/TicketEventCard';
import { TicketListResponseDto, searchTicketEvents } from '../../api/eventApi';
import styles from '../../styles/event.module.css';
import { EventSearchBar } from './EventSearchBar';

interface TicketEventSectionProps {
  ticketEvents: TicketListResponseDto[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  cardsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function TicketEventSection({
  ticketEvents,
  loading,
  error,
  currentPage,
  totalPages,
  totalElements,
  cardsPerPage,
  onPageChange
}: TicketEventSectionProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TicketListResponseDto[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (keyword: string) => {
    // 검색어가 비어있으면 검색 결과 초기화
    if (!keyword.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const result = await searchTicketEvents(keyword, 0, 12);
      setSearchResults(result.content);
      console.log('검색 결과:', result);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchError('검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    handleSearch(searchKeyword);
  };

  // status_id 순서대로 정렬하는 함수 (5: 진행중, 4: 예정, 6: 마감)
  const sortEventsByStatus = (events: TicketListResponseDto[]) => {
    return [...events].sort((a, b) => {
      const statusOrder: Record<number, number> = { 5: 1, 4: 2, 6: 3 };
      const aOrder = statusOrder[a.statusId || 5] || 4;
      const bOrder = statusOrder[b.statusId || 5] || 4;
      return aOrder - bOrder;
    });
  };

  // 검색어가 있을 때만 검색 결과를 표시, 없으면 원래 이벤트 목록을 표시
  const displayEvents = sortEventsByStatus(searchKeyword.trim() ? searchResults : ticketEvents);
  const displayLoading = isSearching || loading;
  const displayError = searchError || error;
  return (
    <section className={styles.sectionBoxGray} data-section="ticket">
      <div className={styles.sectionHeader}>
        <h2 className={styles.ticketTitle}>🎭 진행중인 티켓 이벤트</h2>
        <p className={styles.ticketDesc}>다양한 공연과 이벤트에서 사용 가능한 티켓 이벤트가 준비되어 있어요!</p>
      </div>

      {/* 검색창 */}
      <EventSearchBar 
        onSearch={(query) => {
          setSearchKeyword(query);
          handleSearch(query);
        }}
        onFilter={handleSearchSubmit}
      />

      {/* Ticket Event Stats */}
      <div className={styles.ticketStats}>
        <div className={styles.ticketStatItem}>
          <div className={styles.ticketStatNumber}>{ticketEvents.length}</div>
          <div className={styles.ticketStatLabel}>진행중인 이벤트</div>
        </div>
        <div className={styles.ticketStatItem}>
          <div className={styles.ticketStatNumber}>5</div>
          <div className={styles.ticketStatLabel}>카테고리</div>
        </div>
        <div className={styles.ticketStatItem}>
        <div className={styles.ticketStatNumber}>저렴한</div>
          <div className={styles.ticketStatLabel}>응모 비용</div>
        </div>
        <div className={styles.ticketStatItem}>
          <div className={styles.ticketStatNumber}>즉시</div>
          <div className={styles.ticketStatLabel}>응모 가능</div>
        </div>
      </div>

      {/* Loading State */}
      {displayLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>이벤트를 불러오는 중...</p>
        </div>
      )}

      {/* Error State */}
      {displayError && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{displayError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Events Grid */}
      {!displayLoading && !displayError && (
        <>
          <div className={styles.ticketGrid}>
            {displayEvents.map((event) => (
              <TicketEventCard 
                key={event.eventId} 
                title={event.name}
                description={`${event.perPrice}P`}
                statusId={event.statusId}
                eventId={event.eventId.toString()}
                imageUrl={event.img}
              />
            ))}
          </div>

          {/* Pagination */}
          {!searchKeyword.trim() && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                이전
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                다음
              </button>
            </div>
          )}

          {/* No Results */}
          {displayEvents.length === 0 && !displayLoading && (
            <div className={styles.noResults}>
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
} 