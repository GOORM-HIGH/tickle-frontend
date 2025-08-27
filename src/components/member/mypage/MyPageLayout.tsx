import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./../../../feat-mypage/components/Sidebar";
import { MyPageTab } from "./../../../pages/member/mypage/constants/tabs";

const tabToPath: Record<MyPageTab, string> = {
  INFO: "/mypage/info",
  RESERVATION_HISTORIES: "/mypage/reservationhistories",
  SCRAPED_PERFORMANCES: "/mypage/scraped-performance",
  PERFORMANCE_DASHBOARD: "/mypage/performance-dashboard",
  COUPONS: "/mypage/coupons",
  SETTLEMENT_DASHBOARD: "/mypage/settlement",
  POINTS: "/mypage/points",
};

const pathToTab = (pathname: string): MyPageTab => {
  const entries = Object.entries(tabToPath).sort(
    (a, b) => b[1].length - a[1].length
  );
  for (const [tabKey, path] of entries) {
    if (pathname.startsWith(path)) {
      return tabKey as MyPageTab;
    }
  }
  return MyPageTab.INFO;
};

type Props = {
  currentBalance: number;
  onChargeClick: () => void;
};

export default function MyPageLayout({ currentBalance, onChargeClick }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(
    () => pathToTab(location.pathname),
    [location.pathname]
  );

  const handleTabChange = (tab: MyPageTab) => {
    const to = tabToPath[tab];
    if (to && to !== location.pathname) {
      navigate(to);
    }
  };

  const handleNavigate = (path: string) => {
    if (path && path !== location.pathname) {
      navigate(path);
    }
  };

  return (
    <div className="mypage">
      <div className="page-container">
        <Sidebar
          currentBalance={currentBalance}
          activeTab={activeTab}
          onChargeClick={onChargeClick}
          onTabChange={handleTabChange}
          onNavigate={handleNavigate}
        />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
