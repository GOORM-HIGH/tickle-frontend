import { useState, useCallback } from 'react';
import { PointResponse, pointService } from '../../services/pointService';
import { useAuth } from '../../hooks/useAuth';

interface ChargeResult {
  success: boolean;
  data?: PointResponse;
  error?: string;
}

export const usePoints = () => {
  const { currentUser } = useAuth();
  const [currentBalance, setCurrentBalance] = useState(125000);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [pointHistoryLoading, setPointHistoryLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

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
  }, [currentUser]);

  const loadPointHistory = useCallback(async () => {
    setPointHistoryLoading(true);
    try {
      // TODO: API 연동 시 실제 API 호출
      // const data = await pointService.getPointHistory();
      // setPointHistory(data);
    } catch (error) {
      console.error('포인트 내역 로드 실패:', error);
    } finally {
      setPointHistoryLoading(false);
    }
  }, []);

  return {
    // 상태
    currentBalance,
    pointHistory,
    pointHistoryLoading,
    filterType,
    
    // 액션
    setCurrentBalance,
    setPointHistory,
    setFilterType,
    handleCharge,
    loadPointHistory
  };
};
