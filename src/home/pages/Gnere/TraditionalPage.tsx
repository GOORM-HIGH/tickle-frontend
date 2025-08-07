import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const TraditionalPage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="traditional" categoryName="한국음악(국악)" />;
};

export default TraditionalPage; 