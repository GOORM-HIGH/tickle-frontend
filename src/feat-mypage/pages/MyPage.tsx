import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PerformanceListItem } from '../../home/types/performance';
import Layout from '../../components/layout/Layout';
import { ChargePopup, ReceiptPopup } from '../components';
import { PointResponse } from '../../services/pointService';
import { getAccessToken } from '../../utils/tokenUtils';
import { 
  User, 
  Heart, 
  CreditCard, 
  History, 
  Settings, 
  HelpCircle, 
  Plus,
  ArrowRight,
  LogOut
} from 'lucide-react';
import '../styles/MyPage.css';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, authKey } = useAuth();
  
  // 🎯 직접 토큰으로 로그인 상태 확인
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [performances, setPerformances] = useState<PerformanceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'performances' | 'reservations' | 'coupons' | 'settlements' | 'pointHistory'>('info');
  
  // 포인트 관련 상태
  const [currentBalance, setCurrentBalance] = useState(125000);
  const [showChargePopup, setShowChargePopup] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [receiptData, setReceiptData] = useState<PointResponse | null>(null);
  const [filterType, setFilterType] = useState('all');

  // 권한 확인 (임시로 true로 설정)
  const isHost = true;

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = getAccessToken();
      const hasToken = !!token;
      setIsLoggedIn(hasToken);
      
      console.log('🔍 MyPage - 토큰 확인:', {
        hasToken,
        token: token ? `${token.substring(0, 20)}...` : 'None',
        currentUser
      });
      
      if (!hasToken) {
        alert('로그인이 필요합니다.');
        navigate('/auth/sign-in');
        return;
      }
    };

    checkLoginStatus();
  }, [navigate, authKey]);

  useEffect(() => {
    if (isHost && activeTab === 'performances') {
      loadMyPerformances();
    }
  }, [isHost, activeTab]);

  const loadMyPerformances = async () => {
    try {
      setLoading(true);
      const data = await performanceService.getMyPerformances();
      setPerformances(data);
    } catch (error) {
      console.error('공연 목록 로드 실패:', error);
      alert('공연 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerformance = async (performanceId: number) => {
    if (!window.confirm('정말로 이 공연을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await performanceService.deletePerformance(performanceId);
      alert('공연이 삭제되었습니다.');
      loadMyPerformances(); // 목록 새로고침
    } catch (error) {
      console.error('공연 삭제 실패:', error);
      alert('공연 삭제에 실패했습니다.');
    }
  };

  const handleEditPerformance = (performanceId: number) => {
    navigate(`/performance/edit/${performanceId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 포인트 관련 함수들
  const handleChargeClick = () => {
    setShowChargePopup(true);
  };

  const handleCloseChargePopup = () => {
    setShowChargePopup(false);
  };

  const handleCharge = (amount: number) => {
    setCurrentBalance(prev => prev + amount);
    setShowChargePopup(false);
  };

  const handleReceipt = (receiptData: PointResponse) => {
    setReceiptData(receiptData);
    setShowReceiptPopup(true);
  };

  // Mock 포인트 내역 데이터
  const mockPointHistory = [
    {
      id: '1',
      type: 'charge',
      amount: 30000,
      description: '포인트 충전',
      status: 'completed',
      date: '2024-01-15',
      time: '14:30',
      paymentMethod: '토스',
      orderId: 'ORD-2024-001'
    },
    {
      id: '2',
      type: 'use',
      amount: -15000,
      description: '공연 예매',
      status: 'completed',
      date: '2024-01-14',
      time: '16:45',
      paymentMethod: '포인트 사용',
      orderId: 'ORD-2024-002'
    },
    {
      id: '3',
      type: 'charge',
      amount: 50000,
      description: '포인트 충전',
      status: 'completed',
      date: '2024-01-12',
      time: '09:20',
      paymentMethod: '토스',
      orderId: 'ORD-2024-003'
    },
    {
      id: '4',
      type: 'use',
      amount: -8000,
      description: '이벤트 응모',
      status: 'completed',
      date: '2024-01-10',
      time: '11:15',
      paymentMethod: '포인트 사용',
      orderId: 'ORD-2024-004'
    },
    {
      id: '5',
      type: 'charge',
      amount: 20000,
      description: '포인트 충전',
      status: 'completed',
      date: '2024-01-08',
      time: '13:25',
      paymentMethod: '토스',
      orderId: 'ORD-2024-005'
    }
  ];

  if (!isLoggedIn) {
    return (
      <div className="mypage-loading">
        <h2>권한 확인 중...</h2>
      </div>
    );
  }

  return (
    <Layout>
      <div className="mypage">
        <div className="page-container">
          {/* 사이드바 */}
          <div className="sidebar">
            <div className="sidebar-content">
              {/* 프로필 섹션 */}
              <div className="profile-section">
                <div className="profile-image">
                  <img src="/logo.png" alt="프로필" />
                </div>
                <div className="profile-info">
                  <h3 className="user-name">사용자님</h3>
                  <div className="point-balance">
                    <span className="point-label">보유 포인트</span>
                    <span className="point-amount">{currentBalance.toLocaleString()} P</span>
                  </div>
                  <button className="charge-button" onClick={handleChargeClick}>
                    <Plus size={16} />
                    포인트 충전
                  </button>
                </div>
              </div>

              {/* 네비게이션 메뉴 */}
              <nav className="navigation">
                <ul className="menu-list">
                  <li className="menu-item">
                    <button
                      className={`menu-button ${activeTab === 'info' ? 'active' : ''}`}
                      onClick={() => setActiveTab('info')}
                    >
                      <span>
                        <User size={20} />
                        내정보
                      </span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  </li>
                  <li className="menu-item">
                    <button
                      className={`menu-button ${activeTab === 'reservations' ? 'active' : ''}`}
                      onClick={() => setActiveTab('reservations')}
                    >
                      <span>
                        <History size={20} />
                        예매/취소 내역
                      </span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  </li>
                  <li className="menu-item">
                    <button className="menu-button" onClick={() => navigate('/mypage/scraps')}>
                      <span>
                        <Heart size={20} />
                        스크랩한 공연
                      </span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  </li>
                  <li className="menu-item">
                    <button
                      className={`menu-button ${activeTab === 'performances' ? 'active' : ''}`}
                      onClick={() => setActiveTab('performances')}
                    >
                      <span>
                        <Settings size={20} />
                        공연관리
                      </span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  </li>
                  <li className="menu-item">
                    <button
                      className={`menu-button ${activeTab === 'coupons' ? 'active' : ''}`}
                      onClick={() => setActiveTab('coupons')}
                    >
                      <span>
                        <CreditCard size={20} />
                        쿠폰
                      </span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  </li>
                  <li className="menu-item">
                    <button
                      className={`menu-button ${activeTab === 'settlements' ? 'active' : ''}`}
                      onClick={() => setActiveTab('settlements')}
                    >
                      <span>
                        <History size={20} />
                        정산내역
                      </span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  </li>
                  <li className="menu-item">
                    <button
                      className={`menu-button ${activeTab === 'pointHistory' ? 'active' : ''}`}
                      onClick={() => setActiveTab('pointHistory')}
                    >
                      <span>
                        <CreditCard size={20} />
                        포인트 사용내역
                      </span>
                      <ArrowRight size={16} className="arrow-icon" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="main-content">
            {activeTab === 'info' && (
              <div className="tab-content">
                <h2 className="page-title">내정보</h2>
                <div className="user-info">
                  <p><strong>닉네임:</strong> {currentUser?.nickname}</p>
              
                </div>
              </div>
            )}

            {activeTab === 'performances' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2 className="page-title">공연관리</h2>
                  <button 
                    className="create-button"
                    onClick={() => navigate('/performance/create')}
                  >
                    새 공연 만들기
                  </button>
                </div>
                
                {loading ? (
                  <div className="loading">공연 목록을 불러오는 중...</div>
                ) : performances.length === 0 ? (
                  <div className="empty-state">
                    <p>아직 생성한 공연이 없습니다.</p>
                    <button 
                      className="create-button"
                      onClick={() => navigate('/performance/create')}
                    >
                      첫 공연 만들기
                    </button>
                  </div>
                ) : (
                  <div className="performance-list">
                    {performances.map((performance) => (
                      <div key={performance.performanceId} className="performance-item">
                        <div className="performance-image">
                          {performance.img ? (
                            <img src={performance.img} alt={performance.title} />
                          ) : (
                            <div className="no-image">이미지 없음</div>
                          )}
                        </div>
                        <div className="performance-info">
                          <h3>{performance.title}</h3>
                          <p><strong>공연일:</strong> {formatDate(performance.date)}</p>
                          <p><strong>상영시간:</strong> {performance.runtime}분</p>
                          <p><strong>장소:</strong> {performance.hallAddress}</p>
                          <p><strong>상태:</strong> {performance.status}</p>
                          {performance.isEvent && <span className="event-badge">이벤트</span>}
                        </div>
                        <div className="performance-actions">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditPerformance(performance.performanceId)}
                          >
                            수정
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeletePerformance(performance.performanceId)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reservations' && (
              <div className="tab-content">
                <h2 className="page-title">예매/취소 내역</h2>
                <p>예매 내역 기능은 준비 중입니다.</p>
              </div>
            )}

            {activeTab === 'coupons' && (
              <div className="tab-content">
                <h2 className="page-title">쿠폰</h2>
                <p>쿠폰 기능은 준비 중입니다.</p>
              </div>
            )}

            {activeTab === 'settlements' && (
              <div className="tab-content">
                <h2 className="page-title">정산내역</h2>
                <p>정산내역 기능은 준비 중입니다.</p>
              </div>
            )}

            {activeTab === 'pointHistory' && (
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
                          onChange={(e) => setFilterType(e.target.value)}
                        >
                          <option value="all">전체 내역</option>
                          <option value="charge">충전 내역</option>
                          <option value="use">사용 내역</option>
                        </select>
                      </div>
                      <button 
                        className="create-button"
                        onClick={handleChargeClick}
                        style={{ marginLeft: '1rem' }}
                      >
                        <Plus size={16} />
                        포인트 충전
                      </button>
                    </div>
                  </div>

                  <div className="history-historyTable">
                    <div className="history-tableHeader">
                      <div className="history-headerCell">상태/내용</div>
                      <div className="history-headerCell">충전 일시</div>
                      <div className="history-headerCell">충전 금액</div>
                      <div className="history-headerCell">충전 수단</div>
                    </div>
                    <div className="history-tableBody">
                      {mockPointHistory
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 포인트 충전 팝업 */}
      {showChargePopup && (
        <ChargePopup
          currentBalance={currentBalance}
          onClose={handleCloseChargePopup}
          onCharge={handleCharge}
          onReceipt={handleReceipt}
        />
      )}

      {/* 영수증 팝업 */}
      {showReceiptPopup && receiptData && (
        <ReceiptPopup
          receiptData={receiptData}
          onClose={() => setShowReceiptPopup(false)}
        />
      )}
    </Layout>
  );
};

export default MyPage; 