import React from 'react';
import { History, Plus } from 'lucide-react';
import { PointSimpleResponseDto } from '../../services/pointService';

interface PointHistorySectionProps {
  pointHistory: PointSimpleResponseDto[];
  pointHistoryLoading: boolean;
  filterType: string;
  onFilterChange: (type: string) => void;
  onChargeClick: () => void;
}

const PointHistorySection: React.FC<PointHistorySectionProps> = ({
  pointHistory,
  pointHistoryLoading,
  filterType,
  onFilterChange,
  onChargeClick
}) => {
  // 포인트 내역을 필터링하고 정렬하는 함수
  const getFilteredHistory = () => {
    let filtered = pointHistory;
    
    // 필터 타입에 따라 내역 필터링
    if (filterType === 'charge') {
      filtered = pointHistory.filter(item => item.credit > 0);
    } else if (filterType === 'use') {
      filtered = pointHistory.filter(item => item.credit < 0);
    }
    
    // 날짜순으로 정렬 (최신순)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // 날짜와 시간을 분리하는 함수
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('ko-KR');
    const timeStr = date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return { date: dateStr, time: timeStr };
  };

  // 포인트 타입에 따른 상태와 설명을 반환하는 함수
  const getPointInfo = (item: PointSimpleResponseDto) => {
    if (item.credit > 0) {
      return {
        type: 'charge',
        status: '충전 완료',
        description: '포인트 충전',
        className: 'history-completed'
      };
    } else if (item.credit < 0) {
      return {
        type: 'use',
        status: '사용 완료',
        description: '포인트 사용',
        className: 'history-pending'
      };
    } else {
      return {
        type: 'neutral',
        status: '처리됨',
        description: '포인트 처리',
        className: 'history-completed'
      };
    }
  };

  const filteredHistory = getFilteredHistory();

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
          <div className="history-historyTable">
            <div className="history-tableHeader">
              <div className="history-headerCell">상태/내용</div>
              <div className="history-headerCell">처리 일시</div>
              <div className="history-headerCell">포인트</div>
              <div className="history-headerCell">주문번호</div>
            </div>
            <div className="history-tableBody">
              {filteredHistory.map((item, index) => {
                const { date, time } = formatDateTime(item.createdAt);
                const pointInfo = getPointInfo(item);
                
                return (
                  <div key={`${item.orderId}-${index}`} className="history-tableRow">
                    <div className="history-statusCell">
                      <div className={`history-statusBadge ${pointInfo.className}`}>
                        {pointInfo.status}
                      </div>
                      <div className="history-description">{pointInfo.description}</div>
                    </div>
                    <div className="history-dateCell">
                      {date} {time}
                    </div>
                    <div className="history-amountCell">
                      <span className={pointInfo.type === 'use' ? 'amount-negative' : 'amount-positive'}>
                        {pointInfo.type === 'use' ? '' : '+'}{item.credit.toLocaleString()}P
                      </span>
                    </div>
                    <div className="history-methodCell">
                      {item.orderId || '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointHistorySection;
