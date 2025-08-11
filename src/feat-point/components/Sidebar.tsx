import React from 'react';
import { User, Heart, Receipt, Calendar as CalendarIcon, Gift, HelpCircle, Settings, Plus } from 'lucide-react';
import styles from '../styles/history.module.css';

interface SidebarProps {
  currentBalance: number;
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  onChargeClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentBalance,
  activeMenu,
  onMenuClick,
  onChargeClick
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          <img src="/logo.png" alt="프로필" />
        </div>
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>사용자님</h3>
          <div className={styles.pointBalance}>
            <span className={styles.pointLabel}>보유 포인트</span>
            <span className={styles.pointAmount}>{currentBalance.toLocaleString()} P</span>
          </div>
          <button className={styles.chargePointBtn} onClick={onChargeClick}>
            <Plus size={16} />
            포인트 충전하기
          </button>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.navMenu}>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navLink} ${activeMenu === '내정보' ? styles.active : ''}`}
              onClick={() => onMenuClick('내정보')}
            >
              <User size={20} />
              내 정보
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navLink} ${activeMenu === '찜목록' ? styles.active : ''}`}
              onClick={() => onMenuClick('찜목록')}
            >
              <Heart size={20} />
              찜목록
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navLink} ${activeMenu === '결제내역' ? styles.active : ''}`}
              onClick={() => onMenuClick('결제내역')}
            >
              <Receipt size={20} />
              결제내역
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navLink} ${activeMenu === '예매내역' ? styles.active : ''}`}
              onClick={() => onMenuClick('예매내역')}
            >
              <Receipt size={20} />
              예매내역
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navLink} ${activeMenu === '찜목록' ? styles.active : ''}`}
              onClick={() => onMenuClick('찜목록')}
            >
              <Heart size={20} />
              찜목록
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navLink} ${activeMenu === '결제내역' ? styles.active : ''}`}
              onClick={() => onMenuClick('결제내역')}
            >
              <Receipt size={20} />
              결제내역
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navLink} ${activeMenu === 'FAQ' ? styles.active : ''}`}
              onClick={() => onMenuClick('FAQ')}
            >
              <HelpCircle size={20} />
              FAQ
            </button>
          </li>
          <li className={styles.navItem}>
            <button 
              className={`${styles.navLink} ${activeMenu === '설정' ? styles.active : ''}`}
              onClick={() => onMenuClick('설정')}
            >
              <Settings size={20} />
              설정
            </button>
          </li>
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.editInfoBtn}>
          정보수정
        </button>
      </div>
    </div>
  );
}; 