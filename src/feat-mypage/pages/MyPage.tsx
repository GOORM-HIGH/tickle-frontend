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
    handleChargeClick, 
    handleCloseChargePopup,
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
    showReceiptPopup,
    handleReceipt, 
    clearReceiptData,
    closeReceiptPopup
  } = usePopups();

  // 포인트 충전 완료 후 팝업 닫기
  const handleChargeComplete = async (amount: number) => {
    console.log('포인트 충전 시작:', amount);
    const result = await handleCharge(amount);
    console.log('포인트 충전 결과:', result);
    if (result.success) {
      handleCloseChargePopup();
      if (result.data) {
        console.log('영수증 데이터 설정:', result.data);
        handleReceipt(result.data);
      }
    }
    return result;
  };

  // 영수증 팝업 닫기
  const handleCloseReceipt = () => {
    closeReceiptPopup();
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