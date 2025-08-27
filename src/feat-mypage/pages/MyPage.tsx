import React, { useCallback } from "react";
import { MyPagePopups, LoadingState } from "../components";
import { useMyPageAuth } from "../../hooks/mypage/useAuth.ts";
import { usePoints } from "../../hooks/mypage/usePoints.ts";
import { useUI } from "../../hooks/mypage/useUI.ts";
import { usePopups } from "../../hooks/mypage/usePopups.ts";
import "../../types/styles/mypage/MyPage.css";
import MyPageLayout from "../../components/member/mypage/MyPageLayout";

const MyPage: React.FC = () => {
  const { isLoggedIn } = useMyPageAuth();

  const { currentBalance } = usePoints(); // 잔액은 훅에서
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
