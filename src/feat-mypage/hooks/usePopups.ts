import { useState, useCallback } from 'react';
import { PointResponse } from '../../services/pointService';

export const usePopups = () => {
  const [receiptData, setReceiptData] = useState<PointResponse | null>(null);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);

  const handleReceipt = useCallback((receiptData: PointResponse) => {
    console.log('usePopups - handleReceipt 호출됨:', receiptData);
    setReceiptData(receiptData);
    setShowReceiptPopup(true); // 영수증 팝업 표시
    console.log('usePopups - showReceiptPopup을 true로 설정');
  }, []);

  const clearReceiptData = useCallback(() => {
    console.log('usePopups - clearReceiptData 호출됨');
    setReceiptData(null);
    setShowReceiptPopup(false); // 영수증 팝업 숨김
  }, []);

  const closeReceiptPopup = useCallback(() => {
    console.log('usePopups - closeReceiptPopup 호출됨');
    setShowReceiptPopup(false);
  }, []);

  return {
    // 상태
    receiptData,
    showReceiptPopup,
    
    // 액션
    setReceiptData,
    setShowReceiptPopup,
    handleReceipt,
    clearReceiptData,
    closeReceiptPopup
  };
};
