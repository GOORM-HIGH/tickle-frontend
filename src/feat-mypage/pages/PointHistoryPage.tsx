import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  CreditCard, 
  History, 
  Settings, 
  HelpCircle, 
  Plus,
  ArrowRight
} from 'lucide-react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import { ChargePopup, ReceiptPopup } from '../components';
import { PointResponse } from '../../services/pointService';
import '../styles/history.css';

// Mock data
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

const menuItems = [
  { id: 'profile', label: '내 정보', icon: User },
  { id: 'wishlist', label: '찜목록', icon: Heart },
  { id: 'history', label: '포인트 내역', icon: History },
  { id: 'payment', label: '결제 내역', icon: CreditCard },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'settings', label: '설정', icon: Settings }
];

const PointHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentBalance, setCurrentBalance] = useState(125000);
  const [activeMenu, setActiveMenu] = useState('history');
  const [showChargePopup, setShowChargePopup] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [receiptData, setReceiptData] = useState<PointResponse | null>(null);
  const [filterType, setFilterType] = useState('all');



  const handleChargeClick = () => {
    setShowChargePopup(true);
  };

  const handleCloseChargePopup = () => {
    setShowChargePopup(false);
  };

  const handleCharge = (amount: number) => {
    setCurrentBalance(prev => prev + amount);
  };

  const handleReceipt = (receiptData: PointResponse) => {
    setReceiptData(receiptData);
    setShowReceiptPopup(true);
  };

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const filteredHistory = mockPointHistory.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'charge') return item.type === 'charge';
    if (filterType === 'use') return item.type === 'use';
    return true;
  });

  const renderMainContent = () => {
    switch (activeMenu) {
      case 'history':
        return (
          <div className="mainContent">
            <div className="contentHeader">
              <div className="headerLeft">
                <div className="titleSection">
                  <div className="titleIcon">
                    <History size={24} />
                  </div>
                  <div className="titleContent">
                    <h1 className="pageTitle">포인트 내역</h1>
                    <p className="pageSubtitle">포인트 충전 및 사용 내역을 확인하세요</p>
                  </div>
                </div>
              </div>
              <div className="headerRight">
                <div className="filterContainer">
                  <label className="filterLabel">필터</label>
                  <select 
                    className="filterSelect"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">전체 내역</option>
                    <option value="charge">충전 내역</option>
                    <option value="use">사용 내역</option>
                  </select>
                </div>
              </div>
            </div>



            <div className="historyTable">
              <div className="tableHeader">
                <div className="headerCell">상태/내용</div>
                <div className="headerCell">충전 일시</div>
                <div className="headerCell">충전 금액</div>
                <div className="headerCell">충전 수단</div>
              </div>
              <div className="tableBody">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="tableRow">
                    <div className="statusCell">
                      <div className={`statusBadge ${item.type === 'charge' ? 'pending' : 'completed'}`}>
                        {item.type === 'charge' ? '입금 대기' : '결제 완료'}
                      </div>
                      <div className="description">{item.description}</div>
                    </div>
                    <div className="dateCell">
                      {item.date} {item.time}
                    </div>
                    <div className="amountCell">
                      {item.amount.toLocaleString()}원
                    </div>
                    <div className="methodCell">
                      {item.paymentMethod}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="mainContent">
            <div className="contentHeader">
              <div className="headerLeft">
                <h1 className="pageTitle">결제 내역</h1>
                <p className="pageSubtitle">결제 관련 모든 내역을 확인하세요</p>
              </div>
            </div>
            <div className="comingSoon">
              <div className="comingSoonIcon">🚧</div>
              <h2>준비 중인 기능입니다</h2>
              <p>곧 더 자세한 결제 내역을 확인할 수 있습니다.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="mainContent">
            <div className="contentHeader">
              <div className="headerLeft">
                <h1 className="pageTitle">
                  {menuItems.find(item => item.id === activeMenu)?.label || '페이지'}
                </h1>
                <p className="pageSubtitle">곧 업데이트될 기능입니다</p>
              </div>
            </div>
            <div className="comingSoon">
              <div className="comingSoonIcon">🚧</div>
              <h2>준비 중인 기능입니다</h2>
              <p>곧 더 많은 기능을 제공할 예정입니다.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Header />
              <div className="pageContainer">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="profileSection">
              <div className="profileImage">
                <img 
          src="/logo.png" 
          alt="프로필" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            console.error('프로필 이미지 로드 실패:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
              </div>
              <div className="profileInfo">
                <h3 className="userName">사용자님</h3>
                <div className="pointBalance">
                  <span className="pointLabel">보유 포인트</span>
                  <span className="pointAmount">{currentBalance.toLocaleString()} P</span>
                </div>
                <button className="chargeButton" onClick={handleChargeClick}>
                  <Plus size={16} />
                  포인트 충전
                </button>
              </div>
            </div>

            <nav className="navigation">
              <ul className="menuList">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.id} className="menuItem">
                      <button
                        className={`menuButton ${activeMenu === item.id ? 'active' : ''}`}
                        onClick={() => handleMenuClick(item.id)}
                      >
                        <IconComponent size={20} />
                        <span>{item.label}</span>
                        <ArrowRight size={16} className="arrowIcon" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

        {/* Main Content */}
        {renderMainContent()}

        {/* Popups */}
        {showChargePopup && (
          <ChargePopup
            currentBalance={currentBalance}
            onClose={handleCloseChargePopup}
            onCharge={handleCharge}
            onReceipt={handleReceipt}
          />
        )}

        {showReceiptPopup && receiptData && (
          <ReceiptPopup
            receiptData={receiptData}
            onClose={() => setShowReceiptPopup(false)}
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default PointHistoryPage; 