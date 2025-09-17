import React, { useCallback } from "react";

import { useMyPageAuth } from "../../../hooks/mypage/useAuth.ts";
import { usePoints } from "../../../hooks/mypage/usePoints.ts";
import { useUI } from "../../../hooks/mypage/useUI.ts";
import { usePopups } from "../../../hooks/mypage/usePopups.ts";
import MyPageLayout from "../../../components/member/mypage/MyPageLayout";
import LoadingState from "../../../components/member/mypage/LoadingState.tsx";
import MyPagePopups from "../../../components/member/mypage/MyPagePopups.tsx";


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
