import React from 'react';
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
  onCharge: (amount: number) => Promise<ChargeResult>;
  onReceipt: (data: PointResponse) => void;
  onCloseReceipt: () => void;
}

export const MyPagePopups: React.FC<MyPagePopupsProps> = ({
  showChargePopup,
  showReceiptPopup,
  currentBalance,
  receiptData,
  onCloseChargePopup,
  onCharge,
  onReceipt,
  onCloseReceipt,
}) => {
  console.log('MyPagePopups 렌더링:', { showReceiptPopup, receiptData });
  
  return (
    <>
      {/* 포인트 충전 팝업 */}
      {showChargePopup && (
        <ChargePopup
          currentBalance={currentBalance}
          onClose={onCloseChargePopup}
          onCharge={onCharge}
          onReceipt={onReceipt}
        />
      )}

      {/* 영수증 팝업 */}
      {showReceiptPopup && receiptData && (
        <ReceiptPopup
          receiptData={receiptData}
          onClose={onCloseReceipt}
        />
      )}
    </>
  );
};
