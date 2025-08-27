import React from 'react';
import Layout from '../../../components/layout/Layout';
import GenreRanking from '../../components/genre/GenreRanking';
import GenreBrowse from '../../components/genre/GenreBrowse';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

interface GenrePageProps {
  category: string;
  categoryName: string;
}

const GenrePage: React.FC<GenrePageProps> = ({ category, categoryName }) => {
  useScrollToTop();
  return (
    <>
      <div style={{ padding: '4rem 2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          color: '#222', 
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          {categoryName}
        </h1>
        <GenreRanking category={category} />
        <GenreBrowse category={category} />
      </div>
    </>
  );
};

export default GenrePage; 