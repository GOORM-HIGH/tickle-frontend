import React from 'react';
import { PerformanceListItem } from '../../home/types/performance';
import { 
  InfoTab,
  ReservationsTab,
  CouponsTab,
  SettlementsTab,
  PointHistoryTab,
  PerformanceManagementTab
} from './tabs';

import { MyPageTab } from '../constants/tabs';

interface MainContentProps {
  activeTab: MyPageTab;
  pointHistory: any[];
  pointHistoryLoading: boolean;
  filterType: string;
  performances: PerformanceListItem[];
  loading: boolean;
  onFilterChange: (type: string) => void;
  onChargeClick: () => void;
  onEditPerformance: (id: number) => void;
  onDeletePerformance: (id: number) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  pointHistory,
  pointHistoryLoading,
  filterType,
  performances,
  loading,
  onFilterChange,
  onChargeClick,
  onEditPerformance,
  onDeletePerformance
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <InfoTab />;

      case 'reservations':
        return <ReservationsTab />;

      case 'performances':
        return (
          <PerformanceManagementTab
            performances={performances}
            loading={loading}
            onEdit={onEditPerformance}
            onDelete={onDeletePerformance}
          />
        );

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
              onFilterChange={onFilterChange}
              onChargeClick={onChargeClick}
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
