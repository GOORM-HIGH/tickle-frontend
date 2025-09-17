import React from 'react';
import { Bookmark } from 'lucide-react';

export interface ScrapItemData {
  performanceId: number;
  img?: string | null;
  title: string;
  event?: boolean;
}

interface ScrapGridProps {
  scraps: ScrapItemData[];
  onViewDetails: (performanceId: number) => void;
  onRemoveScrap: (performanceId: number) => void;
}

const ScrapGrid: React.FC<ScrapGridProps> = ({ scraps, onViewDetails, onRemoveScrap }) => {
  if (!scraps || scraps.length === 0) {
    return (
      <div className="empty-state">
        <Bookmark size={64} className="empty-icon" />
        <h3>스크랩한 공연이 없습니다</h3>
        <p>관심있는 공연을 스크랩하여 쉽게 찾아보세요!</p>
        <button className="browse-button" onClick={() => onViewDetails(0)}>
          공연 둘러보기
        </button>
      </div>
    );
  }

  return (
    <div className="scraps-grid">
      {scraps.map((scrap) => (
        <div key={scrap.performanceId} className="scrap-card">
          <div className="scrap-image-container">
            <img
              src={scrap.img || '/default-performance.png'}
              alt={scrap.title}
              className="scrap-image"
              onClick={() => onViewDetails(scrap.performanceId)}
            />
            {scrap.event && <div className="event-badge">EVENT</div>}
            <button
              className="remove-scrap-btn"
              onClick={() => onRemoveScrap(scrap.performanceId)}
              title="스크랩 제거"
            >
              <Bookmark fill="currentColor" />
            </button>
          </div>

          <div className="scrap-content">
            <h3 className="scrap-title" onClick={() => onViewDetails(scrap.performanceId)}>
              {scrap.title}
            </h3>
            <div className="scrap-actions">
              <button className="view-button" onClick={() => onViewDetails(scrap.performanceId)}>
                상세보기
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScrapGrid;


