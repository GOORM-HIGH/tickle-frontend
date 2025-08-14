import React from 'react';
import GenrePage from './CategoryPage';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

const ConcertPage: React.FC = () => {
  useScrollToTop();
  return <GenrePage category="concert" categoryName="대중음악" />;
};

export default ConcertPage; 