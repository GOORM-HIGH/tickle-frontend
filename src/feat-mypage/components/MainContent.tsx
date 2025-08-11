import React from 'react';
import { PerformanceListItem } from '../../home/types/performance';
import { PointHistoryResponse } from '../../services/pointService';
import { 
  InfoTab,
  ReservationsTab,
  CouponsTab,
  SettlementsTab,
  PointHistoryTab,
  PerformanceHostDashboard,
  ScrapPage,
} from './tabs';

import { MyPageTab } from '../constants/tabs';

interface MainContentProps {
  activeTab: MyPageTab;
  pointHistory: PointHistoryResponse[];
  pointHistoryLoading: boolean;
  filterType: string;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  performances: PerformanceListItem[];
  loading: boolean;
  onFilterChange: (type: string) => void;
  onChargeClick: () => void;
  onEditPerformance: (id: number) => void;
  onDeletePerformance: (id: number) => void;
  onPageChange: (page: number) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  pointHistory,
  pointHistoryLoading,
  filterType,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  isLast,
  performances,
  loading,
  onFilterChange,
  onChargeClick,
  onEditPerformance,
  onDeletePerformance,
  onPageChange
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <InfoTab />;

      case 'reservations':
        return <ReservationsTab />;
      
      case 'scraps':
        return <ScrapPage />;

      case 'performances':
        return  <PerformanceHostDashboard 
                  performances={performances}
                  loading={loading}
                  onEditPerformance={onEditPerformance}
                  onDeletePerformance={onDeletePerformance}
                />;
    

      case 'coupons':
        return <CouponsTab />;

      case 'settlements':
        return <SettlementsTab />;

      case 'pointHistory':
        return (
          <PointHistoryTab
            pointHistory={pointHistory}
            pointHistoryLoading={pointHistoryLoading}
            filterType={filterType}
            currentPage={currentPage}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            isLast={isLast}
            onFilterChange={onFilterChange}
            onChargeClick={onChargeClick}
            onPageChange={onPageChange}
          />
        );

      default:
        return (
          <div className="tab-content">
            <h2 className="page-title">내정보</h2>
            <p>사용자 정보를 확인하고 수정할 수 있습니다.</p>
          </div>
        );
    }
  };

  return (
    <div className="main-content">
      {renderTabContent()}
    </div>
  );
};

export default MainContent;
