import { useState, useCallback } from 'react';
import { PointResponse } from '../../services/pointService';

interface ChargeResult {
  success: boolean;
  data?: PointResponse;
  error?: string;
}

export const usePoints = () => {
  const [currentBalance, setCurrentBalance] = useState(125000);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [pointHistoryLoading, setPointHistoryLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const handleCharge = useCallback(async (amount: number): Promise<ChargeResult> => {
    try {
      setCurrentBalance(prev => prev + amount);
      // TODO: API 연동 시 실제 API 호출
      // const result = await pointService.chargePoints(amount);
      
      return {
        success: true,
        data: {
          orderId: `order_${Date.now()}`,
          orderName: '포인트 충전',
          receiptId: `receipt_${Date.now()}`,
          amount,
          totalBalance: currentBalance + amount,
          username: '사용자',
          purchasedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('포인트 충전 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '포인트 충전에 실패했습니다.'
      };
    }
  }, [currentBalance]);

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
