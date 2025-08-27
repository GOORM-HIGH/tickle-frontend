import React, { useCallback } from "react";
import { MyPagePopups, LoadingState } from "../components";
import { useMyPageAuth } from "../hooks/useAuth";
import { usePoints } from "../hooks/usePoints";
import { useUI } from "../hooks/useUI";
import { usePopups } from "../hooks/usePopups";
import "../styles/MyPage.css";
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
