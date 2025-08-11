import { useState, useCallback, useMemo, useRef } from 'react';
import { PointResponse } from '../../services/pointService';

export const usePopups = () => {
  const [receiptData, setReceiptData] = useState<PointResponse | null>(null);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);

  // 함수 참조를 안정화하기 위해 useRef 사용
  const stableFunctions = useRef({
    handleReceipt: (receiptData: PointResponse) => {
      console.log('usePopups - handleReceipt 호출됨:', receiptData);
      setReceiptData(receiptData);
      setShowReceiptPopup(true); // 영수증 팝업 표시
      console.log('usePopups - showReceiptPopup을 true로 설정');
    },
    clearReceiptData: () => {
      console.log('usePopups - clearReceiptData 호출됨');
      setReceiptData(null);
      setShowReceiptPopup(false);
    },
    closeReceiptPopup: () => {
      console.log('usePopups - closeReceiptPopup 호출됨');
      setShowReceiptPopup(false);
    },
    closeAndClearReceipt: () => {
      console.log('usePopups - closeAndClearReceipt 호출됨');
      setShowReceiptPopup(false);
      setReceiptData(null);
    }
  });

  // useCallback으로 함수들을 안정화
  const handleReceipt = useCallback((receiptData: PointResponse) => {
    stableFunctions.current.handleReceipt(receiptData);
  }, []);

  const clearReceiptData = useCallback(() => {
    stableFunctions.current.clearReceiptData();
  }, []);

  const closeReceiptPopup = useCallback(() => {
    stableFunctions.current.closeReceiptPopup();
  }, []);

  const closeAndClearReceipt = useCallback(() => {
    stableFunctions.current.closeAndClearReceipt();
  }, []);

  // 상태 객체를 useMemo로 최적화하여 불필요한 재생성 방지
  const popupState = useMemo(() => ({
    receiptData,
    showReceiptPopup,
  }), [receiptData, showReceiptPopup]);

  // 액션 객체를 useMemo로 최적화
  const popupActions = useMemo(() => ({
    setReceiptData,
    setShowReceiptPopup,
    handleReceipt,
    clearReceiptData,
    closeReceiptPopup,
    closeAndClearReceipt
  }), [handleReceipt, clearReceiptData, closeReceiptPopup, closeAndClearReceipt]);

  return {
    // 상태
    ...popupState,
    
    // 액션
    ...popupActions
  };
};
