import React from 'react';
import { History, Plus } from 'lucide-react';

interface PointHistoryItem {
  id: string;
  type: 'charge' | 'use';
  amount: number;
  description: string;
  status: string;
  date: string;
  time: string;
  paymentMethod: string;
  orderId: string;
}

interface PointHistorySectionProps {
  pointHistory: PointHistoryItem[];
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
                  ) : pointHistory.length === 0 ? (
                    <div className="empty-state">
                      <p>포인트 내역이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="history-historyTable">
                      <div className="history-tableHeader">
                        <div className="history-headerCell">상태/내용</div>
                        <div className="history-headerCell">충전 일시</div>
                        <div className="history-headerCell">충전 금액</div>
                        <div className="history-headerCell">충전 수단</div>
                      </div>
                      <div className="history-tableBody">
                        {pointHistory
                          .filter(item => filterType === 'all' || item.type === filterType)
                          .map((item) => (
                            <div key={item.id} className="history-tableRow">
                              <div className="history-statusCell">
                                <div className={`history-statusBadge ${item.type === 'charge' ? 'history-pending' : 'history-completed'}`}>
                                  {item.type === 'charge' ? '입금 대기' : '결제 완료'}
                                </div>
                                <div className="history-description">{item.description}</div>
                              </div>
                              <div className="history-dateCell">
                                {item.date} {item.time}
                              </div>
                              <div className="history-amountCell">
                                <span className={item.type === 'use' ? 'amount-negative' : 'amount-positive'}>
                                  {item.type === 'use' ? '-' : '+'}{Math.abs(item.amount).toLocaleString()}원
                                </span>
                              </div>
                              <div className="history-methodCell">
                                {item.paymentMethod}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
      </div>
    </div>
  );
};

export default PointHistorySection;
