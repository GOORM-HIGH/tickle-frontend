import React from 'react';

export interface PerformanceListItemProps {
  performanceId: number;
  img?: string | null;
  title: string;
  date: string;
  runtime: number;
  hallAddress: string;
  status: string;
  isEvent?: boolean;
}

interface PerformanceManagementListProps {
  isLoading: boolean;
  performances: PerformanceListItemProps[];
  onCreateNew: () => void;
  onEdit: (performanceId: number) => void;
  onDelete: (performanceId: number) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PerformanceManagementList: React.FC<PerformanceManagementListProps> = ({
  isLoading,
  performances,
  onCreateNew,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="page-title">공연관리</h2>
        <button className="create-button" onClick={onCreateNew}>
          새 공연 만들기
        </button>
      </div>

      {isLoading ? (
        <div className="loading">공연 목록을 불러오는 중...</div>
      ) : performances.length === 0 ? (
        <div className="empty-state">
          <p>아직 생성한 공연이 없습니다.</p>
          <button className="create-button" onClick={onCreateNew}>
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
                <p>
                  <strong>공연일:</strong> {formatDate(performance.date)}
                </p>
                <p>
                  <strong>상영시간:</strong> {performance.runtime}분
                </p>
                <p>
                  <strong>장소:</strong> {performance.hallAddress}
                </p>
                <p>
                  <strong>상태:</strong> {performance.status}
                </p>
                {performance.isEvent && <span className="event-badge">이벤트</span>}
              </div>
              <div className="performance-actions">
                <button className="edit-button" onClick={() => onEdit(performance.performanceId)}>
                  수정
                </button>
                <button className="delete-button" onClick={() => onDelete(performance.performanceId)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceManagementList;


