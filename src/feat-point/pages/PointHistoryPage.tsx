import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, Plus, Filter } from 'lucide-react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import { pointService, PointSimpleResponseDto, PagingResponse } from '../../services/pointService';
import '../../feat-mypage/styles/MyPage.css';

export const PointHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [pointHistory, setPointHistory] = useState<PointSimpleResponseDto[]>([]);
  const [pointHistoryLoading, setPointHistoryLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLast, setIsLast] = useState(false);

  // 포인트 내역 로드
  const loadPointHistory = async (page: number = 0, size: number = 10) => {
    setPointHistoryLoading(true);
    try {
      const response: PagingResponse<PointSimpleResponseDto> = await pointService.getMyPointHistory(page, size);
      
      setPointHistory(response.content);
      setCurrentPage(response.page);
      setPageSize(response.size);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setIsLast(response.isLast);
      
      console.log('포인트 내역 로드 성공:', response);
    } catch (error) {
      console.error('포인트 내역 로드 실패:', error);
      setPointHistory([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setPointHistoryLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPointHistory(page, pageSize);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setCurrentPage(0); // 필터 변경 시 첫 페이지로 이동
    loadPointHistory(0, pageSize);
  };

  // 포인트 충전 페이지로 이동
  const handleChargeClick = () => {
    navigate('/point/charge');
  };

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

  // 컴포넌트 마운트 시 포인트 내역 로드
  useEffect(() => {
    loadPointHistory(currentPage, pageSize);
  }, []);

  const filteredHistory = getFilteredHistory();

  return (
    <>
      <Header />
      <div className="pageContainer">
        {/* Header */}
        <div className="pageHeader">
          <button className="backButton" onClick={() => navigate('/mypage')}>
            <ArrowLeft size={20} />
            뒤로가기
          </button>
          <h1 className="pageTitle">포인트 내역</h1>
        </div>

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
                <label className="history-filterLabel">
                  <Filter size={16} />
                  필터
                </label>
                <select 
                  className="history-filterSelect"
                  value={filterType}
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  <option value="all">전체 내역</option>
                  <option value="charge">충전 내역</option>
                  <option value="use">사용 내역</option>
                </select>
              </div>
              <button 
                className="create-button"
                onClick={handleChargeClick}
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

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    이전
                  </button>
                  
                  <span className="pagination-info">
                    {currentPage + 1} / {totalPages}
                  </span>
                  
                  <button 
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
