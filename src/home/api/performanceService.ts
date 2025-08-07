import api from '../../services/api';
import { PerformanceRequestDto, UpdatePerformanceRequestDto, PerformanceListItem } from '../types/performance';

export interface PerformanceResponseDto {
  id: number;
  title: string;
  genreId: number;
  date: string;
  runtime: number;
  hallType: string;
  hallAddress: string;
  startDate: string;
  endDate: string;
  isEvent: boolean;
  img?: string;
}

export const performanceService = {
  createPerformance: async (data: PerformanceRequestDto): Promise<PerformanceResponseDto> => {
    const response = await api.post<PerformanceResponseDto>('/api/v1/performance', data);
    return response.data;
  },
  
  // 내가 생성한 공연 목록 조회
  getMyPerformances: async (): Promise<PerformanceListItem[]> => {
    const response = await api.get<PerformanceListItem[]>('/api/v1/performance/my');
    return response.data;
  },
  
  // 공연 수정
  updatePerformance: async (performanceId: number, data: UpdatePerformanceRequestDto): Promise<PerformanceResponseDto> => {
    const response = await api.patch<PerformanceResponseDto>(`/api/v1/performance/${performanceId}`, data);
    return response.data;
  },
  
  // 공연 삭제
  deletePerformance: async (performanceId: number): Promise<void> => {
    await api.delete(`/api/v1/performance/${performanceId}`);
  },
}; 