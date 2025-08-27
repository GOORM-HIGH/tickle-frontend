import React from 'react';
import Layout from '../../../components/layout/Layout';
import AdSlider from '../../components/main/AdSlider';
import PopularPerformances from '../../components/main/PopularPerformances';
import ComingSoon from '../../components/main/ComingSoon';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const HomePage: React.FC = () => {
  useScrollToTop();
  
  return (
    <>
      <AdSlider />
      <PopularPerformances />
      <ComingSoon />
    </>
  );
};

export default HomePage; 