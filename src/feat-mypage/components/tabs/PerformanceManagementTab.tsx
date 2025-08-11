import React from 'react';
import { PerformanceListItem } from '../../../home/types/performance';

interface PerformanceManagementTabProps {
  performances: PerformanceListItem[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const PerformanceManagementTab: React.FC<PerformanceManagementTabProps> = ({
  performances,
  loading,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="tab-content">
        <h2 className="page-title">공연관리</h2>
        <div className="loading">공연 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (performances.length === 0) {
    return (
      <div className="tab-content">
        <h2 className="page-title">공연관리</h2>
        <div className="empty-state">
          <p>등록된 공연이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <h2 className="page-title">공연관리</h2>
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
              <p>{performance.hallAddress}</p>
              <p>{performance.date}</p>
              <strong>{performance.hallType}</strong>
              {performance.isEvent && (
                <span className="event-badge">이벤트</span>
              )}
            </div>
            <div className="performance-actions">
              <button 
                className="edit-button"
                onClick={() => onEdit(performance.performanceId)}
              >
                수정
              </button>
              <button 
                className="delete-button"
                onClick={() => onDelete(performance.performanceId)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceManagementTab;
