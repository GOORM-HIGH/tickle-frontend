import React, { useEffect } from 'react';
import PerformanceDetail from '../../components/performance/PerformanceDetail';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const PerformanceDetailPage: React.FC = () => {
  useScrollToTop();
  return (
    <>
      <PerformanceDetail />
    </>
  );
};

export default PerformanceDetailPage; 