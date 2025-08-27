// feat-mypage/pages/MyPage.tsx (컨테이너로 전환)
import React, { useCallback, useMemo } from "react";
import { MyPagePopups, LoadingState } from "../components";

import { useMyPageAuth } from "../hooks/useAuth";
import { usePoints } from "../hooks/usePoints";
import { useUI } from "../hooks/useUI";
import { usePopups } from "../hooks/usePopups";
import "../styles/MyPage.css";
import MyPageLayout from "../../components/member/mypage/MyPageLayout";

const MyPage: React.FC = () => {
  const { isLoggedIn } = useMyPageAuth();
  const { currentBalance, handleCharge } = usePoints();
  const { showChargePopup, handleChargeClick, handleCloseChargePopup } =
    useUI();
  const { receiptData, showReceiptPopup, handleReceipt, closeAndClearReceipt } =
    usePopups();

  const handleChargeComplete = useCallback(
    async (amount: number) => {
      const result = await handleCharge(amount);
      if (result.success) {
        handleCloseChargePopup();
      }
      return result;
    },
    [handleCharge, handleCloseChargePopup]
  );

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
        // 필요시 onChargeComplete도 내려주세요 (ChargePopup 구현에 따라)
        // onChargeComplete={handleChargeComplete}
      />
    </>
  );
};

export default MyPage;
