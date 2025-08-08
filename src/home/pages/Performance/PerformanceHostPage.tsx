import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceService, PerformanceHostDto } from '../../api/performanceService';
import { useAuth } from '../../../hooks/useAuth';
import Layout from '../../../components/layout/Layout';
import Cookies from 'js-cookie';
import '../../styles/PerformanceHostPage.css';

const PerformanceHostPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  
  const [performances, setPerformances] = useState<PerformanceHostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 디버깅 정보 출력
  useEffect(() => {
    console.log('🔍 인증 상태:', {
      isLoggedIn,
      currentUser,
      token: Cookies.get('accessToken')
    });
  }, [isLoggedIn, currentUser]);
  
  // 권한이 없으면 홈페이지로 리다이렉트
  useEffect(() => {
    console.log('🔍 권한 확인 useEffect 실행:', {
      isLoggedIn,
      currentUser,
      hasToken: !!Cookies.get('accessToken')
    });
    
    // 토큰이 있는데 아직 로그인 상태가 초기화되지 않았으면 대기
    const hasToken = !!Cookies.get('accessToken');
    if (hasToken && !isLoggedIn) {
      console.log('⏳ 토큰은 있지만 로그인 상태 초기화 대기 중...');
      return;
    }
    
    // 로딩 중이거나 아직 사용자 정보가 로드되지 않았으면 대기
    if (isLoggedIn && !currentUser) {
      console.log('⏳ 사용자 정보 로드 대기 중...');
      return;
    }
    
    if (!isLoggedIn) {
      console.log('❌ 로그인되지 않음');
      alert('로그인이 필요합니다.');
      navigate('/');
      return;
    }
    
    console.log('✅ 권한 확인 완료 - 공연 관리 페이지 접근 가능');
  }, [isLoggedIn, currentUser, navigate]);

  // 공연 목록 조회
  useEffect(() => {
    const fetchPerformances = async () => {
      if (!isLoggedIn) return;
      
      try {
        setLoading(true);
        const response = await performanceService.getHostPerformances();
        console.log('생성한 공연 목록:', response);
        
        // 응답이 배열인지 확인하고 안전하게 설정
        if (Array.isArray(response)) {
          setPerformances(response);
        } else {
          console.error('API 응답이 배열이 아닙니다:', response);
          setPerformances([]);
        }
      } catch (error: any) {
        console.error('공연 목록 조회 실패:', error);
        setError('공연 목록을 불러오는데 실패했습니다.');
        setPerformances([]);
        
        if (error.response?.status === 401) {
          alert('인증이 필요합니다. 다시 로그인해주세요.');
          navigate('/');
        } else if (error.response?.status === 403) {
          alert('호스트 권한이 필요합니다.');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, [isLoggedIn, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreatePerformance = () => {
    navigate('/performance/create');
  };

  const handleEditPerformance = (performanceId: number) => {
    navigate(`/performance/edit/${performanceId}`);
  };

  const handleDeletePerformance = async (performanceId: number) => {
    if (window.confirm('정말로 이 공연을 삭제하시겠습니까?')) {
      try {
        await performanceService.deletePerformance(performanceId);
        alert('공연이 삭제되었습니다.');
        // 목록 새로고침
        const response = await performanceService.getHostPerformances();
        setPerformances(response);
      } catch (error: any) {
        console.error('공연 삭제 실패:', error);
        alert('공연 삭제에 실패했습니다.');
      }
    }
  };

  // 로딩 중이거나 권한이 없으면 로딩 화면 표시
  const hasToken = !!Cookies.get('accessToken');
  if (!isLoggedIn || (hasToken && !isLoggedIn) || (isLoggedIn && !currentUser)) {
    return (
      <Layout>
        <div className="performance-host-page">
          <div className="page-container">
            <div className="main-content">
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>권한 확인 중...</h2>
                <p>잠시만 기다려주세요.</p>
                <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                  {!isLoggedIn && hasToken && '토큰 확인 중...'}
                  {!isLoggedIn && !hasToken && '로그인 상태 확인 중...'}
                  {isLoggedIn && !currentUser && '사용자 정보 로드 중...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="performance-host-page">
        <div className="page-container">
          {/* 사이드바 */}
          <div className="sidebar">
            <div className="sidebar-content">
              <h3>마이페이지</h3>
              <ul className="sidebar-menu">
                <li onClick={() => navigate('/mypage')}>내정보</li>
                <li onClick={() => navigate('/mypage/reservations')}>예매/취소 내역</li>
                <li onClick={() => navigate('/mypage/tickets')}>예매권</li>
                <li onClick={() => navigate('/mypage/coupons')}>쿠폰</li>
                <li onClick={() => navigate('/performance/scraps')}>스크랩한 공연</li>
                <li className="active" onClick={() => navigate('/performance/host')}>공연관리</li>
                <li onClick={() => navigate('/mypage/settlements')}>정산내역</li>
              </ul>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="main-content">
            <div className="page-header">
              <h2 className="page-title">내가 생성한 공연</h2>
              <button 
                className="create-button"
                onClick={handleCreatePerformance}
              >
                + 새 공연 생성
              </button>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>공연 목록을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>다시 시도</button>
              </div>
            ) : !Array.isArray(performances) || performances.length === 0 ? (
              <div className="empty-container">
                <div className="empty-icon">🎭</div>
                <h3>생성한 공연이 없습니다</h3>
                <p>첫 번째 공연을 생성해보세요!</p>
                <button 
                  className="create-button"
                  onClick={handleCreatePerformance}
                >
                  공연 생성하기
                </button>
              </div>
            ) : (
              <div className="performance-grid">
                {Array.isArray(performances) && performances.map((performance) => (
                  <div key={performance.performanceId} className="performance-card">
                    <div className="performance-image">
                      {performance.img ? (
                        <img 
                          src={performance.img} 
                          alt={performance.title}
                          className="performance-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="no-image">🎭</div>
                      )}
                    </div>
                    
                    <div className="performance-info">
                      <h3 className="performance-title">{performance.title}</h3>
                      <div className="performance-details">
                        <div className="detail-item">
                          <span className="label">공연일:</span>
                          <span className="value">{formatDate(performance.date)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">조회수:</span>
                          <span className="value">{performance.lookCount}회</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">생성일:</span>
                          <span className="value">{formatDate(performance.createdDate)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">상태:</span>
                          <span className={`status-badge ${performance.statusDescription.toLowerCase()}`}>
                            {performance.statusDescription}
                          </span>
                        </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PerformanceHostPage;
