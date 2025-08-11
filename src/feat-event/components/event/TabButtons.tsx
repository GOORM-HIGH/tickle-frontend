import React from 'react';
import styles from '../../styles/event.module.css';

interface TabButtonsProps {
  activeTab: 'coupon' | 'ticket';
  onTabChange: (tab: 'coupon' | 'ticket') => void;
  onTicketTabClick: () => void;
}

const TabButtons: React.FC<TabButtonsProps> = ({ activeTab, onTabChange, onTicketTabClick }) => {
  const handleTabClick = (tab: 'coupon' | 'ticket') => {
    onTabChange(tab);
    if (tab === 'ticket') {
      onTicketTabClick();
    }
  };

  return (
    <div className={styles.tabButtons}>
      <button
        className={`${styles.tabButton} ${activeTab === 'coupon' ? styles.active : ''}`}
        onClick={() => handleTabClick('coupon')}
      >
        쿠폰 이벤트
      </button>
      <button
        className={`${styles.tabButton} ${activeTab === 'ticket' ? styles.active : ''}`}
        onClick={() => handleTabClick('ticket')}
      >
        티켓 이벤트
      </button>
    </div>
  );
};

export default TabButtons; 