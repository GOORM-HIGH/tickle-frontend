import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { performanceService } from '../../api/performanceService';
import { PerformanceListItem } from '../../types/performance';
import Layout from '../../../components/layout/Layout';
import '../styles/MyPage.css';
import MyPageSidebar from '../../components/mypage/MyPageSidebar';
import PerformanceManagementList from '../../components/mypage/PerformanceManagementList';
import UserInfoPanel from '../../components/mypage/UserInfoPanel';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  const [performances, setPerformances] = useState<PerformanceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'performances' | 'reservations' | 'coupons' | 'settlements'>('info');

  // 권한 확인
  const isHost = currentUser?.role === 'HOST';

  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/');
      return;
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isHost && activeTab === 'performances') {
      loadMyPerformances();
    }
  }, [isHost, activeTab]);

  const loadMyPerformances = async () => {
    try {
      setLoading(true);
      const data = await performanceService.getMyPerformances();
      setPerformances(data);
    } catch (error) {
      console.error('공연 목록 로드 실패:', error);
      alert('공연 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerformance = async (performanceId: number) => {
    if (!window.confirm('정말로 이 공연을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await performanceService.deletePerformance(performanceId);
      alert('공연이 삭제되었습니다.');
      loadMyPerformances(); // 목록 새로고침
    } catch (error) {
      console.error('공연 삭제 실패:', error);
      alert('공연 삭제에 실패했습니다.');
    }
  };

  const handleEditPerformance = (performanceId: number) => {
    navigate(`/performance/edit/${performanceId}`);
  };

  // 날짜 포맷은 하위 컴포넌트에서 처리

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="mypage-loading">
          <h2>권한 확인 중...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mypage">
        <div className="page-container">
          <MyPageSidebar activeTab={activeTab} onChangeTab={setActiveTab} />

          {/* 메인 콘텐츠 */}
          <div className="main-content">
            {activeTab === 'info' && (
              <UserInfoPanel nickname={currentUser?.nickname} role={currentUser?.role} />
            )}

            {activeTab === 'performances' && (
              <PerformanceManagementList
                isLoading={loading}
                performances={performances}
                onCreateNew={() => navigate('/performance/create')}
                onEdit={handleEditPerformance}
                onDelete={handleDeletePerformance}
              />
            )}

            {activeTab === 'reservations' && (
              <div className="tab-content">
                <h2 className="page-title">예매/취소 내역</h2>
                <p>예매 내역 기능은 준비 중입니다.</p>
              </div>
            )}

            {activeTab === 'coupons' && (
              <div className="tab-content">
                <h2 className="page-title">쿠폰</h2>
                <p>쿠폰 기능은 준비 중입니다.</p>
              </div>
            )}

            {activeTab === 'settlements' && (
              <div className="tab-content">
                <h2 className="page-title">정산내역</h2>
                <p>정산내역 기능은 준비 중입니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyPage; 