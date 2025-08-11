import React, { useMemo, useCallback } from 'react';
import { ChargePopup, ReceiptPopup } from './index';
import { PointResponse } from '../../services/pointService';

interface ChargeResult {
  success: boolean;
  data?: PointResponse;
  error?: string;
}

interface MyPagePopupsProps {
  showChargePopup: boolean;
  showReceiptPopup: boolean;
  currentBalance: number;
  receiptData: PointResponse | null;
  onCloseChargePopup: () => void;
  onReceipt: (data: PointResponse) => void;
  onCloseReceipt: () => void;
}

const MyPagePopupsComponent: React.FC<MyPagePopupsProps> = ({
  showChargePopup,
  showReceiptPopup,
  currentBalance,
  receiptData,
  onCloseChargePopup,
  onReceipt,
  onCloseReceipt,
}) => {
  // 렌더링 로그를 useMemo로 최적화하여 실제 변경이 있을 때만 출력
  const renderLog = useMemo(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] MyPagePopups 렌더링:`, { 
      showChargePopup, 
      showReceiptPopup, 
      receiptData: receiptData ? '있음' : '없음',
      currentBalance 
    });
    return null;
  }, [showChargePopup, showReceiptPopup, receiptData, currentBalance]);

  // 팝업 표시 여부를 useMemo로 최적화
  const shouldShowChargePopup = useMemo(() => showChargePopup, [showChargePopup]);
  const shouldShowReceiptPopup = useMemo(() => showReceiptPopup && receiptData, [showReceiptPopup, receiptData]);

  // 이벤트 핸들러를 useCallback으로 최적화
  const handleCloseChargePopup = useCallback(() => {
    console.log('MyPagePopups - handleCloseChargePopup 호출됨');
    onCloseChargePopup();
  }, [onCloseChargePopup]);

  const handleReceipt = useCallback((data: PointResponse) => {
    console.log('MyPagePopups - handleReceipt 호출됨:', data);
    onReceipt(data);
  }, [onReceipt]);

  const handleCloseReceipt = useCallback(() => {
    console.log('MyPagePopups - handleCloseReceipt 호출됨');
    onCloseReceipt();
  }, [onCloseReceipt]);
  
  return (
    <>
      {renderLog}
      
      {/* 포인트 충전 팝업 */}
      {shouldShowChargePopup && (
        <ChargePopup
          currentBalance={currentBalance}
          onClose={handleCloseChargePopup}
          onReceipt={handleReceipt}
        />
      )}

      {/* 영수증 팝업 */}
      {shouldShowReceiptPopup && (
        <ReceiptPopup
          receiptData={receiptData!}
          onClose={handleCloseReceipt}
        />
      )}
    </>
  );
};

// React.memo로 감싸서 props가 변경되지 않으면 리렌더링 방지
// 비교 함수를 추가하여 더 정확한 비교 수행
export const MyPagePopups = React.memo(MyPagePopupsComponent, (prevProps, nextProps) => {
  const propsChanged = 
    prevProps.showChargePopup !== nextProps.showChargePopup ||
    prevProps.showReceiptPopup !== nextProps.showReceiptPopup ||
    prevProps.currentBalance !== nextProps.currentBalance ||
    prevProps.receiptData !== nextProps.receiptData ||
    prevProps.onCloseChargePopup !== nextProps.onCloseChargePopup ||
    prevProps.onReceipt !== nextProps.onReceipt ||
    prevProps.onCloseReceipt !== nextProps.onCloseReceipt;
  
  if (propsChanged) {
    console.log('MyPagePopups props 변경됨:', {
      prev: {
        showChargePopup: prevProps.showChargePopup,
        showReceiptPopup: prevProps.showReceiptPopup,
        receiptData: prevProps.receiptData ? '있음' : '없음'
      },
      next: {
        showChargePopup: nextProps.showChargePopup,
        showReceiptPopup: nextProps.showReceiptPopup,
        receiptData: nextProps.receiptData ? '있음' : '없음'
      }
    });
  }
  
  return !propsChanged; // props가 변경되지 않았으면 true 반환 (리렌더링 방지)
});
