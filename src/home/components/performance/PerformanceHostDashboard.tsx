import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { useAuth } from '../../../hooks/useAuth';
import { performanceService, PerformanceHostDto } from '../../api/performanceService';

import '../../styles/PerformanceHostPage.css';

const PerformanceHostDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();

  const [performances, setPerformances] = useState<PerformanceHostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const hasToken = !!Cookies.get('accessToken');
    if (hasToken && !isLoggedIn) return;
    if (isLoggedIn && !currentUser) return;
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/');
    }
  }, [isLoggedIn, currentUser, navigate]);

  useEffect(() => {
    const fetchPerformances = async () => {
      if (!isLoggedIn) return;
      try {
        setLoading(true);
        const response = await performanceService.getHostPerformances();
        if (Array.isArray(response)) setPerformances(response);
        else setPerformances([]);
      } catch (err: any) {
        console.error('공연 목록 조회 실패:', err);
        setError('공연 목록을 불러오는데 실패했습니다.');
        setPerformances([]);
        if (err.response?.status === 401) navigate('/');
        else if (err.response?.status === 403) navigate('/');
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
      minute: '2-digit',
    });
  };

  const handleCreatePerformance = () => navigate('/performance/create');
  const handleEditPerformance = (performanceId: number) => navigate(`/performance/edit/${performanceId}`);

  const handleDeletePerformance = async (performanceId: number) => {
    if (!window.confirm('정말로 이 공연을 삭제하시겠습니까?')) return;
    try {
      await performanceService.deletePerformance(performanceId);
      alert('공연이 삭제되었습니다.');
      const response = await performanceService.getHostPerformances();
      setPerformances(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('공연 삭제 실패:', err);
      alert('공연 삭제에 실패했습니다.');
    }
  };

  const hasToken = !!Cookies.get('accessToken');
  if (!isLoggedIn || (hasToken && !isLoggedIn) || (isLoggedIn && !currentUser)) {
    return (
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
    );
  }

  return (
    <div className="performance-host-page">
      <div className="page-container">
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

        <div className="main-content">
          <div className="page-header">
            <h2 className="page-title">내가 생성한 공연</h2>
            <button className="create-button" onClick={handleCreatePerformance}>+ 새 공연 생성</button>
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
              <button className="create-button" onClick={handleCreatePerformance}>공연 생성하기</button>
            </div>
          ) : (
            <div className="performance-grid">
              {performances.map(performance => (
                <div key={performance.performanceId} className="performance-card">
                  <div className="performance-image">
                    {performance.img ? (
                      <img src={performance.img} alt={performance.title} className="performance-img" loading="lazy" />
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
                        <span className={`status-badge ${performance.statusDescription.toLowerCase()}`}>{performance.statusDescription}</span>
                      </div>
                    </div>

                    <div className="performance-actions">
                      <button className="edit-button" onClick={() => handleEditPerformance(performance.performanceId)}>수정</button>
                      <button className="delete-button" onClick={() => handleDeletePerformance(performance.performanceId)}>삭제</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceHostDashboard;


