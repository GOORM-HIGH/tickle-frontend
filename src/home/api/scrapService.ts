import api from '../../services/api';

export interface ScrapResponse {
  success: boolean;
  message: string;
}

// 토큰을 동적으로 가져오는 함수
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

export const scrapService = {
  // 스크랩 추가
  addScrap: async (performanceId: number): Promise<ScrapResponse> => {
    try {
      const response = await api.post(`/api/v1/performance/${performanceId}/scrap`, {}, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('스크랩 추가 실패:', error);
      throw error;
    }
  },

  // 스크랩 제거
  removeScrap: async (performanceId: number): Promise<ScrapResponse> => {
    try {
      const response = await api.delete(`/api/v1/performance/${performanceId}/scrap`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('스크랩 제거 실패:', error);
      throw error;
    }
  },

  // 스크랩 상태 확인 (임시로 false 반환)
  checkScrapStatus: async (performanceId: number): Promise<boolean> => {
    // 백엔드에 상태 확인 API가 없으므로 임시로 false 반환
    // TODO: 백엔드에서 스크랩 상태 확인 API 추가 필요
    return false;
  },

  // 사용자의 스크랩 목록 조회
  getMyScraps: async (): Promise<any[]> => {
    try {
      const response = await api.get('/api/v1/performance/scrap/my', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('스크랩 목록 조회 실패:', error);
      return [];
    }
  }
}; 