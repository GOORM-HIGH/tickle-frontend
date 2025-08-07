import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const ComplexPage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="complex" categoryName="복합" />;
};

export default ComplexPage; 