import { useState, useCallback } from 'react';
import { MyPageTab } from '../constants/tabs';

export const useUI = () => {
  const [activeTab, setActiveTab] = useState<MyPageTab>('info');
  const [showChargePopup, setShowChargePopup] = useState(false);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);

  const handleTabChange = useCallback((tab: MyPageTab) => {
    setActiveTab(tab);
  }, []);

  const handleChargeClick = useCallback(() => {
    setShowChargePopup(true);
  }, []);

  const handleCloseChargePopup = useCallback(() => {
    setShowChargePopup(false);
  }, []);

  const handleCloseReceiptPopup = useCallback(() => {
    setShowReceiptPopup(false);
  }, []);

  return {
    // 상태
    activeTab,
    showChargePopup,
    showReceiptPopup,
    
    // 액션
    setActiveTab: handleTabChange,
    setShowChargePopup,
    setShowReceiptPopup,
    handleChargeClick,
    handleCloseChargePopup,
    handleCloseReceiptPopup
  };
};
