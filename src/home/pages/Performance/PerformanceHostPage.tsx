import React from 'react';
import Layout from '../../../components/layout/Layout';
import PerformanceHostDashboard from '../../components/performance/PerformanceHostDashboard';

const PerformanceHostPage: React.FC = () => {
  return (
    <Layout>
      <PerformanceHostDashboard />
    </Layout>
  );
};

export default PerformanceHostPage;
