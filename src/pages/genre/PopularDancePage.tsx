import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const PopularDancePage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="popular-dance" categoryName="대중무용" />;
};

export default PopularDancePage; 