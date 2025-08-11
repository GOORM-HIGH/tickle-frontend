import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceApi, PerformanceHostDto } from '../../home/api/performanceApi';
import { PerformanceListItem } from '../../home/types/performance';
import { MY_PAGE_TABS } from '../constants/tabs';

export const usePerformances = (activeTab: string, isHost: boolean) => {
  const navigate = useNavigate();
  const [performances, setPerformances] = useState<PerformanceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyPerformances = useCallback(async () => {
    try {
      setLoading(true);
      const data = await performanceApi.getMyPerformances();
      setPerformances(data);
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
    if (isHost && activeTab === MY_PAGE_TABS.PERFORMANCES) {
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
