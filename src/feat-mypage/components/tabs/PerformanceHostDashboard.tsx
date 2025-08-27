import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { usePerformances } from '../../../hooks/mypage/usePerformances.ts';
import { MY_PAGE_TABS } from '../../constants/tabs';
import '../../styles/PerformanceHostPage.css';
import { useScrollToTop } from '../../../hooks/useScrollToTop';
import { PerformanceListItem } from '../../../home/types/performance';

interface PerformanceHostDashboardProps {
  performances: PerformanceListItem[];
  loading: boolean;
  onEditPerformance: (id: number) => void;
  onDeletePerformance: (id: number) => void;
}

const PerformanceHostDashboard: React.FC<PerformanceHostDashboardProps> = ({
  performances,
  loading,
  onEditPerformance,
  onDeletePerformance
}) => {
  useScrollToTop();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  const isHost = currentUser?.role === 'HOST';
  


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

  if (!isLoggedIn || !isHost) {
    return (
      <div className="performance-host-page">
        <div className="page-container">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h2>권한이 없습니다</h2>
              <p>HOST 권한이 필요합니다.</p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">내가 생성한 공연</h2>
        <button className="create-button" onClick={handleCreatePerformance}>+ 새 공연 생성</button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>공연 목록을 불러오는 중...</p>
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
              <div className="performance-create-image">
                {performance.img ? (
                  <img src={performance.img} alt={performance.title} className="performance-create-img" loading="lazy" />
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
                    <span className="label">상태:</span>
                    <span className={`status-badge ${performance.status.toLowerCase()}`}>{performance.status}</span>
                  </div>
                </div>

                <div className="performance-actions">
                  <button className="edit-button" onClick={() => onEditPerformance(performance.performanceId)}>수정</button>
                  <button className="delete-button" onClick={() => onDeletePerformance(performance.performanceId)}>삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PerformanceHostDashboard;


