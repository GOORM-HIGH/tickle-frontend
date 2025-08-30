// pages/member/mypage/MySettlementDashboardPage.tsx
import React, { useEffect, useState } from "react";
import { settlementService } from "./../../../services/settlementService.ts";
import {
    SettlementResponseDto,
    PeriodType,
    ViewType,
    SettlementStatus,
} from "./../../../types/settlement.ts";
import MyPageCard from "../../../components/member/mypage/MyPageCard";

// 기존 SettlementsTab 에서 사용하던 데이터 타입을 동일하게 사용
type SettlementData = SettlementResponseDto;

interface SettlementSummary {
    totalSalesAmount: number;
    totalRefundAmount: number;
    totalCommission: number;
    totalNetAmount: number;
    commissionRate: number;
}

interface MemberInfo {
    email: string;
    nickname: string;
    pointBalance: number;
    img: string;
    hostBizName?: string;
    hostBizBank?: string;
    hostBizDepositor?: string;
    hostBizBankNumber?: string;
    contractCharge?: number;
    memberRole?: string;
}

export default function MySettlementDashboardPage() {
    // 상태 관리
    const [currentStatus, setCurrentStatus] = useState<SettlementStatus>(
        SettlementStatus.COMPLETED
    );
    const [periodType, setPeriodType] = useState<PeriodType>(PeriodType.DETAIL);
    const [viewType, setViewType] = useState<ViewType>(ViewType.PERFORMANCE);

    // 날짜 관련 상태
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // 검색 키워드
    const [searchKeyword, setSearchKeyword] = useState<string>("");

    // settlementCycle (주간/월간)
    const [settlementCycle, setSettlementCycle] = useState<string>(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
        return `${currentYear}-${currentMonth}`;
    });

    // 데이터 관련 상태
    const [settlementData, setSettlementData] = useState<SettlementData[]>([]);
    const [summary, setSummary] = useState<SettlementSummary>({
        totalSalesAmount: 0,
        totalRefundAmount: 0,
        totalCommission: 0,
        totalNetAmount: 0,
        commissionRate: 0,
    });
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 회원 정보
    const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

    // 페이지 진입 시간
    const [pageEnterTime, setPageEnterTime] = useState<string>("");

    // 미정산 금액
    const [unsettledAmount, setUnsettledAmount] = useState<number>(3200000);

    // 엑셀 다운로드 로딩
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    // 초기 값 세팅
    useEffect(() => {
        initializeDefaultValues();
        fetchMemberInfo();
        fetchUnsettledAmount();
    }, []);

    // 필터/페이지 변경 시 조회
    useEffect(() => {
        fetchSettlementData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        periodType,
        viewType,
        settlementCycle,
        startDate,
        endDate,
        searchKeyword,
        currentStatus,
        currentPage,
    ]);

    // periodType 변경 시 초기화
    useEffect(() => {
        if (periodType === PeriodType.DETAIL) {
            setViewType(ViewType.PERFORMANCE);
        }
        if (periodType === PeriodType.WEEKLY || periodType === PeriodType.MONTHLY) {
            const currentYear = new Date().getFullYear();
            const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
            setSettlementCycle(`${currentYear}-${currentMonth}`);
        }
        setCurrentPage(1);
    }, [periodType, currentStatus]);

    // 회원 정보 조회(임시 기본값)
    const fetchMemberInfo = async () => {
        try {
            setMemberInfo({
                email: "",
                nickname: "",
                pointBalance: 0,
                img: "",
                hostBizName: "구름엔터테인먼트",
                hostBizBank: "",
                hostBizDepositor: "",
                hostBizBankNumber: "",
                contractCharge: 0,
                memberRole: "HOST",
            });
        } catch (e) {
            console.error("회원 정보 조회 실패:", e);
        }
    };

    // 미정산 금액 조회
    const fetchUnsettledAmount = async () => {
        try {
            const amount = await settlementService.getUnsettledAmount();
            setUnsettledAmount(amount);
        } catch (e) {
            console.error("미정산 금액 조회 실패:", e);
            setUnsettledAmount(0);
        }
    };

    // 초기 기본값
    const initializeDefaultValues = () => {
        const today = new Date();
        const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        setStartDate(formatDateForInput(firstDayOfMonth));
        setEndDate(formatDateForInput(today));

        const now = new Date();
        setPageEnterTime(formatDateForDisplay(now));
    };

    // input용 포맷
    const formatDateForInput = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    // 표시용 포맷
    const formatDateForDisplay = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");
        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
    };

    // 주차 표시
    const formatWeeklyCycle = (cycle: string): string => {
        try {
            const [y, m, w] = cycle.split("-");
            if (y && m && w) return `${y}-${m} ${w}주차`;
            return cycle;
        } catch {
            return cycle;
        }
    };

    // 월 옵션(라벨만 사용)
    const getMonthOptions = () => {
        const labels: string[] = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        for (let year = 2024; year <= currentYear; year++) {
            const endMonth = year === currentYear ? currentMonth : 12;
            for (let m = 1; m <= endMonth; m++) {
                const mm = String(m).padStart(2, "0");
                labels.push(`${year}-${mm}`);
            }
        }
        return labels;
    };

    // 주간 회차 옵션
    const getWeekOptions = (year: string, month: string) => {
        const weeks: string[] = [];
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
        let current = 1;
        let week = 1;
        while (current <= daysInMonth) {
            weeks.push(`${week}회차`);
            week++;
            current += 7;
        }
        return weeks;
    };

    // 금액 포맷
    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("ko-KR").format(n);

    // 정산 데이터 조회
    const fetchSettlementData = async () => {
        setIsLoading(true);
        try {
            // 주간에서 회차 빈값이면 cycleParam 제외
            let cycleParam: string | undefined = settlementCycle;
            if (periodType === PeriodType.WEEKLY) {
                const weekPart = settlementCycle.split("-")[2];
                if (!weekPart) cycleParam = undefined;
            }

            const res = await settlementService.getSettlements({
                periodType,
                viewType,
                settlementCycle: cycleParam,
                startDate,
                endDate,
                performanceTitle: searchKeyword,
                statusId: currentStatus,
                page: currentPage,
                size: 10,
            });

            setSettlementData(res.content);
            setTotalCount(res.totalElements);

            const s: SettlementSummary = {
                totalSalesAmount: res.content.reduce(
                    (sum: number, it: SettlementData) => sum + it.salesAmount,
                    0
                ),
                totalRefundAmount: res.content.reduce(
                    (sum: number, it: SettlementData) => sum + it.refundAmount,
                    0
                ),
                totalCommission: res.content.reduce(
                    (sum: number, it: SettlementData) => sum + it.commission,
                    0
                ),
                totalNetAmount: res.content.reduce(
                    (sum: number, it: SettlementData) => sum + it.netAmount,
                    0
                ),
                commissionRate:
                    res.content.length > 0 ? res.content[0].contractCharge : 0,
            };
            setSummary(s);
        } catch (e: unknown) {
            console.error("정산 데이터 조회 실패:", e);
            setSettlementData([]);
            setSummary({
                totalSalesAmount: 0,
                totalRefundAmount: 0,
                totalCommission: 0,
                totalNetAmount: 0,
                commissionRate: 0,
            });
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색
    const handleSearch = () => {
        setCurrentPage(1);
        setSearchKeyword((prev) => prev + ""); // 트리거
        setTimeout(() => fetchSettlementData(), 100); // 안전망
    };

    // 초기화
    const handleReset = () => {
        setSearchKeyword("");
        initializeDefaultValues();
        setCurrentPage(1);
    };

    // 페이지 변경
    const handlePageChange = (p: number) => setCurrentPage(p);

    // 엑셀 다운로드
    const handleExcelDownload = async () => {
        try {
            setIsDownloading(true);
            await settlementService.downloadExcel({
                periodType,
                viewType,
                settlementCycle,
                startDate,
                endDate,
                performanceTitle: searchKeyword,
                statusId: currentStatus,
            });
            alert("엑셀 다운로드가 완료되었습니다.");
        } catch (e: unknown) {
            console.error("엑셀 다운로드 실패:", e);
            let msg = "엑셀 다운로드에 실패했습니다.";
            if (e instanceof Error) {
                msg = e.message.includes("다운로드할 정산 내역이 없습니다")
                    ? "다운로드할 정산 내역이 없습니다."
                    : "엑셀 다운로드에 실패했습니다. 다시 시도해주세요.";
            }
            alert(msg);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <MyPageCard 
            minWidth="1000px" 
            cardClassName="min-h-[calc(100vh-200px)]" 
            visibleFor={["HOST"]}
            fallbackWhenHidden={
              <div className="p-12 text-center">
              <h2 className="text-xl font-semibold">권한이 없습니다</h2>
              <p className="text-gray-500 mt-2">HOST 권한이 필요합니다.</p>
              </div>
            }      
        >
            <div className="tab-content p-2 sm:p-4 md:p-6">
                {/* 회사 정보 */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {memberInfo?.hostBizName
                            ? `(주)${memberInfo.hostBizName}`
                            : "(주)구름엔터테인먼트"}
                    </p>
                </div>

                {/* 미정산 금액 */}
                <div className="mb-6">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">미정산금액</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(unsettledAmount)}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">{pageEnterTime} 기준</div>
                        </div>
                    </div>
                </div>

                {/* 상태 탭 */}
                <div className="flex border-b border-gray-200 mb-6">
                    {[
                        { status: SettlementStatus.COMPLETED, label: "정산완료" },
                        { status: SettlementStatus.PENDING, label: "정산예정" },
                        { status: SettlementStatus.REFUND_REQUEST, label: "환불청구" },
                    ].map(({ status, label }) => (
                        <button
                            key={status}
                            onClick={() => setCurrentStatus(status)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                currentStatus === status
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* 검색/필터 */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            {[
                                { type: PeriodType.DETAIL, label: "건별" },
                                { type: PeriodType.DAILY, label: "일간" },
                                { type: PeriodType.WEEKLY, label: "주간" },
                                { type: PeriodType.MONTHLY, label: "월간" },
                            ].map(({ type, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setPeriodType(type)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        periodType === type
                                            ? "bg-blue-500 text-white"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {periodType !== PeriodType.DETAIL && (
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={viewType === ViewType.PERFORMANCE}
                                    onChange={(e) =>
                                        setViewType(
                                            e.target.checked ? ViewType.PERFORMANCE : ViewType.HOST
                                        )
                                    }
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">공연별 내역 보기</span>
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* 조회기간 (건별/일간) */}
                        {periodType !== PeriodType.WEEKLY &&
                            periodType !== PeriodType.MONTHLY && (
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        조회기간
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="self-center text-gray-500">~</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                        {/* 연월 선택 (주간/월간) */}
                        {(periodType === PeriodType.WEEKLY ||
                            periodType === PeriodType.MONTHLY) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    연월
                                </label>
                                <select
                                    value={`${startDate.split("-")[0]}-${startDate.split("-")[1]}`}
                                    onChange={(e) => {
                                        const [y, m] = e.target.value.split("-");
                                        setStartDate(`${y}-${m}-01`);
                                        setSettlementCycle(e.target.value);
                                    }}
                                    className="w-full h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                >
                                    {getMonthOptions().map((label) => (
                                        <option key={label} value={label}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 회차 선택 (주간) */}
                        {periodType === PeriodType.WEEKLY && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    회차
                                </label>
                                <select
                                    value={settlementCycle.split("-")[2] || ""}
                                    onChange={(e) =>
                                        setSettlementCycle(
                                            `${settlementCycle.split("-")[0]}-${
                                                settlementCycle.split("-")[1]
                                            }-${e.target.value}`
                                        )
                                    }
                                    className="w-full h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                >
                                    <option value="">전체</option>
                                    {getWeekOptions(
                                        startDate.split("-")[0],
                                        startDate.split("-")[1]
                                    ).map((week, idx) => (
                                        <option key={idx} value={String(idx + 1).padStart(2, "0")}>
                                            {week}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 공연 검색 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                공연검색
                            </label>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="공연명을 검색하세요."
                                disabled={viewType === ViewType.HOST}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    viewType === ViewType.HOST
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                        : "border-gray-300"
                                }`}
                            />
                        </div>
                    </div>

                    {/* 액션 */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            초기화
                        </button>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            검색
                        </button>
                    </div>
                </div>

                {/* 요약 */}
                <div className="flex justify-between items-start mb-4">
                    <div className="grid grid-cols-4 gap-8">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">정산완료 금액</p>
                            <p className="text-sm font-bold text-gray-900">
                                {formatCurrency(summary.totalNetAmount)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">금액 합계</p>
                            <p className="text-sm font-bold text-gray-900">
                                {formatCurrency(summary.totalSalesAmount)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">수수료 합계</p>
                            <p className="text-sm font-bold text-gray-900">
                                {formatCurrency(summary.totalCommission)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">수수료율</p>
                            <p className="text-sm font-bold text-gray-900">
                                {summary.commissionRate}%
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">총 {totalCount}건</span>
                        <button
                            onClick={handleExcelDownload}
                            disabled={isDownloading}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                                isDownloading
                                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                    : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                        >
                            {isDownloading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span>다운로드 중...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 20 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <span>엑셀 다운로드</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* 테이블 */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table
                            className="divide-y divide-gray-200"
                            style={{ minWidth: "1000px" }}
                        >
                            <thead className="bg-gray-50">
                            <tr>
                                {[
                                    { label: "정산일시", min: 120 },
                                    { label: "공연명", min: 150 },
                                    { label: "판매금액", min: 90 },
                                    { label: "환불금액", min: 90 },
                                    { label: "정산대상금액", min: 100 },
                                    { label: "수수료", min: 80 },
                                    { label: "대납금액", min: 90 },
                                    { label: "정산상태", min: 100 },
                                    {
                                        label:
                                            periodType === PeriodType.WEEKLY ||
                                            periodType === PeriodType.MONTHLY
                                                ? "평균\n수수료율"
                                                : "적용\n수수료율",
                                        min: 90,
                                    },
                                ].map((th) => (
                                    <th
                                        key={th.label}
                                        className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap"
                                        style={{ minWidth: `${th.min}px` }}
                                    >
                                        {th.label.split("\n").map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-2 text-center text-gray-500"
                                    >
                                        데이터를 불러오는 중...
                                    </td>
                                </tr>
                            ) : settlementData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-2 text-center text-gray-500"
                                    >
                                        조회된 정산 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                settlementData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-center text-xs text-gray-900">
                                            {viewType === ViewType.PERFORMANCE
                                                ? formatDateForDisplay(new Date(item.settlementDate))
                                                : periodType === PeriodType.WEEKLY
                                                    ? formatWeeklyCycle(item.settlementCycle || "")
                                                    : item.settlementCycle || item.settlementDate}
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs text-gray-900">
                                            {item.performanceTitle}
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs text-gray-900">
                                            {formatCurrency(item.salesAmount)}
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs text-gray-900">
                                            {formatCurrency(item.refundAmount)}
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs text-gray-900">
                                            {formatCurrency(item.grossAmount)}
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs text-gray-900">
                                            {formatCurrency(item.commission)}
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs text-gray-900">
                                            {formatCurrency(item.netAmount)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                        <span
                            className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                                item.statusName === "정산완료"
                                    ? "bg-green-100 text-green-800"
                                    : item.statusName === "정산예정"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                            }`}
                        >
                          {item.statusName}
                        </span>
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs text-gray-900">
                                            {item.contractCharge}%
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 페이지네이션 */}
                {totalCount > 0 && (
                    <div className="flex justify-center mt-6">
                        <nav className="flex items-center space-x-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                이전
                            </button>

                            {Array.from(
                                { length: Math.min(10, Math.ceil(totalCount / 10)) },
                                (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm font-medium border ${
                                                currentPage === pageNum
                                                    ? "bg-blue-500 text-white border-blue-500"
                                                    : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                            )}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= Math.ceil(totalCount / 10)}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                다음
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </MyPageCard>
    );
}
