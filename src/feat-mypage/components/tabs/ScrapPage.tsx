import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import Cookies from 'js-cookie';
import { useAuth } from '../../../hooks/useAuth';
import { scrapService, PerformanceScrapDto } from '../../../services/scrapService';
import SectionHeader from '../../../components/mypage/SectionHeader';
import ScrapGrid from '../../../components/mypage/ScrapGrid';
import { useScrollToTop } from '../../../hooks/useScrollToTop';

import '../../styles/ScrapPage.css';

const ScrapPage: React.FC = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();

  const [scraps, setScraps] = useState<PerformanceScrapDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 인증 상태 확인 및 권한 체크
  useEffect(() => {
    const hasToken = !!Cookies.get('accessToken');
    if (hasToken && !isLoggedIn) return;
    if (isLoggedIn && !currentUser) return;
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/');
    }
  }, [isLoggedIn, currentUser, navigate]);

  // 스크랩 목록 조회
  useEffect(() => {
    const fetchScraps = async () => {
      if (!isLoggedIn) return;

      try {
        setLoading(true);
        console.log('스크랩 목록 조회 시작...');
        const scrapList = await scrapService.getMyScraps();
        console.log('받은 스크랩 목록:', scrapList);
        console.log('스크랩 개수:', scrapList.length);
        setScraps(scrapList);
      } catch (err: any) {
        console.error('스크랩 목록 조회 실패:', err);
        setError('스크랩 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchScraps();
  }, [isLoggedIn]);

  // 스크랩 제거
  const handleRemoveScrap = async (performanceId: number) => {
    const confirmRemove = window.confirm('이 공연을 스크랩에서 제거하시겠습니까?');
    if (!confirmRemove) return;

    try {
      console.log('스크랩 제거 시작, performanceId:', performanceId);
      await scrapService.removeScrap(performanceId);
      setScraps(scraps.filter(scrap => scrap.performanceId !== performanceId));
      console.log('스크랩 제거 성공');
    } catch (err: any) {
      console.error('스크랩 제거 실패:', err);
      console.error('에러 상세:', err.response?.data);
      
      if (err.response?.status === 500) {
        const errorMessage = err.response?.data?.message || err.message;
        if (errorMessage.includes('unique result') || errorMessage.includes('duplicate')) {
          alert('스크랩 데이터에 문제가 있습니다. 페이지를 새로고침 후 다시 시도해주세요.');
          // 페이지 새로고침으로 최신 상태 반영
          window.location.reload();
        } else {
          alert('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else if (err.response?.status === 404) {
        alert('해당 스크랩을 찾을 수 없습니다.');
        // 이미 제거된 경우 목록에서도 제거
        setScraps(scraps.filter(scrap => scrap.performanceId !== performanceId));
      } else {
        alert('스크랩 제거에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 공연 상세 페이지로 이동
  const handleViewDetails = (performanceId: number) => {
    navigate(`/performance/${performanceId}`);
  };

  if (!isLoggedIn || loading) {
    return (
        <div className="scrap-page">
          <div className="page-container">
            <div className="main-content" style={{ textAlign: 'center', padding: '50px' }}>
              <h2>{loading ? '스크랩 목록을 불러오는 중...' : '권한 확인 중...'}</h2>
              <p>잠시만 기다려주세요.</p>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="scrap-page">
          <div className="page-container">
            <div className="main-content" style={{ textAlign: 'center', padding: '50px' }}>
              <h2>오류 발생</h2>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>다시 시도</button>
            </div>
          </div>
        </div>
    );
  }

  return (
          <div>
            <SectionHeader title={<><Bookmark className="title-icon" /> 스크랩한 공연</>} subtitle="관심있는 공연을 모아서 확인해보세요" />

            <ScrapGrid
              scraps={scraps}
              onViewDetails={(id) => (id ? handleViewDetails(id) : navigate('/'))}
              onRemoveScrap={handleRemoveScrap}
            />
          </div>
  );
};

export default ScrapPage;
