import React, { useEffect } from 'react';
import Layout from '../../../components/layout/Layout';
import PerformanceDetail from '../../components/performance/PerformanceDetail';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const PerformanceDetailPage: React.FC = () => {
  useScrollToTop();
  return (
    <Layout>
      <PerformanceDetail />
    </Layout>
  );
};

export default PerformanceDetailPage; 