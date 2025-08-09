import React from 'react';
import Layout from '../../../components/layout/Layout';
import CategoryRanking from '../../components/genre/GenreRanking';
import CategoryBrowse from '../../components/genre/GenreBrowse';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

interface GenrePageProps {
  category: string;
  categoryName: string;
}

const GenrePage: React.FC<GenrePageProps> = ({ category, categoryName }) => {
  useScrollToTop();
  return (
    <Layout>
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
        <CategoryRanking category={category} />
        <CategoryBrowse category={category} />
      </div>
    </Layout>
  );
};

export default GenrePage; 