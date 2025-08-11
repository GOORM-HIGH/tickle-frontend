// ReservationsTab.tsx
import React from "react";
import { Trash2, CheckSquare } from "lucide-react";

interface Props {
  // 데이터
  reservationList?: ReservationHistoryResponse[];
  canceledReservationList?: ReservationHistoryResponse[];

  // 액션
  onCancel?: (id: number) => void;
  onToggleNotify?: (id: number) => void;

  // 상태
  notifyMap?: Record<number, boolean>;

  // 예매내역 페이지네이션
  page?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;

  // 취소내역 페이지네이션
  cancelPage?: number;
  onPrevCancelPage?: () => void;
  onNextCancelPage?: () => void;
}

// 날짜 포맷 함수
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const ReservationsTab: React.FC<Props> = ({
  // 데이터 기본값
  reservationList = [],
  canceledReservationList = [],

  // 액션
  onCancel,
  onToggleNotify,

  // 상태 기본값
  notifyMap = {},

  // 예매내역 페이지네이션
  page = 0,
  onPrevPage,
  onNextPage,

  // 취소내역 페이지네이션
  cancelPage = 0,
  onPrevCancelPage,
  onNextCancelPage,
}) => {
  return (
    <div className="space-y-10">
      {/* 예매내역 */}
      <section>
        <h2 className="page-title mb-4">예매내역</h2>

        {/* 헤더: [상품명 | 예매번호 | 매수 | 취소버튼 | 알림허용] */}
        <div className="rounded-xl border px-4 py-3">
          <div className="grid grid-cols-[1fr_160px_100px_120px_120px] items-center gap-4 text-sm font-medium">
            <div className="text-center sm:text-left">상품명</div>
            <div className="text-center">예매번호</div>
            <div className="text-center">매수</div>
            <div className="text-center">취소버튼</div>
            <div className="text-center">알림허용</div>
          </div>
        </div>

        {/* 리스트 */}
        <div className="mt-3 space-y-3">
          {reservationList.length === 0 ? (
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
                  {/* 상품명(제목/공연장/공연일) */}
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
                      onClick={() => onCancel?.(r.reservationId)}
                      disabled={!r.cancellable}
                      className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-neutral-100 disabled:opacity-40"
                      title={r.cancellable ? "취소하기" : "취소 불가"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* 알림허용 */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => onToggleNotify?.(r.reservationId)}
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

        {/* 헤더: [상품명 | 예매번호 | 매수 | 취소날짜 | 취소상태] */}
        <div className="rounded-xl border px-4 py-3">
          <div className="grid grid-cols-[84px_1fr_120px_160px_120px] items-center gap-4 text-sm font-medium">
            <div className="text-center">상품명</div>
            <div className="text-center">예매번호</div>
            <div className="text-center">매수</div>
            <div className="text-center">취소날짜</div>
            <div className="text-center">취소상태</div>
          </div>
        </div>

        {/* 리스트 */}
        <div className="mt-3 space-y-3">
          {canceledReservationList.length === 0 ? (
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
                  {/* 썸네일(필요 없으면 제거 가능) */}
                  <div className="flex justify-center">
                    <img
                      src={"/images/placeholder-poster.png"}
                      alt={r.performanceTitle}
                      className="h-16 w-12 rounded-md object-cover"
                    />
                  </div>

                  {/* 상품/예매번호 */}
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {r.performanceTitle}
                    </div>
                    <div className="truncate text-sm opacity-70">
                      {r.reservationNumber}
                    </div>
                  </div>

                  {/* 매수 / 취소날짜 / 상태 */}
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
    </div>
  );
};

export default ReservationsTab;
