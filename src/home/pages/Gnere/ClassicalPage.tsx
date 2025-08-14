import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const ClassicalPage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="classical" categoryName="서양음악(클래식)" />;
};

export default ClassicalPage; 