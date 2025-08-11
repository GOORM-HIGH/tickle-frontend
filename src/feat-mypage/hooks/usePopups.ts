import { useState, useCallback } from 'react';
import { PointResponse } from '../../services/pointService';

export const usePopups = () => {
  const [receiptData, setReceiptData] = useState<PointResponse | null>(null);

  const handleReceipt = useCallback((receiptData: PointResponse) => {
    setReceiptData(receiptData);
  }, []);

  const clearReceiptData = useCallback(() => {
    setReceiptData(null);
  }, []);

  return {
    // 상태
    receiptData,
    
    // 액션
    setReceiptData,
    handleReceipt,
    clearReceiptData
  };
};
