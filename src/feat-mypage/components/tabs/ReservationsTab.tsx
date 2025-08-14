// ReservationsTab.tsx
import React, { useEffect, useState } from "react";
import {
  Trash2,
  Calendar,
  Hash,
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import api from "../../../services/api";
import { getAccessToken } from "../../../utils/tokenUtils";

// 전역에 이미 있다면 아래 타입은 제거
type ApiResponse<T> = { data: T };

const PAGE_SIZE = 10;

// 날짜 포맷
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
};
// D-day
const dday = (iso: string) => {
  const end = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};
// 가격 포맷
const money = (n?: number) => (n ?? 0).toLocaleString("ko-KR");

const ReservationsTab: React.FC = () => {
  // 데이터
  const [reservationList, setReservationList] = useState<
    ReservationHistoryResponse[]
  >([]);
  const [canceledReservationList, setCanceledReservationList] = useState<
    ReservationHistoryResponse[]
  >([]);

  // 상태
  const [notifyMap, setNotifyMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  // 페이지네이션
  const [page, setPage] = useState(0);
  const [cancelPage, setCancelPage] = useState(0);

  // 조회: 예매내역(진행/결제 상태)
  const fetchReservationList = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) return;

      const res = await api.get<ApiResponse<ReservationHistoryResponse[]>>(
        "/api/v1/reservation/history",
        {
          params: { page: pageNum, size: PAGE_SIZE, statusId: 9 },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setReservationList(res.data.data ?? []);
    } catch (e: any) {
      console.error("예매내역 조회 실패", e?.response?.data || e);
      setError(
        e?.response?.data?.message || "예매내역 조회 중 오류가 발생했습니다."
      );
      setReservationList([]);
    } finally {
      setLoading(false);
    }
  };

  // 조회: 취소내역
  const fetchCanceledReservationList = async (pageNum: number) => {
    try {
      setCancelLoading(true);
      setCancelError(null);
      const token = getAccessToken();
      if (!token) return;

      const res = await api.get<ApiResponse<ReservationHistoryResponse[]>>(
        "/api/v1/reservation/history",
        {
          params: { page: pageNum, size: PAGE_SIZE, statusId: 10 },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      const list = res.data.data;
      setCanceledReservationList(list);
    } catch (e: any) {
      console.error("취소내역 조회 실패", e?.response?.data || e);
      setCancelError(
        e?.response?.data?.message || "취소내역 조회 중 오류가 발생했습니다."
      );
      setCanceledReservationList([]);
    } finally {
      setCancelLoading(false);
    }
  };

  // 취소(DELETE)
  const onCancel = async (id: number) => {
    const ok = window.confirm("정말로 이 예매를 취소하시겠습니까?");
    if (!ok) return;
    try {
      setCancelingId(id);
      const token = getAccessToken();
      if (!token) return;

      await api.delete<ApiResponse<any>>(`/api/v1/reservation/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      await Promise.all([
        fetchReservationList(page),
        fetchCanceledReservationList(cancelPage),
      ]);
      alert("취소되었습니다.");
    } catch (e: any) {
      console.error("취소 실패", e?.response?.data || e);
      alert(e?.response?.data?.message || "취소에 실패했습니다.");
    } finally {
      setCancelingId(null);
    }
  };

  const onToggleNotify = (id: number) =>
    setNotifyMap((prev) => ({ ...prev, [id]: !prev[id] }));

  // 페이지 변경 시 조회
  useEffect(() => {
    fetchReservationList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  useEffect(() => {
    fetchCanceledReservationList(cancelPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelPage]);

  // 공통: 카드 스켈레톤
  const Skeleton = () => (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-64 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-40 rounded bg-gray-100" />
        </div>
        <div className="h-8 w-20 rounded bg-gray-200" />
      </div>
      <div className="mt-3 h-9 w-full rounded bg-gray-50" />
    </div>
  );

  // 공통: 페이지네이션(토스풍)
  const Pager: React.FC<{
    page: number;
    onPrev: () => void;
    onNext: () => void;
    disablePrev?: boolean;
    disableNext?: boolean;
  }> = ({ page, onPrev, onNext, disablePrev, disableNext }) => (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={disablePrev}
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        이전
      </button>
      <span className="select-none rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600">
        {page + 1}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={disableNext}
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
      >
        다음
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* 예매내역 */}
      <section className="max-w-[900px]">
        <div className="mb-4">
          <h2 className="text-[20px] font-semibold leading-tight text-gray-900">
            예매내역
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            진행 중인 예매와 결제 완료 건을 확인하세요.
          </p>
        </div>

        <div className="space-y-2">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : error ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-red-600">
              {error}
            </div>
          ) : reservationList.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-50" />
              <div className="text-[15px] font-medium text-gray-900">
                예매내역이 없습니다
              </div>
              <p className="mt-1 text-sm text-gray-500">
                예매가 완료되면 이곳에서 확인할 수 있어요.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {reservationList.map((r) => {
                const left = dday(r.performanceDate);
                const expired = left <= 0;
                const near = left > 0 && left <= 7;

                const dClass = expired
                  ? "bg-rose-50 text-rose-600 ring-rose-200"
                  : near
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : "bg-gray-50 text-gray-600 ring-gray-200";

                const notifyOn = !!notifyMap[r.reservationId];

                return (
                  <li
                    key={r.reservationId}
                    className="group rounded-2xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* 왼쪽: 타이틀/장소/일시/메타 */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold text-gray-900">
                          {r.performanceTitle}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {r.performanceHall}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {fmtDate(r.performanceDate)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 ring-1 ring-gray-200">
                            <Hash className="h-3.5 w-3.5" />
                            {r.reservationNumber}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 ring-1 ring-gray-200">
                            좌석 {r.seatCount ?? 1}석
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ${dClass}`}
                            title={expired ? "종료" : `D-${left}`}
                          >
                            {expired ? "종료" : `D-${left}`}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 ring-1 ring-gray-200">
                            상태 {r.status}
                          </span>
                        </div>
                      </div>

                      {/* 오른쪽: 금액 */}
                      <div className="text-right">
                        <div className="text-[22px] font-extrabold tracking-tight text-[#1B64DA]">
                          {money(r.price)}원
                        </div>
                      </div>
                    </div>

                    {/* 액션: 취소 / 알림 */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-gray-500">
                        예매번호 {r.reservationNumber}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleNotify(r.reservationId)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            notifyOn
                              ? "border-[#1B64DA] bg-[#1B64DA] text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          title="알림 토글"
                        >
                          {notifyOn ? (
                            <Bell className="h-4 w-4" />
                          ) : (
                            <BellOff className="h-4 w-4" />
                          )}
                          {notifyOn ? "알림 켜짐" : "알림 끔"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onCancel(r.reservationId)}
                          disabled={
                            !r.cancellable || cancelingId === r.reservationId
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
                          title={r.cancellable ? "취소하기" : "취소 불가"}
                        >
                          {cancelingId === r.reservationId ? (
                            <span className="text-xs">취소중…</span>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              취소
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Pager
          page={page}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          disablePrev={page === 0 || loading}
          disableNext={loading}
        />
      </section>

      {/* 취소내역 */}
      <section className="max-w-[900px]">
        <div className="mb-4">
          <h2 className="text-[20px] font-semibold leading-tight text-gray-900">
            취소내역
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            취소된 예매를 확인하세요.
          </p>
        </div>

        <div className="space-y-2">
          {cancelLoading ? (
            <>
              <Skeleton />
              <Skeleton />
            </>
          ) : cancelError ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-red-600">
              {cancelError}
            </div>
          ) : canceledReservationList.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-50" />
              <div className="text-[15px] font-medium text-gray-900">
                취소내역이 없습니다
              </div>
              <p className="mt-1 text-sm text-gray-500">
                최근에 취소된 예매가 없어요.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {canceledReservationList.map((r) => (
                <li
                  key={`cancel-${r.reservationId}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 opacity-90 transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-semibold text-gray-900">
                        {r.performanceTitle}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {r.performanceHall}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {fmtDate(r.performanceDate)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 ring-1 ring-gray-200">
                          <Hash className="h-3.5 w-3.5" />
                          {r.reservationNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 ring-1 ring-gray-200">
                          좌석 {r.seatCount ?? 1}석
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 ring-1 ring-rose-200">
                          취소됨
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[22px] font-extrabold tracking-tight text-gray-900">
                        {money(r.price)}원
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        취소일 {fmtDate(r.reservedAt)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Pager
          page={cancelPage}
          onPrev={() => setCancelPage((p) => Math.max(0, p - 1))}
          onNext={() => setCancelPage((p) => p + 1)}
          disablePrev={cancelPage === 0 || cancelLoading}
          disableNext={cancelLoading}
        />
      </section>
    </div>
  );
};

export default ReservationsTab;
