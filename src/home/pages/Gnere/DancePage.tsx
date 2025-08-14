import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const DancePage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="dance" categoryName="무용(서양/한국무용)" />;
};

export default DancePage; 