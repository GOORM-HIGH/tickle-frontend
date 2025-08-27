import React, { useMemo, useCallback } from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import Sidebar from "../../../components/member/mypage/Sidebar";
import { MyPageTab } from "../../../pages/member/mypage/constants/tabs";

// 탭 → 경로 매핑
const tabToPath: Record<MyPageTab, string> = {
  INFO: "/mypage/info",
  RESERVATION_HISTORIES: "/mypage/reservationhistories",
  SCRAPED_PERFORMANCES: "/mypage/scraped-performance",
  PERFORMANCE_DASHBOARD: "/mypage/performance-dashboard",
  COUPONS: "/mypage/coupons",
  SETTLEMENT_DASHBOARD: "/mypage/settlement",
  POINTS: "/mypage/points",
};

// 경로 → 탭 매핑
const pathToTab = (pathname: string): MyPageTab => {
  const entries = Object.entries(tabToPath).sort(
    (a, b) => b[1].length - a[1].length // 경로가 긴 것부터 매칭
  );

  for (const [key, path] of entries) {
    if (pathname.startsWith(path)) {
      return key as MyPageTab;
    }
  }

  // 매칭 실패 시 기본 탭
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

  const handleTabChange = useCallback(
    (tab: MyPageTab) => {
      const to = tabToPath[tab];
      if (to && to !== location.pathname) navigate(to);
    },
    [navigate, location.pathname]
  );

  const handleNavigate = useCallback(
    (path: string) => {
      if (path && path !== location.pathname) navigate(path);
    },
    [navigate, location.pathname]
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* 헤더 (생략) */}
      <div className="max-w-[1400px] mx-auto p-8 gap-8 min-h-[calc(100vh-120px)] flex max-[1024px]:flex-col">
        <aside className="w-[350px] min-w-[350px] max-[1024px]:w-full">
          <Sidebar
            currentBalance={currentBalance}
            activeTab={activeTab}
            onChargeClick={onChargeClick}
            onTabChange={handleTabChange}
            onNavigate={handleNavigate}
          />
        </aside>
        <div className="flex-1 rounded-[24px] p-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
