import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const CircusPage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="circus" categoryName="서커스/마술" />;
};

export default CircusPage; 