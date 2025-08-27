import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import Sidebar from "../../../components/member/mypage/Sidebar.tsx";
import { MyPageTab } from "./constants/tabs.ts";

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
  for (const [key, path] of entries)
    if (pathname.startsWith(path)) return key as MyPageTab;
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
    if (to && to !== location.pathname) navigate(to);
  };

  const handleNavigate = (path: string) => {
    if (path && path !== location.pathname) navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* 헤더 */}
      <header className="bg-[#3682F7] text-white py-4 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between max-[1024px]:px-4">
          <h1 className="text-[1.8rem] font-bold m-0 drop-shadow">
            마이페이지
          </h1>
          <nav className="flex items-center gap-8 max-[768px]:gap-4">
            {[
              { to: "/mypage/info", label: "내 정보" },
              { to: "/mypage/points", label: "포인트 내역" },
              { to: "/mypage/performance-dashboard", label: "공연 관리" },
              { to: "/mypage/settlement", label: "정산 대시보드" },
            ].map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/mypage/info"}
                className={({ isActive }) =>
                  [
                    "no-underline text-white font-medium px-4 py-2 rounded-lg transition",
                    isActive
                      ? "bg-white/20 font-semibold"
                      : "hover:bg-white/10 -translate-y-[1px]",
                  ].join(" ")
                }
              >
                {it.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="bg-[#3682F7] text-white border border-white px-4 py-2 rounded-md font-medium transition
                         hover:bg-white hover:text-[#3682F7]"
              onClick={() => {
                // TODO: 로그아웃 로직
              }}
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>

      {/* 메인 */}
      <div
        className="max-w-[1400px] mx-auto p-8 gap-8 min-h-[calc(100vh-120px)] flex
                      max-[1200px]:max-w-full max-[1200px]:p-6 max-[1024px]:flex-col max-[1024px]:p-4"
      >
        {/* 사이드바 래퍼(고정 폭, 카드 스타일) */}
        <aside
          className="w-[350px] min-w-[350px] max-w-[350px] bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.1)]
                     p-10 flex flex-col gap-10 h-fit border-0
                     max-[1024px]:w-full max-[1024px]:min-w-0 max-[1024px]:max-w-none"
        >
          {/* Sidebar 내부는 컴포넌트에 위임 */}
          <Sidebar
            currentBalance={currentBalance}
            activeTab={activeTab}
            onChargeClick={onChargeClick}
            onTabChange={handleTabChange}
            onNavigate={handleNavigate}
          />
        </aside>

        {/* 아울렛(본문 카드) */}
        <div
          className="flex-1 bg-[linear-gradient(180deg,#ffffff_0%,#fafbfc_100%)] rounded-[24px]
                     shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-12 min-h-[calc(100vh-200px)] border-0
                     backdrop-blur-[10px] max-[768px]:p-6 max-[480px]:p-4"
        >
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
