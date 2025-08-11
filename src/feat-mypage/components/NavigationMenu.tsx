import React from 'react';
import { 
  User, 
  Heart, 
  CreditCard, 
  History, 
  Settings, 
  ArrowRight 
} from 'lucide-react';
import { MyPageTab } from '../constants/tabs';

interface NavigationMenuProps {
  activeTab: MyPageTab;
  onTabChange: (tab: MyPageTab) => void;
  onNavigate: (path: string) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ 
  activeTab, 
  onTabChange, 
  onNavigate 
}) => {
  return (
    <nav className="navigation">
      <ul className="menu-list">
        <li className="menu-item">
          <button
            className={`menu-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => onTabChange('info')}
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
            onClick={() => onTabChange('reservations')}
          >
            <span>
              <History size={20} />
              예매/취소 내역
            </span>
            <ArrowRight size={16} className="arrow-icon" />
          </button>
        </li>
        <li className="menu-item">
          <button className="menu-button" onClick={() => onNavigate('/mypage/scraps')}>
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
            onClick={() => onTabChange('performances')}
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
            onClick={() => onTabChange('coupons')}
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
            onClick={() => onTabChange('settlements')}
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
            onClick={() => onTabChange('pointHistory')}
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
  );
};

export default NavigationMenu;
