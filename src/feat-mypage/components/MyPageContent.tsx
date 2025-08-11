import React from 'react';
import { Sidebar, MainContent } from './index';
import { MyPageTab } from '../constants/tabs';
import { PointHistory } from '../types';
import { PerformanceListItem } from '../../home/types/performance';

interface MyPageContentProps {
  currentBalance: number;
  activeTab: MyPageTab;
  pointHistory: PointHistory[];
  pointHistoryLoading: boolean;
  filterType: string;
  performances: PerformanceListItem[];
  loading: boolean;
  onChargeClick: () => void;
  onTabChange: (tab: MyPageTab) => void;
  onNavigate: (path: string) => void;
  onFilterChange: (filter: string) => void;
  onEditPerformance: (id: number) => void;
  onDeletePerformance: (id: number) => void;
}

export const MyPageContent: React.FC<MyPageContentProps> = ({
  currentBalance,
  activeTab,
  pointHistory,
  pointHistoryLoading,
  filterType,
  performances,
  loading,
  onChargeClick,
  onTabChange,
  onNavigate,
  onFilterChange,
  onEditPerformance,
  onDeletePerformance,
}) => {
  return (
    <div className="mypage">
      <div className="page-container">
        <Sidebar
          currentBalance={currentBalance}
          activeTab={activeTab}
          onChargeClick={onChargeClick}
          onTabChange={onTabChange}
          onNavigate={onNavigate}
        />

        {/* 메인 콘텐츠 */}
        <div className="main-content">
          <MainContent
            activeTab={activeTab}
            pointHistory={pointHistory}
            pointHistoryLoading={pointHistoryLoading}
            filterType={filterType}
            performances={performances}
            loading={loading}
            onFilterChange={onFilterChange}
            onChargeClick={onChargeClick}
            onEditPerformance={onEditPerformance}
            onDeletePerformance={onDeletePerformance}
          />
        </div>
      </div>
    </div>
  );
};
