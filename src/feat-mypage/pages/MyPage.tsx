import React from 'react';
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
    showReceiptPopup, 
    handleChargeClick, 
    handleCloseChargePopup, 
    handleCloseReceiptPopup,
    setActiveTab 
  } = useUI();
  const { 
    currentBalance, 
    pointHistory, 
    pointHistoryLoading, 
    filterType, 
    handleCharge, 
    setFilterType 
  } = usePoints();
  const { 
    performances, 
    loading, 
    handleDeletePerformance, 
    handleEditPerformance 
  } = usePerformances(activeTab, true);
  const { 
    receiptData, 
    handleReceipt, 
    clearReceiptData 
  } = usePopups();

  // 포인트 충전 완료 후 팝업 닫기
  const handleChargeComplete = async (amount: number) => {
    const result = await handleCharge(amount);
    if (result.success) {
      handleCloseChargePopup();
      if (result.data) {
        handleReceipt(result.data);
      }
    }
    return result;
  };

  // 영수증 팝업 닫기
  const handleCloseReceipt = () => {
    handleCloseReceiptPopup();
    clearReceiptData();
  };

  // 권한 확인 중일 때 로딩 표시
  if (!isLoggedIn) {
    return <LoadingState />;
  }

  return (
    <Layout>
      <MyPageContent
        currentBalance={currentBalance}
        activeTab={activeTab}
        pointHistory={pointHistory}
        pointHistoryLoading={pointHistoryLoading}
        filterType={filterType}
        performances={performances}
        loading={loading}
        onChargeClick={handleChargeClick}
        onTabChange={setActiveTab}
        onNavigate={navigate}
        onFilterChange={setFilterType}
        onEditPerformance={handleEditPerformance}
        onDeletePerformance={handleDeletePerformance}
      />

      <MyPagePopups
        showChargePopup={showChargePopup}
        showReceiptPopup={showReceiptPopup}
        currentBalance={currentBalance}
        receiptData={receiptData}
        onCloseChargePopup={handleCloseChargePopup}
        onCharge={handleChargeComplete}
        onReceipt={handleReceipt}
        onCloseReceipt={handleCloseReceipt}
      />
    </Layout>
  );
};

export default MyPage; 