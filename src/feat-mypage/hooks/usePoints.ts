import { useState, useCallback, useEffect, useRef } from 'react';
import { PointResponse, pointService, PointHistoryResponse, PagingResponse } from '../../services/pointService';
import { useAuth } from '../../hooks/useAuth';

interface ChargeResult {
  success: boolean;
  data?: PointResponse;
  error?: string;
}

export const usePoints = () => {
  const { currentUser } = useAuth();
  const [currentBalance, setCurrentBalance] = useState(125000);
  const [pointHistory, setPointHistory] = useState<PointHistoryResponse[]>([]);
  const [pointHistoryLoading, setPointHistoryLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLast, setIsLast] = useState(false);

  // 포인트 내역 로드 중복 방지를 위한 플래그
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // 마지막으로 로드한 페이지 정보를 저장하여 중복 로드 방지
  const [lastLoadedPage, setLastLoadedPage] = useState<{page: number, size: number} | null>(null);

  // 함수 참조를 안정화하기 위해 useRef 사용
  const stableFunctions = useRef({
    loadPointHistory: async (page: number = 0, size: number = 10) => {
      // 이미 로딩 중이면 중복 호출 방지
      if (isLoadingHistory) {
        console.log('포인트 내역 로딩 중 - 중복 호출 방지');
        return;
      }

      // 같은 페이지와 크기로 이미 로드했다면 중복 호출 방지
      if (lastLoadedPage && lastLoadedPage.page === page && lastLoadedPage.size === size) {
        console.log('이미 로드된 페이지 - 중복 호출 방지:', { page, size });
        return;
      }

      setIsLoadingHistory(true);
      setPointHistoryLoading(true);
      
      try {
        const response: PagingResponse<PointHistoryResponse> = await pointService.getMyPointHistory(page, size);
        
        setPointHistory(response.content);
        setCurrentPage(response.page);
        setPageSize(response.size);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
        setIsLast(response.isLast);
        
        // 마지막으로 로드한 페이지 정보 저장
        setLastLoadedPage({ page, size });
        
        console.log('포인트 내역 로드 성공:', response);
      } catch (error: any) {
        console.error('포인트 내역 로드 실패:', error);
        
        // 에러 상태 설정
        setPointHistory([]);
        setTotalElements(0);
        setTotalPages(0);
        
        // 사용자에게 에러 메시지 표시 (추후 토스트나 알림 컴포넌트로 대체 가능)
        if (error.response?.status === 500) {
          console.error('서버 내부 오류 (500): 백엔드 서버에 문제가 있습니다.');
        } else if (error.response?.status === 404) {
          console.error('API 엔드포인트를 찾을 수 없습니다 (404): 경로를 확인해주세요.');
        } else if (error.response?.status === 401) {
          console.error('인증 오류 (401): 로그인이 필요합니다.');
        } else if (error.response?.status === 403) {
          console.error('권한 오류 (403): 접근 권한이 없습니다.');
        } else {
          console.error('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setPointHistoryLoading(false);
        setIsLoadingHistory(false);
      }
    }
  });

  // useCallback으로 함수들을 안정화
  const loadPointHistory = useCallback(async (page: number = 0, size: number = 10) => {
    await stableFunctions.current.loadPointHistory(page, size);
  }, []); // 의존성 배열을 비워서 함수 재생성 방지

  const handleCharge = useCallback(async (amount: number): Promise<ChargeResult> => {
    try {
      // 실제 API 호출을 위한 요청 데이터 생성
      const request = {
        orderId: `order_${Date.now()}`,
        order_name: 'Tickle 포인트 충전',
        receipt_id: `receipt_${Date.now()}`,
        amount,
        username: currentUser?.nickname || '사용자',
        purchasedAt: new Date().toISOString()
      };

      console.log('포인트 충전 API 요청:', request);
      console.log('현재 사용자 정보:', currentUser);
      
      // 실제 API 호출
      const result = await pointService.chargePoint(request);
      console.log('포인트 충전 API 응답:', result);
      
      // 잔액 업데이트
      setCurrentBalance(prev => prev + amount);
      
      // 포인트 내역 새로고침 (lastLoadedPage 초기화하여 강제 새로고침)
      setLastLoadedPage(null);
      stableFunctions.current.loadPointHistory(0, pageSize);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('포인트 충전 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '포인트 충전에 실패했습니다.'
      };
    }
  }, [currentUser, pageSize]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    stableFunctions.current.loadPointHistory(page, pageSize);
  }, [pageSize]);

  // 컴포넌트 마운트 시 포인트 내역 로드 (의존성 배열 수정)
  useEffect(() => {
    // 컴포넌트 마운트 시에만 실행
    const initialLoad = async () => {
      await stableFunctions.current.loadPointHistory(0, pageSize);
    };
    initialLoad();
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  return {
    // 상태
    currentBalance,
    pointHistory,
    pointHistoryLoading,
    filterType,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    isLast,
    
    // 액션
    setCurrentBalance,
    setPointHistory,
    setFilterType,
    handleCharge,
    loadPointHistory,
    handlePageChange
  };
};
