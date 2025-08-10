import api from '../../services/api';

export interface ScrapResponse {
  success: boolean;
  message: string;
}

export interface PerformanceScrapDto {
  performanceId: number;
  title: string;
  img: string;
  date: string;
  runtime: number;
  price: string;
  hallAddress: string;
  hostBizName: string;
  startDate: string;
  endDate: string;
  statusDescription: string;
  event: boolean;
}



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

  // 스크랩 상태 확인
  checkScrapStatus: async (performanceId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/api/v1/performance/${performanceId}/exists`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('스크랩 상태 확인 실패:', error);
      return false;
    }
  },

  // 사용자의 스크랩 목록 조회
  getMyScraps: async (): Promise<PerformanceScrapDto[]> => {
    try {
      const response = await api.get('/api/v1/performance/scrap', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('스크랩 목록 API 응답:', response);
      console.log('응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error('스크랩 목록 조회 실패:', error);
      return [];
    }
  }
}; 