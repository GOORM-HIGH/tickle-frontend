import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import CategoryRanking from '../../components/category/CategoryRanking';
import CategoryBrowse from '../../components/category/CategoryBrowse';
import { useScrollToTop } from '../../../hooks/useScrollToTop';
import { performanceApi, GenreDto } from '../../api/performanceApi';

const DynamicGenrePage: React.FC = () => {
  const { genreId } = useParams<{ genreId: string }>();
  const [genreInfo, setGenreInfo] = useState<GenreDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useScrollToTop();

  useEffect(() => {
    const fetchGenreInfo = async () => {
      if (!genreId) {
        setError('장르 ID가 필요합니다.');
        setLoading(false);
        return;
      }

      try {
        // 장르 목록을 가져와서 해당 ID의 장르 정보를 찾기
        const response = await performanceApi.getGenres();
        if (response.data) {
          const genre = response.data.find(g => g.genreId === genreId);
          if (genre) {
            setGenreInfo(genre);
          } else {
            setError('해당 장르를 찾을 수 없습니다.');
          }
        } else {
          setError('장르 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('장르 정보를 가져오는데 실패했습니다:', err);
        setError('장르 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGenreInfo();
  }, [genreId]);

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div>장르 정보를 불러오는 중...</div>
        </div>
      </Layout>
    );
  }

  if (error || !genreInfo) {
    return (
      <Layout>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ color: '#ef4444' }}>
            {error || '장르 정보를 찾을 수 없습니다.'}
          </div>
        </div>
      </Layout>
    );
  }

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
          {genreInfo.title}
        </h1>
        <CategoryRanking category={genreId!} />
        <CategoryBrowse category={genreId!} />
      </div>
    </Layout>
  );
};

export default DynamicGenrePage;
