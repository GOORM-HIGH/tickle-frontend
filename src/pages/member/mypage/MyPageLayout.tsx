// pages/mypage/MyPageLayout.tsx
import { NavLink, Outlet } from "react-router-dom";

const linkBase = "block rounded-xl px-4 py-3 transition";
const linkActive = "bg-black text-white shadow";
const linkInactive = "bg-white hover:bg-gray-100 text-gray-800";

export default function MyPageLayout() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* 왼쪽 메뉴 */}
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border p-5">
            <nav className="space-y-2">
              <SectionTitle>메뉴</SectionTitle>

              <MenuItem to="info" label="내정보" />
              <MenuItem to="reservations" label="예매/취소 내역" />
              <MenuItem to="tickets" label="예매권" />
              <MenuItem to="coupons" label="쿠폰" />
              <MenuItem to="performance" label="공연관리" />
              <MenuItem to="settlement" label="정산내역" />
            </nav>
          </div>
        </aside>

        {/* 오른쪽 컨텐츠 */}
        <main className="col-span-12 md:col-span-9">
          <div className="rounded-2xl border p-6 bg-white">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-lg font-semibold mb-3">{children}</div>;
}

function MenuItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkInactive}`
      }
      end
    >
      {label}
    </NavLink>
  );
}
