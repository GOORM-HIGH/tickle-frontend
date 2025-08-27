import React from "react";
import { PerformanceListItem } from "../../types/performance";
import { PointHistoryResponse } from "../../services/pointService";
import {
  InfoTab,
  ReservationsTab,
  CouponsTab,
  SettlementsTab,
  PointHistoryTab,
  PerformanceHostDashboard,
  ScrapPage,
} from './tabs';

import { MyPageTab } from "../constants/tabs";

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
  onPageChange,
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <InfoTab />;

      case "reservations":
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
    

      case "coupons":
        return <CouponsTab />;

      case "settlements":
        return <SettlementsTab />;

      case "pointHistory":
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
        return <InfoTab />;
    }
  };

  return <div className="main-content">{renderTabContent()}</div>;
};

export default MainContent;
