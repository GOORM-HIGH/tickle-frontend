// feat-mypage/components/NavigationMenu.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  User,
  Heart,
  CreditCard,
  History,
  Settings,
  ArrowRight,
  BarChart3,
  Wallet,
  Ticket,
} from "lucide-react";
import { MyPageTab } from "./../../pages/member/mypage/constants/tabs";

type Props = {
  activeTab: MyPageTab;
  onTabChange: (tab: MyPageTab) => void;
  onNavigate: (path: string) => void;
};

const items: ReadonlyArray<{
  tab: MyPageTab;
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { tab: MyPageTab.INFO, to: "info", label: "내 정보", Icon: User },
  {
    tab: MyPageTab.RESERVATION_HISTORIES,
    to: "reservationhistories",
    label: "예매/취소 내역",
    Icon: History,
  },
  {
    tab: MyPageTab.SCRAPED_PERFORMANCES,
    to: "scraped-performance",
    label: "스크랩한 공연",
    Icon: Heart,
  },
  {
    tab: MyPageTab.PERFORMANCE_DASHBOARD,
    to: "performance-dashboard",
    label: "공연 관리",
    Icon: Settings,
  }, // BarChart3 로 교체 가능
  { tab: MyPageTab.COUPONS, to: "coupons", label: "쿠폰", Icon: Ticket },
  {
    tab: MyPageTab.SETTLEMENT_DASHBOARD,
    to: "settlement",
    label: "정산내역",
    Icon: Wallet,
  },
  {
    tab: MyPageTab.POINTS,
    to: "points",
    label: "포인트 사용내역",
    Icon: CreditCard,
  },
] as const;

export default function NavigationMenu({ onTabChange }: Props) {
  return (
    <nav className="navigation">
      <ul className="menu-list space-y-2">
        {items.map(({ tab, to, label, Icon }) => (
          <li key={tab} className="menu-item">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  "group flex w-full items-center justify-between rounded-xl px-4 py-3 transition border",
                  isActive
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-[inset_3px_0_0_0_#3182F6]"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                ].join(" ")
              }
              onClick={() => onTabChange(tab)}
              end
            >
              <span className="flex items-center gap-2">
                <Icon size={20} className="shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </span>
              <ArrowRight
                size={16}
                className="opacity-60 transition-transform group-hover:translate-x-0.5"
              />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
