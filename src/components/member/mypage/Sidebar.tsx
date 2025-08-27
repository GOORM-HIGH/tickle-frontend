// feat-mypage/components/Sidebar.tsx
import React from "react";

import NavigationMenu from "../../../feat-mypage/components/NavigationMenu.tsx";
import { MyPageTab } from "../../../feat-mypage/constants/tabs.ts";
import ProfileSection from "../../../feat-mypage/components/ProfileSection.tsx";

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
  onNavigate,
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
