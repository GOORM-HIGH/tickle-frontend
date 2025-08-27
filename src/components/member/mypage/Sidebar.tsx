import React from "react";

import NavigationMenu from "./NavigationMenu.tsx";

import { MyPageTabs } from "../../../constants/myPageTabs.ts";
import ProfileSection from "./ProfileSection.tsx";

interface SidebarProps {
  currentBalance: number;
  activeTab: MyPageTabs;
  onChargeClick: () => void;
  onTabChange: (tab: MyPageTabs) => void;
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
