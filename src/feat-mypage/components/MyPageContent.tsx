import React from 'react';
import Sidebar from '../../components/member/mypage/Sidebar.tsx';
import MainContent from './MainContent';
import { MyPageTab } from '../constants/tabs';
import { PointHistoryResponse } from '../../services/pointService';
import { PerformanceListItem } from '../../home/types/performance';

interface MyPageContentProps {
  currentBalance: number;
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
  onChargeClick: () => void;
  onTabChange: (tab: MyPageTab) => void;
  onNavigate: (path: string) => void;
  onFilterChange: (filter: string) => void;
  onEditPerformance: (id: number) => void;
  onDeletePerformance: (id: number) => void;
  onPageChange: (page: number) => void;
}

const MyPageContent: React.FC<MyPageContentProps> = ({
  currentBalance,
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
  onChargeClick,
  onTabChange,
  onNavigate,
  onFilterChange,
  onEditPerformance,
  onDeletePerformance,
  onPageChange,
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
            currentPage={currentPage}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            isLast={isLast}
            performances={performances}
            loading={loading}
            onFilterChange={onFilterChange}
            onChargeClick={onChargeClick}
            onEditPerformance={onEditPerformance}
            onDeletePerformance={onDeletePerformance}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MyPageContent;
