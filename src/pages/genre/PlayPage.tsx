import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const PlayPage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="play" categoryName="연극" />;
};

export default PlayPage; 