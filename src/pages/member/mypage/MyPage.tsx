import React, { useCallback } from "react";
import { MyPagePopups, LoadingState } from "../../../feat-mypage/components";
import { useMyPageAuth } from "../../../feat-mypage/hooks/useAuth";
import { usePoints } from "../../../feat-mypage/hooks/usePoints";
import { useUI } from "../../../feat-mypage/hooks/useUI";
import { usePopups } from "../../../feat-mypage/hooks/usePopups";
import MyPageLayout from "../../../components/member/mypage/MyPageLayout";


const MyPage: React.FC = () => {
  const { isLoggedIn } = useMyPageAuth();

  const { currentBalance } = usePoints();
  const { showChargePopup, handleChargeClick, handleCloseChargePopup } =
    useUI();
  const { receiptData, showReceiptPopup, handleReceipt, closeAndClearReceipt } =
    usePopups();

  const handleCloseReceipt = useCallback(() => {
    closeAndClearReceipt();
  }, [closeAndClearReceipt]);

  if (!isLoggedIn) return <LoadingState />;

  return (
    <>
      <MyPageLayout
        currentBalance={currentBalance}
        onChargeClick={handleChargeClick}
      />
      <MyPagePopups
        showChargePopup={showChargePopup}
        showReceiptPopup={showReceiptPopup}
        currentBalance={currentBalance}
        receiptData={receiptData}
        onCloseChargePopup={handleCloseChargePopup}
        onReceipt={handleReceipt}
        onCloseReceipt={handleCloseReceipt}
      />
    </>
  );
};

export default MyPage;
