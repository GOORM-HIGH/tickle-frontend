import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceApi } from '../../services/performanceApi';
import { PerformanceListItem } from '../../types/performance';
import { MyPageTabs } from '../../constants/myPageTabs.ts';

export const usePerformances = (activeTab: MyPageTabs, isHost: boolean) => {
  const navigate = useNavigate();
  const [performances, setPerformances] = useState<PerformanceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyPerformances = useCallback(async () => {
    try {
      setLoading(true);
      const response = await performanceApi.getHostPerformances();
      console.log('🔍 API 응답 전체:', response);
      console.log('🔍 API 응답 데이터:', response.data);

      const hostPerformances = response.data || [];
      console.log('🔍 호스트 공연 목록:', hostPerformances);

      if (hostPerformances.length > 0) {
        console.log('🔍 첫 번째 공연 데이터:', hostPerformances[0]);
        console.log('🔍 첫 번째 공연의 모든 키:', Object.keys(hostPerformances[0]));
      }

      const mappedPerformances: PerformanceListItem[] = hostPerformances.map(item => ({
        performanceId: item.performanceId,
        title: item.title,
        date: item.date,
        runtime: item.runtime || 0,
        hallType: item.hallType || '',
        hallAddress: item.hallAddress || '',
        status: item.statusDescription,
        isEvent: item.isEvent || false,
        img: item.img,
        createdAt: item.createdDate,
        updatedAt: item.createdDate,
      }));

      console.log('🔍 매핑된 공연 목록:', mappedPerformances);
      setPerformances(mappedPerformances);
    } catch (error) {
      console.error('공연 목록 로드 실패:', error);
      alert('공연 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeletePerformance = useCallback(async (performanceId: number) => {
    if (!window.confirm('정말로 이 공연을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await performanceApi.deletePerformance(performanceId);
      alert('공연이 삭제되었습니다.');
      loadMyPerformances(); // 목록 새로고침
    } catch (error) {
      console.error('공연 삭제 실패:', error);
      alert('공연 삭제에 실패했습니다.');
    }
  }, [loadMyPerformances]);

  const handleEditPerformance = useCallback((performanceId: number) => {
    navigate(`/performance/edit/${performanceId}`);
  }, [navigate]);

  // 공연 탭이 활성화되면 자동으로 로드
  useEffect(() => {
    if (isHost && activeTab === MyPageTabs.PERFORMANCE_DASHBOARD) {
      loadMyPerformances();
    }
  }, [isHost, activeTab, loadMyPerformances]);

  return {
    performances,
    loading,
    loadMyPerformances,
    handleDeletePerformance,
    handleEditPerformance
  };
};
