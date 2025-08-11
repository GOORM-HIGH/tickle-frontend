import React from 'react';
import { useNavigate } from 'react-router-dom';

type SidebarTabKey = 'info' | 'reservations' | 'performances' | 'coupons' | 'settlements' | 'scraps';

interface MyPageSidebarProps {
  activeTab?: SidebarTabKey;
  onChangeTab?: (tab: Exclude<SidebarTabKey, 'scraps'>) => void;
}

const MyPageSidebar: React.FC<MyPageSidebarProps> = ({ activeTab, onChangeTab }) => {
  const navigate = useNavigate();

  const handleClick = (key: SidebarTabKey) => {
    if (onChangeTab && key !== 'scraps') {
      onChangeTab(key);
      return;
    }

    // Navigation mode (used by ScrapPage or when onChangeTab is not provided)
    switch (key) {
      case 'info':
        navigate('/mypage');
        break;
      case 'reservations':
        navigate('/mypage/reservations');
        break;
      case 'coupons':
        navigate('/mypage/coupons');
        break;
      case 'performances':
        // In sidebar outside MyPage, go to host dashboard page
        navigate('/performance/host');
        break;
      case 'settlements':
        navigate('/mypage/settlements');
        break;
      case 'scraps':
        navigate('/performance/scraps');
        break;
      default:
        break;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <h3>마이페이지</h3>
        <ul className="sidebar-menu">
          <li
            className={activeTab === 'info' ? 'active' : ''}
            onClick={() => handleClick('info')}
          >
            내정보
          </li>
          <li
            className={activeTab === 'reservations' ? 'active' : ''}
            onClick={() => handleClick('reservations')}
          >
            예매/취소 내역
          </li>
          <li
            className={activeTab === 'scraps' ? 'active' : ''}
            onClick={() => handleClick('scraps')}
          >
            스크랩한 공연
          </li>
          <li
            className={activeTab === 'performances' ? 'active' : ''}
            onClick={() => handleClick('performances')}
          >
            공연관리
          </li>
          <li
            className={activeTab === 'coupons' ? 'active' : ''}
            onClick={() => handleClick('coupons')}
          >
            쿠폰
          </li>
          <li
            className={activeTab === 'settlements' ? 'active' : ''}
            onClick={() => handleClick('settlements')}
          >
            정산내역
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MyPageSidebar;


