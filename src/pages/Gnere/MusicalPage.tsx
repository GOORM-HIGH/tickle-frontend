import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const MusicalPage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="musical" categoryName="뮤지컬" />;
};

export default MusicalPage; 