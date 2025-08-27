import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { 
  MyPagePopups, 
  MyPageContent, 
  LoadingState 
} from '../components';
import { useMyPageAuth } from '../hooks/useAuth';
import { usePerformances } from '../hooks/usePerformances';
import { usePoints } from '../hooks/usePoints';
import { useUI } from '../hooks/useUI';
import { usePopups } from '../hooks/usePopups';
import '../styles/MyPage.css';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 도메인별 커스텀 훅 사용
  const { isLoggedIn } = useMyPageAuth();
  const { 
    activeTab, 
    showChargePopup, 
    handleChargeClick, 
    handleCloseChargePopup,
    setActiveTab 
  } = useUI();
  const { 
    currentBalance, 
    pointHistory, 
    pointHistoryLoading, 
    filterType, 
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    isLast,
    handleCharge, 
    setFilterType,
    handlePageChange
  } = usePoints();
  const { 
    performances, 
    loading, 
    handleDeletePerformance, 
    handleEditPerformance 
  } = usePerformances(activeTab, true);
  const { 
    receiptData, 
    showReceiptPopup,
    handleReceipt, 
    closeAndClearReceipt
  } = usePopups();

  // 포인트 충전 완료 후 팝업 닫기를 useCallback으로 최적화
  const handleChargeComplete = useCallback(async (amount: number) => {
    console.log('포인트 충전 시작:', amount);
    const result = await handleCharge(amount);
    console.log('포인트 충전 결과:', result);
    if (result.success) {
      handleCloseChargePopup();
      // onReceipt 호출 제거 - ChargePopup에서 직접 onReceipt를 호출하므로 중복 방지
    }
    return result;
  }, [handleCharge, handleCloseChargePopup]);

  // 영수증 팝업 닫기를 useCallback으로 최적화
  const handleCloseReceipt = useCallback(() => {
    // closeAndClearReceipt를 사용하여 중복 호출 방지
    closeAndClearReceipt();
  }, [closeAndClearReceipt]);

  // MyPageContent props를 useMemo로 최적화
  const myPageContentProps = useMemo(() => ({
    currentBalance,
    activeTab,
    pointHistory,
    pointHistoryLoading,
    filterType,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    isLast,
    performances,
    loading,
    onChargeClick: handleChargeClick,
    onTabChange: setActiveTab,
    onNavigate: navigate,
    onFilterChange: setFilterType,
    onEditPerformance: handleEditPerformance,
    onDeletePerformance: handleDeletePerformance,
    onPageChange: handlePageChange
  }), [
    currentBalance,
    activeTab,
    pointHistory,
    pointHistoryLoading,
    filterType,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    isLast,
    performances,
    loading,
    handleChargeClick,
    setActiveTab,
    navigate,
    setFilterType,
    handleEditPerformance,
    handleDeletePerformance,
    handlePageChange
  ]);

  // MyPagePopups props를 useMemo로 최적화
  const myPagePopupsProps = useMemo(() => ({
    showChargePopup,
    showReceiptPopup,
    currentBalance,
    receiptData,
    onCloseChargePopup: handleCloseChargePopup,
    onReceipt: handleReceipt,
    onCloseReceipt: handleCloseReceipt
  }), [
    showChargePopup,
    showReceiptPopup,
    currentBalance,
    receiptData,
    handleCloseChargePopup,
    handleReceipt,
    handleCloseReceipt
  ]);

  // 권한 확인 중일 때 로딩 표시
  if (!isLoggedIn) {
    return <LoadingState />;
  }

  return (
    <>
      <MyPageContent {...myPageContentProps} />
      <MyPagePopups {...myPagePopupsProps} />
    </>
  );
};

export default MyPage; 