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
  // 1. tabToPath 객체를 [키, 값] 쌍의 배열로 꺼내 정렬
  const entries = Object.entries(tabToPath).sort(
    (a, b) => b[1].length - a[1].length
  );

  // 2. 정렬된 엔트리를 순회하면서,
  for (const [tabKey, path] of entries) {
    // 현재 pathname이 path로 시작하면 해당 탭으로 판정
    if (pathname.startsWith(path)) {
      return tabKey as MyPageTab;
    }
  }

  // 3. 어떤 탭도 매칭되지 않으면 기본값 반환
  return "INFO" as MyPageTab;
};

type Props = {
  currentBalance: number;
  onChargeClick: () => void;
};

export default function MyPageLayout({ currentBalance, onChargeClick }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  // URL → activeTab
  const activeTab = useMemo(
    () => pathToTab(location.pathname),
    [location.pathname]
  );

  // 탭 클릭 시 → URL 이동
  const handleTabChange = (tab: MyPageTab) => {
    const to = tabToPath[tab];
    if (to && to !== location.pathname) {
      navigate(to);
    }
  };

  // 임의 경로 이동(사이드바 내 링크 버튼 등에서 사용)
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
