import React from 'react';
import ProfileSection from './ProfileSection';
import NavigationMenu from './NavigationMenu';
import { MyPageTab } from '../constants/tabs';

interface SidebarProps {
  currentBalance: number;
  activeTab: MyPageTab;
  onChargeClick: () => void;
  onTabChange: (tab: MyPageTab) => void;
  onNavigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentBalance,
  activeTab,
  onChargeClick,
  onTabChange,
  onNavigate
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <ProfileSection 
          currentBalance={currentBalance}
          onChargeClick={onChargeClick}
        />
        <NavigationMenu 
          activeTab={activeTab}
          onTabChange={onTabChange}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};

export default Sidebar; 