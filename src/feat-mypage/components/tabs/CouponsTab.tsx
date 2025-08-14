// pages/mypage/CouponsTab.tsx
import { useEffect, useState, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { CouponResponseDto } from "../../../types/reservation";
import { PagingResponse } from "../../../types/coupon";
import { getAccessToken } from "../../../utils/tokenUtils";
import api from "../../../services/api";

// 전역에 이미 있다면 제거하세요.
type ApiResponse<T> = { data: T };

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}
function daysLeft(iso: string) {
  const end = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

export default function CouponsTab() {
  const [items, setItems] = useState<CouponResponseDto[]>([]);
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCoupons = async (p: number) => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) return;

      const res = await api.get<ApiResponse<PagingResponse<CouponResponseDto>>>(
        "/api/v1/mypage/coupons",
        {
          params: { page: p, size: PAGE_SIZE },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      const data = res.data.data;
      setItems(data.content);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setIsLast(data.isLast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(0); // 첫 렌더 시 totalPages 확보
  }, []);

  const goPrev = () => page > 0 && fetchCoupons(page - 1);
  const goNext = () => !isLast && fetchCoupons(page + 1);

  const headerRight = useMemo(
    () => (
      <div className="text-xs text-gray-500">
        {totalPages > 0 ? `Page ${page + 1} / ${totalPages}` : "Page 0 / 0"}
      </div>
    ),
    [page, totalPages]
  );

  return (
    <section className="max-w-[760px]">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-[20px] font-semibold leading-tight text-gray-900">
            내 쿠폰
          </h2>
        </div>
        {headerRight}
      </div>

      {/* 리스트 영역 */}
      <div className="space-y-2">
        {loading ? (
          // 토스풍 스켈레톤
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-64 rounded bg-gray-100" />
                </div>
                <div className="h-7 w-16 rounded bg-gray-200" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          // 빈 상태
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-50" />
            <div className="text-[15px] font-medium text-gray-900">
              보유 중인 쿠폰이 없어요
            </div>
            <p className="mt-1 text-sm text-gray-500">
              이벤트에 참여하거나, 발급받은 쿠폰을 등록해 보세요.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((c) => {
              const dLeft = daysLeft(c.couponValid);
              const expired = dLeft <= 0;
              const near = dLeft > 0 && dLeft <= 7;

              const badgeClass = expired
                ? "bg-rose-50 text-rose-600 ring-rose-200"
                : near
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : "bg-gray-50 text-gray-600 ring-gray-200";

              return (
                <li
                  key={c.couponId}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center justify-between">
                    {/* 좌측: 이름/만료일 */}
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-gray-900">
                        {c.couponName}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="truncate">
                          만료일 {formatDate(c.couponValid)}
                        </span>
                      </div>
                    </div>

                    {/* 우측: 할인율 + D-day */}
                    <div className="text-right">
                      <div className="text-[22px] font-extrabold tracking-tight text-[#1B64DA]">
                        {c.couponRate}%
                      </div>
                      <div
                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${badgeClass}`}
                        title={expired ? "만료됨" : `D-${dLeft}`}
                      >
                        {expired ? "만료" : `D-${dLeft}`}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={page === 0 || loading}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>

        <span className="select-none rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600">
          {totalPages === 0 ? 0 : page + 1} / {totalPages}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast || loading}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
