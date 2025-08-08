import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { performanceService, PerformanceListItem } from '../api/performanceService';
import Layout from '../../components/layout/Layout';
import '../styles/MyPage.css';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          {/* 사이드바 */}
          <div className="sidebar">
            <div className="sidebar-content">
              <h3>마이페이지</h3>
              <ul className="sidebar-menu">
                <li 
                  className={activeTab === 'info' ? 'active' : ''}
                  onClick={() => setActiveTab('info')}
                >
                  내정보
                </li>
                <li 
                  className={activeTab === 'reservations' ? 'active' : ''}
                  onClick={() => setActiveTab('reservations')}
                >
                  예매/취소 내역
                </li>
                <li onClick={() => navigate('/performance/scraps')}>
                  스크랩한 공연
                </li>
                <li 
                  className={activeTab === 'performances' ? 'active' : ''}
                  onClick={() => setActiveTab('performances')}
                >
                  공연관리
                </li>
                <li 
                  className={activeTab === 'coupons' ? 'active' : ''}
                  onClick={() => setActiveTab('coupons')}
                >
                  쿠폰
                </li>
                <li 
                  className={activeTab === 'settlements' ? 'active' : ''}
                  onClick={() => setActiveTab('settlements')}
                >
                  정산내역
                </li>
              </ul>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="main-content">
            {activeTab === 'info' && (
              <div className="tab-content">
                <h2 className="page-title">내정보</h2>
                <div className="user-info">
                  <p><strong>닉네임:</strong> {currentUser?.nickname}</p>
                  <p><strong>역할:</strong> {currentUser?.role === 'HOST' ? '호스트' : '일반 사용자'}</p>
                </div>
              </div>
            )}

            {activeTab === 'performances' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2 className="page-title">공연관리</h2>
                  <button 
                    className="create-button"
                    onClick={() => navigate('/performance/create')}
                  >
                    새 공연 만들기
                  </button>
                </div>
                
                {loading ? (
                  <div className="loading">공연 목록을 불러오는 중...</div>
                ) : performances.length === 0 ? (
                  <div className="empty-state">
                    <p>아직 생성한 공연이 없습니다.</p>
                    <button 
                      className="create-button"
                      onClick={() => navigate('/performance/create')}
                    >
                      첫 공연 만들기
                    </button>
                  </div>
                ) : (
                  <div className="performance-list">
                    {performances.map((performance) => (
                      <div key={performance.performanceId} className="performance-item">
                        <div className="performance-image">
                          {performance.img ? (
                            <img src={performance.img} alt={performance.title} />
                          ) : (
                            <div className="no-image">이미지 없음</div>
                          )}
                        </div>
                        <div className="performance-info">
                          <h3>{performance.title}</h3>
                          <p><strong>공연일:</strong> {formatDate(performance.date)}</p>
                          <p><strong>상영시간:</strong> {performance.runtime}분</p>
                          <p><strong>장소:</strong> {performance.hallAddress}</p>
                          <p><strong>상태:</strong> {performance.status}</p>
                          {performance.isEvent && <span className="event-badge">이벤트</span>}
                        </div>
                        <div className="performance-actions">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditPerformance(performance.performanceId)}
                          >
                            수정
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeletePerformance(performance.performanceId)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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