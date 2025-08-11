import React from 'react';
import { History, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { PointHistoryResponse } from '../../../services/pointService';

interface PointHistoryTabProps {
  pointHistory: PointHistoryResponse[];
  pointHistoryLoading: boolean;
  filterType: string;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  onFilterChange: (type: string) => void;
  onChargeClick: () => void;
  onPageChange: (page: number) => void;
}

const PointHistoryTab: React.FC<PointHistoryTabProps> = ({
  pointHistory,
  pointHistoryLoading,
  filterType,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  isLast,
  onFilterChange,
  onChargeClick,
  onPageChange,
  onPageSizeChange
}) => {
  // 포인트 타입에 따른 표시 텍스트 변환
  const getPointTypeText = (target: string) => {
    switch (target) {
      case 'CHARGE':
        return '포인트 충전';
      case 'USE':
        return '포인트 사용';
      case 'REFUND':
        return '포인트 환불';
      case 'BALANCE':
        return '잔액 조회';
      default:
        return target;
    }
  };

  // 포인트 타입에 따른 상태 표시
  const getPointStatus = (target: string) => {
    switch (target) {
      case 'CHARGE':
        return 'history-pending';
      case 'USE':
        return 'history-completed';
      case 'REFUND':
        return 'history-refund';
      default:
        return 'history-neutral';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (dateString === '-') return '-';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };

  // 필터링된 포인트 내역
  const filteredHistory = pointHistory.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'charge') return item.credit > 0;
    if (filterType === 'use') return item.credit < 0;
    return true;
  });

  return (
    <div className="tab-content">
      <div className="history-mainContent">
        <div className="history-contentHeader">
          <div className="history-headerLeft">
            <div className="history-titleSection">
              <div className="history-titleIcon">
                <History size={24} />
              </div>
              <div className="history-titleContent">
                <h1 className="history-pageTitle">포인트 내역</h1>
                <p className="history-pageSubtitle">포인트 충전 및 사용 내역을 확인하세요</p>
              </div>
            </div>
          </div>
          <div className="history-headerRight">
            <div className="history-filterContainer">
              <label className="history-filterLabel">필터</label>
              <select 
                className="history-filterSelect"
                value={filterType}
                onChange={(e) => onFilterChange(e.target.value)}
              >
                <option value="all">전체 내역</option>
                <option value="charge">충전 내역</option>
                <option value="use">사용 내역</option>
              </select>
            </div>
            <button 
              className="create-button"
              onClick={onChargeClick}
            >
              <Plus size={16} />
              포인트 충전
            </button>
          </div>
        </div>

        {pointHistoryLoading ? (
          <div className="loading">포인트 내역을 불러오는 중...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-state">
            <p>포인트 내역이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="history-historyTable">
              <div className="history-tableHeader">
                <div className="history-headerCell">상태/내용</div>
                <div className="history-headerCell">일시</div>
                <div className="history-headerCell">포인트</div>
                <div className="history-headerCell">주문번호</div>
              </div>
              <div className="history-tableBody">
                {filteredHistory.map((item, index) => (
                  <div key={`${item.orderId}-${index}`} className="history-tableRow">
                    <div className="history-statusCell">
                      <div className={`history-statusBadge ${getPointStatus(item.target)}`}>
                        {getPointTypeText(item.target)}
                      </div>
                      <div className="history-description">
                        {item.target === 'BALANCE' ? '잔액 조회' : `${item.target === 'CHARGE' ? '충전' : '사용'} 내역`}
                      </div>
                    </div>
                    <div className="history-dateCell">
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="history-amountCell">
                      <span className={item.credit < 0 ? 'amount-negative' : 'amount-positive'}>
                        {item.credit > 0 ? '+' : ''}{item.credit.toLocaleString()}P
                      </span>
                    </div>
                    <div className="history-methodCell">
                      {item.orderId === '-' ? '-' : item.orderId}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  총 {totalElements}건, {currentPage + 1} / {totalPages} 페이지
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft size={16} />
                    이전
                  </button>
                  
                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="pagination-button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLast}
                  >
                    다음
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PointHistoryTab;
