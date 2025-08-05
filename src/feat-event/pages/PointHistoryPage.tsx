import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Calendar, Receipt, Filter, Printer, User, Heart, FileText, HelpCircle, Settings } from 'lucide-react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import '../styles/PointHistoryPage.css';

interface PointHistory {
  id: string;
  status: 'completed' | 'cancelled' | 'charge_completed';
  description: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  bankInfo?: string;
  orderId: string;
  type: 'charge' | 'use';
}

// Mock data based on the image design
const mockPointHistory: PointHistory[] = [
  {
    id: '1',
    status: 'charge_completed',
    description: '문자 30,000건 충전',
    amount: 294000,
    paymentMethod: '토스',
    createdAt: '2020-01-20T16:27:00Z',
    bankInfo: '농협 123-456789-01-234',
    orderId: 'ORD-2020-001',
    type: 'charge'
  },
  {
    id: '2',
    status: 'completed',
    description: '문자 10,000건 충전',
    amount: 100000,
    paymentMethod: '토스',
    createdAt: '2020-01-18T14:50:00Z',
    orderId: 'ORD-2020-002',
    type: 'charge'
  },
  {
    id: '3',
    status: 'cancelled',
    description: '문자 500건 충전',
    amount: 9900,
    paymentMethod: '토스',
    createdAt: '2020-01-16T09:20:00Z',
    orderId: 'ORD-2020-003',
    type: 'charge'
  },
  {
    id: '4',
    status: 'completed',
    description: '이벤트 응모',
    amount: 5000,
    paymentMethod: '포인트 사용',
    createdAt: '2020-01-15T10:30:00Z',
    orderId: 'ORD-2020-004',
    type: 'use'
  },
  {
    id: '5',
    status: 'completed',
    description: '공연 예매',
    amount: 15000,
    paymentMethod: '포인트 사용',
    createdAt: '2020-01-14T15:45:00Z',
    orderId: 'ORD-2020-005',
    type: 'use'
  }
];

export const PointHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PointHistory[]>(mockPointHistory);
  const [currentBalance, setCurrentBalance] = useState(38010);
  const [showChargePopup, setShowChargePopup] = useState(false);
  const [historyType, setHistoryType] = useState('전체내역');
  const [activeMenu, setActiveMenu] = useState('결제내역');

  useEffect(() => {
    // TODO: 백엔드 API 호출로 실제 데이터 가져오기
    // fetchPointHistory();
  }, []);

  const handleChargeClick = () => {
    setShowChargePopup(true);
  };

  const handleCloseChargePopup = () => {
    setShowChargePopup(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'charge_completed':
        return <span className="status-tag charge-completed">충전 완료</span>;
      case 'completed':
        return <span className="status-tag completed">결제 완료</span>;
      case 'cancelled':
        return <span className="status-tag cancelled">결제 취소</span>;
      default:
        return <span className="status-tag completed">결제 완료</span>;
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCharge = () => {
    setShowChargePopup(true);
  };

  const handleSearch = () => {
    // TODO: 검색 로직 구현
    console.log('Search with:', { historyType });
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  return (
    <>
      <Header />
      <div className="mypage-container">
        {/* Left Sidebar */}
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-image">
              <img src="/public/logo.png" alt="프로필" />
            </div>
            <div className="user-info">
              <h3 className="user-name">사용자님</h3>
              <div className="point-balance">
                <span className="point-label">보유 포인트</span>
                <span className="point-amount">{currentBalance.toLocaleString()} P</span>
              </div>
              <button className="charge-point-btn" onClick={handleCharge}>
                <Plus size={16} />
                포인트 충전하기
              </button>
            </div>
          </div>

          <nav className="sidebar-nav">
            <ul className="nav-menu">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeMenu === '내정보' ? 'active' : ''}`}
                  onClick={() => handleMenuClick('내정보')}
                >
                  <User size={20} />
                  내 정보
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeMenu === '찜목록' ? 'active' : ''}`}
                  onClick={() => handleMenuClick('찜목록')}
                >
                  <Heart size={20} />
                  찜목록
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeMenu === '결제내역' ? 'active' : ''}`}
                  onClick={() => handleMenuClick('결제내역')}
                >
                  <Receipt size={20} />
                  결제내역
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeMenu === 'FAQ' ? 'active' : ''}`}
                  onClick={() => handleMenuClick('FAQ')}
                >
                  <HelpCircle size={20} />
                  FAQ
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeMenu === '설정' ? 'active' : ''}`}
                  onClick={() => handleMenuClick('설정')}
                >
                  <Settings size={20} />
                  설정
                </button>
              </li>
            </ul>
          </nav>

          <div className="sidebar-footer">
            <button className="edit-info-btn">
              정보수정
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="content-header">
            <h1 className="page-title">결제내역</h1>
            <div className="filter-section">
              <select 
                className="history-type-select"
                value={historyType}
                onChange={(e) => setHistoryType(e.target.value)}
              >
                <option value="전체내역">전체</option>
                <option value="충전내역">충전내역</option>
                <option value="사용내역">사용내역</option>
              </select>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="transaction-section">
            <div className="transaction-table">
              <div className="table-header">
                <div className="header-cell">상태/항목</div>
                <div className="header-cell">결제일</div>
                <div className="header-cell">결제 금액</div>
                <div className="header-cell">결제 수단</div>
              </div>
              <div className="table-body">
                {history.length === 0 ? (
                  <div className="empty-state">
                    <p>내역이 없습니다.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="table-row">
                      <div className="table-cell">
                        <div className="status-item">
                          {getStatusTag(item.status)}
                          <span className="item-desc">{item.description}</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className="date-time">{formatDate(item.createdAt)}</span>
                      </div>
                      <div className="table-cell">
                        <span className="amount">{item.amount.toLocaleString()}원</span>
                      </div>
                      <div className="table-cell">
                        <span className="payment-method">{item.paymentMethod}</span>
                        {item.bankInfo && (
                          <div className="bank-info">{item.bankInfo}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="pagination">
              <span className="page-number">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charge Popup */}
      {showChargePopup && (
        <div className="charge-popup-overlay">
          <div className="charge-popup">
            <div className="popup-header">
              <h2>포인트 충전</h2>
              <button className="close-btn" onClick={handleCloseChargePopup}>
                ✕
              </button>
            </div>
            <div className="popup-content">
              <div className="current-balance">
                <span className="balance-label">현재 포인트</span>
                <span className="balance-amount">{currentBalance.toLocaleString()} P</span>
              </div>
              
              <div className="charge-options">
                <h3>충전 금액 선택</h3>
                <div className="amount-grid">
                  {[10000, 30000, 50000, 100000, 200000, 500000].map((amount) => (
                    <div
                      key={amount}
                      className="amount-option"
                      onClick={() => {
                        // Handle amount selection
                        console.log('Selected amount:', amount);
                      }}
                    >
                      {amount.toLocaleString()}원
                    </div>
                  ))}
                </div>
                
                <div className="custom-amount">
                  <h4>직접 입력</h4>
                  <input
                    type="text"
                    placeholder="충전할 금액을 입력하세요 (최소 1,000원)"
                    className="amount-input"
                  />
                </div>
              </div>
              
              <div className="payment-method">
                <h3>결제 수단</h3>
                <div className="method-option selected">
                  <span>토스</span>
                </div>
              </div>
              
              <div className="charge-summary">
                <div className="summary-row">
                  <span>충전 금액</span>
                  <span>0원</span>
                </div>
              </div>
              
              <button className="charge-button">
                충전하기
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}; 