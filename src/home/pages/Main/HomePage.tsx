import React from 'react';
import Layout from '../../../components/layout/Layout';
import AdSlider from '../../components/AdSlider';
import PopularPerformances from '../../components/PopularPerformances';
import ComingSoon from '../../components/ComingSoon';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const HomePage: React.FC = () => {
  useScrollToTop();
  
  return (
    <Layout>
      <AdSlider />
      <PopularPerformances />
      <ComingSoon />
    </Layout>
  );
};

export default HomePage; 