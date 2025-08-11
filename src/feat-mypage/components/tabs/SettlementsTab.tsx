import React, { useState, useEffect } from 'react';
import { settlementService } from '../../../services/settlementService';
import {
  SettlementResponseDto,
  PagingResponse,
  PeriodType,
  ViewType,
  SettlementStatus
} from '../../../types/settlement';
import api from '../../../services/api';

// 기존 타입을 새로운 타입으로 교체
type SettlementData = SettlementResponseDto;

interface SettlementSummary {
  totalSalesAmount: number;
  totalRefundAmount: number;
  totalCommission: number;
  totalNetAmount: number;
  commissionRate: number;
}

// 회원 정보 타입
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

// 기존 enum들은 제거하고 새로운 타입 사용

const SettlementsTab: React.FC = () => {
  // 상태 관리
  const [currentStatus, setCurrentStatus] = useState<SettlementStatus>(SettlementStatus.COMPLETED);
  const [periodType, setPeriodType] = useState<PeriodType>(PeriodType.DETAIL);
  const [viewType, setViewType] = useState<ViewType>(ViewType.PERFORMANCE);


  // 날짜 관련 상태
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 검색 관련 상태
  const [performanceTitle, setPerformanceTitle] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // settlementCycle 초기값 설정
  const [settlementCycle, setSettlementCycle] = useState<string>(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    return `${currentYear}-${currentMonth}`;
  });

  // 데이터 관련 상태
  const [settlementData, setSettlementData] = useState<SettlementData[]>([]);
  const [summary, setSummary] = useState<SettlementSummary>({
    totalSalesAmount: 0,
    totalRefundAmount: 0,
    totalCommission: 0,
    totalNetAmount: 0,
    commissionRate: 0
  });
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 회원 정보 상태
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

  // 페이지 진입 시간 (새로고침 시마다 업데이트)
  const [pageEnterTime, setPageEnterTime] = useState<string>('');

  // 미정산 금액 (백엔드 API로 조회)
  const [unsettledAmount, setUnsettledAmount] = useState<number>(3200000);

  // 엑셀 다운로드 로딩 상태
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // 회원 정보 조회 (임시 비활성화 - 백엔드 API 문제)
  const fetchMemberInfo = async () => {
    try {
      // TODO: 백엔드 /api/v1/mypage API 구현 후 주석 해제
      // const response = await api.get<{ data: MemberInfo }>('/api/v1/mypage');
      // setMemberInfo(response.data.data);

      // 임시로 기본 회사명 설정
      setMemberInfo({
        email: '',
        nickname: '',
        pointBalance: 0,
        img: '',
        hostBizName: '구름엔터테인먼트', // 기본값
        hostBizBank: '',
        hostBizDepositor: '',
        hostBizBankNumber: '',
        contractCharge: 0,
        memberRole: 'HOST'
      });
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
    }
  };

  // 미정산 금액 조회
  const fetchUnsettledAmount = async () => {
    try {
      const amount = await settlementService.getUnsettledAmount();
      setUnsettledAmount(amount);
    } catch (error) {
      console.error('미정산 금액 조회 실패:', error);
      // 에러 발생 시 기본값 설정
      setUnsettledAmount(0);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    initializeDefaultValues();
    fetchMemberInfo();
    fetchUnsettledAmount();
  }, []);

  // 필터 조건이나 페이지 변경 시 데이터 로딩
  useEffect(() => {
    console.log('🔄 useEffect 실행:', { periodType, viewType, settlementCycle, startDate, endDate, searchKeyword, currentStatus, currentPage });
    fetchSettlementData();
  }, [periodType, viewType, settlementCycle, startDate, endDate, searchKeyword, currentStatus, currentPage]);

  // 정산 타입 변경 시 초기화
  useEffect(() => {
    if (periodType === PeriodType.DETAIL) {
      setViewType(ViewType.PERFORMANCE); // 건별은 공연별로 강제
    }

    // 주간/월간 정산일 때 settlementCycle 초기화
    if (periodType === PeriodType.WEEKLY || periodType === PeriodType.MONTHLY) {
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      setSettlementCycle(`${currentYear}-${currentMonth}`);
    }

    // 페이지를 1로 초기화
    setCurrentPage(1);
  }, [periodType, currentStatus]);

  // 초기 기본값 설정
  const initializeDefaultValues = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(formatDateForInput(firstDayOfMonth));
    setEndDate(formatDateForInput(today));

    // 페이지 진입 시간 설정 (현재 시간)
    const now = new Date();
    const formattedTime = formatDateForDisplay(now);
    setPageEnterTime(formattedTime);
  };

  // 날짜를 input용 형식으로 포맷팅
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 정산 데이터 조회
  const fetchSettlementData = async () => {
    console.log('🚀 fetchSettlementData 시작');
    setIsLoading(true);
    try {
      // 주간 정산에서 '전체'를 선택한 경우 settlementCycle 파라미터를 undefined로 설정
      let cycleParam: string | undefined = settlementCycle;
      if (periodType === PeriodType.WEEKLY) {
        const weekPart = settlementCycle.split('-')[2];
        if (!weekPart || weekPart === '') {
          cycleParam = undefined;
        }
      }

      console.log('📡 API 호출 파라미터:', {
        periodType,
        viewType,
        settlementCycle: cycleParam,
        startDate,
        endDate,
        performanceTitle: searchKeyword,
        statusId: currentStatus,
        page: currentPage,
        size: 10
      });

      const response = await settlementService.getSettlements({
        periodType,
        viewType,
        settlementCycle: cycleParam,
        startDate,
        endDate,
        performanceTitle: searchKeyword,
        statusId: currentStatus,
        page: currentPage,
        size: 10
      });

      // API 응답 데이터 설정
      setSettlementData(response.content);
      setTotalCount(response.totalElements);

      // 요약 정보 계산
      const summary: SettlementSummary = {
        totalSalesAmount: response.content.reduce((sum: number, item: SettlementData) => sum + item.salesAmount, 0),
        totalRefundAmount: response.content.reduce((sum: number, item: SettlementData) => sum + item.refundAmount, 0),
        totalCommission: response.content.reduce((sum: number, item: SettlementData) => sum + item.commission, 0),
        totalNetAmount: response.content.reduce((sum: number, item: SettlementData) => sum + item.netAmount, 0),
        commissionRate: response.content.length > 0 ? response.content[0].contractCharge : 0
      };

      setSummary(summary);

    } catch (error: any) {
      console.error('정산 데이터 조회 실패:', error);

      // 백엔드 서버 에러인 경우 사용자에게 알림
      if (error.response?.status === 500) {
        console.log('백엔드 서버 내부 오류가 발생했습니다. 서버 로그를 확인해주세요.');
      }

      // 에러 발생 시 빈 데이터로 설정
      setSettlementData([]);
      setSummary({
        totalSalesAmount: 0,
        totalRefundAmount: 0,
        totalCommission: 0,
        totalNetAmount: 0,
        commissionRate: 0
      });
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 상태명 반환
  const getStatusName = (status: SettlementStatus): string => {
    switch (status) {
      case SettlementStatus.COMPLETED: return '정산완료';
      case SettlementStatus.PENDING: return '정산예정';
      case SettlementStatus.REFUND_REQUEST: return '환불청구';
      default: return '';
    }
  };

  // 검색 실행
  const handleSearch = () => {
    console.log('🔍 검색 실행:', { searchKeyword, periodType, viewType, settlementCycle, startDate, endDate, currentStatus });
    setCurrentPage(1);
    // 강제로 useEffect를 트리거하기 위해 searchKeyword를 업데이트
    setSearchKeyword(searchKeyword + '');

    // useEffect가 실행되지 않는 경우를 대비해 직접 API 호출
    setTimeout(() => {
      console.log('⏰ setTimeout으로 직접 API 호출');
      fetchSettlementData();
    }, 100);
  };

  // 초기화
  const handleReset = () => {
    setSearchKeyword('');
    setPerformanceTitle('');
    initializeDefaultValues();
    setCurrentPage(1);
    // 초기화 시 searchKeyword가 변경되어 useEffect가 자동으로 실행됨
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 currentPage가 변경되어 useEffect가 자동으로 실행됨
  };

  // 엑셀 다운로드
  const handleExcelDownload = async () => {
    try {
      // 로딩 상태 표시
      setIsDownloading(true);

      console.log('📊 엑셀 다운로드 시작:', {
        periodType,
        viewType,
        settlementCycle,
        startDate,
        endDate,
        searchKeyword,
        currentStatus
      });

      // 엑셀 다운로드 API 호출
      await settlementService.downloadExcel({
        periodType,
        viewType,
        settlementCycle,
        startDate,
        endDate,
        performanceTitle: searchKeyword,
        statusId: currentStatus
      });

      console.log('✅ 엑셀 다운로드 완료!');

      // 성공 메시지 표시 (선택사항)
      alert('엑셀 다운로드가 완료되었습니다.');

    } catch (error) {
      console.error('❌ 엑셀 다운로드 실패:', error);

      // 에러 메시지 개선
      let errorMessage = '엑셀 다운로드에 실패했습니다.';

      if (error instanceof Error) {
        if (error.message.includes('다운로드할 정산 내역이 없습니다')) {
          errorMessage = '다운로드할 정산 내역이 없습니다.';
        } else if (error.message.includes('엑셀 다운로드에 실패했습니다')) {
          errorMessage = '엑셀 다운로드에 실패했습니다. 다시 시도해주세요.';
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅 (표시용)
  const formatDateForDisplay = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 날짜 포맷팅 (테이블 표시용)
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateString;
    }
  };

  // 주간 정산 주차 포맷팅 (예: '2025-08-02' → '2025-08 2주차')
  const formatWeeklyCycle = (cycleString: string): string => {
    try {
      const parts = cycleString.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const week = parts[2];
        return `${year}-${month} ${week}주차`;
      }
      return cycleString;
    } catch {
      return cycleString;
    }
  };

  // 주차 계산 (주간 정산용)
  const getWeekOptions = (year: string, month: string) => {
    const weeks = [];
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const firstDay = date.getDay();
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    let weekCount = 1;
    let currentDay = 1;

    while (currentDay <= daysInMonth) {
      weeks.push(`${weekCount}회차`);
      weekCount++;
      currentDay += 7;
    }

    return weeks;
  };

  // 월 옵션 생성 (주간/월간 정산용)
  const getMonthOptions = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // 임시로 2024년 1월부터 현재까지
    for (let year = 2024; year <= currentYear; year++) {
      const startMonth = year === 2024 ? 1 : 1;
      const endMonth = year === currentYear ? currentMonth : 12;

      for (let month = startMonth; month <= endMonth; month++) {
        months.push({
          year: year.toString(),
          month: month.toString().padStart(2, '0'),
          label: `${year}-${month.toString().padStart(2, '0')}`
        });
      }
    }

    return months;
  };

  return (
    <div className="tab-content p-6">
      {/* 페이지 제목 및 회사 정보 */}
      <div className="mb-6">
        <p className="text-gray-600">
          {memberInfo?.hostBizName ? `(주)${memberInfo.hostBizName}` : '(주)구름엔터테인먼트'}
        </p>
      </div>

      {/* 미정산 금액 및 기준 시간 */}
      <div className="mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">미정산금액</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(unsettledAmount)}</p>
            </div>
            <div className="text-sm text-gray-500">
              {pageEnterTime} 기준
            </div>
          </div>
        </div>
      </div>

      {/* 정산 상태 탭 */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { status: SettlementStatus.COMPLETED, label: '정산완료' },
          { status: SettlementStatus.PENDING, label: '정산예정' },
          { status: SettlementStatus.REFUND_REQUEST, label: '환불청구' }
        ].map(({ status, label }) => (
          <button
            key={status}
            onClick={() => setCurrentStatus(status)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${currentStatus === status
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 검색 및 필터 영역 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        {/* 정산 타입 선택 및 공연별 내역 보기 체크박스 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {[
              { type: PeriodType.DETAIL, label: '건별' },
              { type: PeriodType.DAILY, label: '일간' },
              { type: PeriodType.WEEKLY, label: '주간' },
              { type: PeriodType.MONTHLY, label: '월간' }
            ].map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setPeriodType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${periodType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 공연별 내역 보기 체크박스 (일별, 주간, 월간에서만) */}
          {periodType !== PeriodType.DETAIL && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={viewType === ViewType.PERFORMANCE}
                  onChange={(e) => setViewType(e.target.checked ? ViewType.PERFORMANCE : ViewType.HOST)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">공연별 내역 보기</span>
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 조회 기간 (건별, 일별에서만 표시) */}
          {periodType !== PeriodType.WEEKLY && periodType !== PeriodType.MONTHLY && (
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">조회기간</label>
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

          {/* 연월 선택 (주간, 월간에서만 표시) */}
          {(periodType === PeriodType.WEEKLY || periodType === PeriodType.MONTHLY) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {periodType === PeriodType.WEEKLY ? '연월' : '연월'}
              </label>
              <select
                value={`${startDate.split('-')[0]}-${startDate.split('-')[1]}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setStartDate(`${year}-${month}-01`);
                  setSettlementCycle(e.target.value);
                }}
                className="w-full h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                {getMonthOptions().map(({ year, month, label }) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 회차 선택 (주간에서만 표시) */}
          {periodType === PeriodType.WEEKLY && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">회차</label>
              <select
                value={settlementCycle.split('-')[2] || ''}
                onChange={(e) => setSettlementCycle(`${settlementCycle.split('-')[0]}-${settlementCycle.split('-')[1]}-${e.target.value}`)}
                className="w-full h-[42px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                <option value="">전체</option>
                {getWeekOptions(startDate.split('-')[0], startDate.split('-')[1]).map((week, index) => (
                  <option key={index} value={String(index + 1).padStart(2, '0')}>
                    {week}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 공연 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">공연검색</label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="공연명을 검색하세요."
              disabled={viewType === ViewType.HOST}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewType === ViewType.HOST
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                : 'border-gray-300'
                }`}
            />
          </div>
        </div>



        {/* 액션 버튼 */}
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

      {/* 정산 요약 정보 */}
      <div className="flex justify-between items-start mb-4">
        <div className="grid grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">정산완료 금액</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(summary.totalNetAmount)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">금액 합계</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(summary.totalSalesAmount)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">수수료 합계</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(summary.totalCommission)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">수수료율</p>
            <p className="text-sm font-bold text-gray-900">{summary.commissionRate}%</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">총 {totalCount}건</span>
          <button
            onClick={handleExcelDownload}
            disabled={isDownloading}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${isDownloading
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
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
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* 정산 내역 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '120px' }}>
                  정산일시
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '150px' }}>
                  공연명
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '90px' }}>
                  판매금액
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '90px' }}>
                  환불금액
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '100px' }}>
                  정산대상금액
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '80px' }}>
                  수수료
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '90px' }}>
                  대납금액
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '100px' }}>
                  정산상태
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap" style={{ minWidth: '90px' }}>
                  {periodType === PeriodType.WEEKLY || periodType === PeriodType.MONTHLY ? (
                    <div>
                      <div>평균</div>
                      <div>수수료율</div>
                    </div>
                  ) : (
                    <div>
                      <div>적용</div>
                      <div>수수료율</div>
                    </div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                    데이터를 불러오는 중...
                  </td>
                </tr>
              ) : settlementData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                    조회된 정산 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                settlementData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-center text-xs text-gray-900">
                      {viewType === ViewType.PERFORMANCE
                        ? formatDate(item.settlementDate)
                        : periodType === PeriodType.WEEKLY
                          ? formatWeeklyCycle(item.settlementCycle || '')
                          : item.settlementCycle || item.settlementDate
                      }
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
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${item.statusName === '정산완료' ? 'bg-green-100 text-green-800' :
                        item.statusName === '정산예정' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
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

            {Array.from({ length: Math.min(10, Math.ceil(totalCount / 10)) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium border ${currentPage === pageNum
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

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
  );
};

export default SettlementsTab;
