import { useState, useCallback } from 'react';
import { MyPageTabs } from "../../pages/member/mypage/constants/tabs";

export const useUI = () => {
  const [activeTab, setActiveTab] = useState<MyPageTabs>(MyPageTabs.INFO);
  const [showChargePopup, setShowChargePopup] = useState(false);

  const handleTabChange = useCallback((tab: MyPageTabs) => {
    setActiveTab(tab);
  }, []);

  const handleChargeClick = useCallback(() => {
    setShowChargePopup(true);
  }, []);

  const handleCloseChargePopup = useCallback(() => {
    setShowChargePopup(false);
  }, []);

  return {
    // 상태
    activeTab,
    showChargePopup,

    // 액션
    setActiveTab: handleTabChange,
    setShowChargePopup,
    handleChargeClick,
    handleCloseChargePopup,
  };
};
