import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceApi } from '../../services/performanceApi';
import { PerformanceListItem } from '../../types/performance';
import { MyPageTabs } from '../../constants/myPageTabs.ts';

export const usePerformances = (activeTab: MyPageTabs, isHost: boolean) => {
  const navigate = useNavigate();

  const [performances, setPerformances] = useState<PerformanceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLast, setIsLast] = useState(false);

  const loadMyPerformances = useCallback(async (targetPage: number = 0) => {
    try {
      setLoading(true);

      const response = await performanceApi.getMyPerformances(targetPage, size);
      const paging = response.data; // PagingResponse
      const hostPerformances = paging?.content ?? [];

      const mapped: PerformanceListItem[] = hostPerformances.map((item: any) => ({
        performanceId: item.performanceId,
        title: item.title,
        date: item.date,
        runtime: item.runtime ?? 0,
        hallType: item.hallType ?? '',
        hallAddress: item.hallAddress ?? '',
        status: item.statusDescription,
        isEvent: item.isEvent ?? false,
        img: item.img,
        createdAt: item.createdDate,
        updatedAt: item.createdDate,
      }));

      setPerformances(mapped);
      setPage(paging.page ?? targetPage);
      setTotalPages(paging.totalPages ?? 0);
      setTotalElements(paging.totalElements ?? 0);
      setIsLast(Boolean(paging.isLast));
    } catch (error) {
      console.error('공연 목록 로드 실패:', error);
      alert('공연 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [size]);

  const handleDeletePerformance = useCallback(async (performanceId: number) => {
    if (!window.confirm('정말로 이 공연을 삭제하시겠습니까?')) return;

    try {
      await performanceApi.deletePerformance(performanceId);
      alert('공연이 삭제되었습니다.');

      const nextPage = performances.length <= 1 && page > 0 ? page - 1 : page;
      await loadMyPerformances(nextPage);
    } catch (error) {
      console.error('공연 삭제 실패:', error);
      alert('공연 삭제에 실패했습니다.');
    }
  }, [performances.length, page, loadMyPerformances]);

  const handleEditPerformance = useCallback((performanceId: number) => {
    navigate(`/performance/${performanceId}/edit`);
  }, [navigate]);

  const hasPrev = page > 0;
  const hasNext = !isLast;

  const goToPage = useCallback(async (p: number) => {
    await loadMyPerformances(p);
  }, [loadMyPerformances]);

  const goPrev = useCallback(async () => {
    if (hasPrev) await loadMyPerformances(page - 1);
  }, [hasPrev, page, loadMyPerformances]);

  const goNext = useCallback(async () => {
    if (hasNext) await loadMyPerformances(page + 1);
  }, [hasNext, page, loadMyPerformances]);

  // 공연 탭이 활성화되면 자동으로 로드
  useEffect(() => {
    if (isHost && activeTab === MyPageTabs.PERFORMANCE_DASHBOARD) {
      loadMyPerformances(0);
    }
  }, [isHost, activeTab, loadMyPerformances]);

  return {
    performances,
    loading,
    page,
    size,
    totalPages,
    totalElements,
    isLast,
    hasPrev,
    hasNext,
    goToPage,   // ⭐ 상위 컴포넌트에서 바로 호출
    goPrev,
    goNext,
    loadMyPerformances,
    handleDeletePerformance,
    handleEditPerformance,
  };
};
