// ReservationsTab.tsx
import React, { useEffect, useState } from "react";
import { Trash2, CheckSquare } from "lucide-react";
import api from "../../../services/api";
import { getAccessToken } from "../../../utils/tokenUtils";

// 전역에 이미 있다면 아래 타입은 제거
type ApiResponse<T> = { data: T };

const PAGE_SIZE = 10;

// 날짜 포맷 함수
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

// 콘솔 로깅 유틸
const logList = (label: string, list: ReservationHistoryResponse[] = []) => {
  try {
    console.groupCollapsed(`[${label}] count=${list.length}`);
    console.log("raw:", list);
    // 보기 편하게 주요 컬럼만 테이블로
    const pick = list.map((v) => ({
      id: v.reservationId,
      code: v.reservationNumber,
      title: v.performanceTitle,
      hall: v.performanceHall,
      date: v.performanceDate,
      seats: v.seatCount,
      price: v.price,
      status: v.status,
      cancellable: v.cancellable,
    }));
    // table이 지원되지 않는 환경도 있으니 try
    // @ts-ignore
    console.table?.(pick);
  } finally {
    console.groupEnd();
  }
};

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
  const [cancelingId, setCancelingId] = useState<number | null>(null); // 개별 취소 로딩
  const [showDebug, setShowDebug] = useState(false); // 디버그 패널 토글

  // 예매내역 페이지네이션
  const [page, setPage] = useState(0);
  const onPrevPage = () => setPage((p) => Math.max(0, p - 1));
  const onNextPage = () => setPage((p) => p + 1);

  // 취소내역 페이지네이션
  const [cancelPage, setCancelPage] = useState(0);
  const onPrevCancelPage = () => setCancelPage((p) => Math.max(0, p - 1));
  const onNextCancelPage = () => setCancelPage((p) => p + 1);

  // 조회: 예매내역(진행중 등)
  const fetchReservationList = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) return;

      const res = await api.get<ApiResponse<ReservationHistoryResponse[]>>(
        "/api/v1/reservation/history",
        {
          // statusId는 서버의 진행중/결제완료 등 상태 ID에 맞춰 조정
          params: { page: pageNum, size: PAGE_SIZE, statusId: 9 },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const data = res.data.data ?? [];
      // 🔎 콘솔 로그
      logList("예매내역 응답", data);

      setReservationList(data);

      console.log(`[예매내역] set 후 길이: ${data.length}`);
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
          params: { page: pageNum, size: PAGE_SIZE, statusId: 10 }, // 취소 상태 ID
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const serverData = res.data.data ?? [];
      // 🔎 서버 원본 먼저 로그
      logList("취소내역(서버 원본)", serverData);

      // 혹시 서버 필터 미동작 시 클라 필터
      const list = serverData.filter((v) => v.status === "예매 취소");

      // 🔎 최종 사용 리스트 로그
      logList("취소내역(클라 최종)", list);

      setCanceledReservationList(list);
      console.log(`[취소내역] set 후 길이: ${list.length}`);
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

  // 삭제(취소) 액션: DELETE /api/v1/reservation/{reservationId}
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

      // 성공 시 재조회 (페이지 유지)
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

  const onToggleNotify = (id: number) => {
    setNotifyMap((prev) => ({ ...prev, [id]: !prev[id] }));
    // TODO: 서버 반영 API 필요 시 추가
  };

  // 페이지 변경 시마다 조회
  useEffect(() => {
    fetchReservationList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    fetchCanceledReservationList(cancelPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelPage]);

  return (
    <div className="space-y-10">
      {/* 예매내역 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="page-title m-0">예매내역</h2>
          <button
            type="button"
            onClick={() => setShowDebug((v) => !v)}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-neutral-100"
          >
            {showDebug ? "디버그 숨기기" : "디버그 보기"}
          </button>
        </div>

        <div className="rounded-xl border px-4 py-3">
          <div className="grid grid-cols-[1fr_160px_100px_120px_120px] items-center gap-4 text-sm font-medium">
            <div className="text-center sm:text-left">상품명</div>
            <div className="text-center">예매번호</div>
            <div className="text-center">매수</div>
            <div className="text-center">취소버튼</div>
            <div className="text-center">알림허용</div>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="rounded-xl border px-4 py-6 text-center text-sm">
              불러오는 중…
            </div>
          ) : error ? (
            <div className="rounded-xl border px-4 py-6 text-center text-sm text-red-600">
              {error}
            </div>
          ) : reservationList.length === 0 ? (
            <div className="rounded-xl border px-4 py-6 text-center text-sm">
              예매내역이 없습니다.
            </div>
          ) : (
            reservationList.map((r) => (
              <div
                key={r.reservationId}
                className="rounded-xl border px-4 py-3 transition-colors hover:bg-neutral-50"
              >
                <div className="grid grid-cols-[1fr_160px_100px_120px_120px] items-center gap-4">
                  {/* 상품명 */}
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {r.performanceTitle}
                    </div>
                    <div className="truncate text-xs opacity-70">
                      {r.performanceHall}
                    </div>
                    <div className="truncate text-xs opacity-60">
                      {fmtDate(r.performanceDate)}
                    </div>
                  </div>

                  {/* 예매번호 */}
                  <div className="text-center text-sm">
                    {r.reservationNumber}
                  </div>

                  {/* 매수 */}
                  <div className="text-center text-sm">{r.seatCount ?? 1}</div>

                  {/* 취소버튼 */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => onCancel(r.reservationId)}
                      disabled={
                        !r.cancellable || cancelingId === r.reservationId
                      }
                      className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-neutral-100 disabled:opacity-40"
                      title={r.cancellable ? "취소하기" : "취소 불가"}
                    >
                      {cancelingId === r.reservationId ? (
                        <span className="text-xs">취소중…</span>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>

                  {/* 알림허용 */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => onToggleNotify(r.reservationId)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        notifyMap[r.reservationId]
                          ? "bg-neutral-900 text-white"
                          : "hover:bg-neutral-100"
                      }`}
                      title="알림 허용"
                    >
                      <CheckSquare size={16} />
                      <span className="hidden sm:inline">
                        {notifyMap[r.reservationId] ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 예매내역 페이지네이션 */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={page === 0}
            className="rounded-full border px-3 py-1 text-lg transition-colors hover:bg-neutral-100 disabled:opacity-40"
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          <span className="text-sm opacity-70">Page {page + 1}</span>
          <button
            type="button"
            onClick={onNextPage}
            className="rounded-full border px-3 py-1 text-lg transition-colors hover:bg-neutral-100"
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </div>
      </section>

      {/* 취소내역 */}
      <section>
        <h2 className="page-title mb-4">취소내역</h2>

        <div className="rounded-xl border px-4 py-3">
          <div className="grid grid-cols-[84px_1fr_120px_160px_120px] items-center gap-4 text-sm font-medium">
            <div className="text-center">상품명</div>
            <div className="text-center">예매번호</div>
            <div className="text-center">매수</div>
            <div className="text-center">취소날짜</div>
            <div className="text-center">취소상태</div>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {cancelLoading ? (
            <div className="rounded-xl border px-4 py-6 text-center text-sm">
              불러오는 중…
            </div>
          ) : cancelError ? (
            <div className="rounded-xl border px-4 py-6 text-center text-sm text-red-600">
              {cancelError}
            </div>
          ) : canceledReservationList.length === 0 ? (
            <div className="rounded-xl border px-4 py-6 text-center text-sm">
              취소내역이 없습니다.
            </div>
          ) : (
            canceledReservationList.map((r) => (
              <div
                key={`cancel-${r.reservationId}`}
                className="rounded-xl border px-4 py-3 transition-colors hover:bg-neutral-50"
              >
                <div className="grid grid-cols-[84px_1fr_120px_160px_120px] items-center gap-4">
                  <div className="flex justify-center">
                    <img
                      src={"/images/placeholder-poster.png"}
                      alt={r.performanceTitle}
                      className="h-16 w-12 rounded-md object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {r.performanceTitle}
                    </div>
                    <div className="truncate text-sm opacity-70">
                      {r.reservationNumber}
                    </div>
                  </div>
                  <div className="text-center text-sm">{r.seatCount ?? 1}</div>
                  <div className="text-center text-sm">
                    {fmtDate(r.reservedAt)}
                  </div>
                  <div className="text-center text-sm">{r.status}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 취소내역 페이지네이션 */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={onPrevCancelPage}
            disabled={cancelPage === 0}
            className="rounded-full border px-3 py-1 text-lg transition-colors hover:bg-neutral-100 disabled:opacity-40"
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          <span className="text-sm opacity-70">Page {cancelPage + 1}</span>
          <button
            type="button"
            onClick={onNextCancelPage}
            className="rounded-full border px-3 py-1 text-lg transition-colors hover:bg-neutral-100"
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </div>
      </section>

      {/* 개발용 디버그 패널 */}
      {showDebug && (
        <section>
          <div className="rounded-xl border p-4">
            <h3 className="mb-2 font-medium">디버그 패널</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-1 text-sm">
                  예매내역 ({reservationList.length})
                </div>
                <pre className="max-h-80 overflow-auto rounded bg-neutral-50 p-3 text-xs">
                  {JSON.stringify(reservationList, null, 2)}
                </pre>
              </div>
              <div>
                <div className="mb-1 text-sm">
                  취소내역 ({canceledReservationList.length})
                </div>
                <pre className="max-h-80 overflow-auto rounded bg-neutral-50 p-3 text-xs">
                  {JSON.stringify(canceledReservationList, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ReservationsTab;
