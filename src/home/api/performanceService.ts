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

// 호스트 공연 목록을 위한 DTO
export interface PerformanceHostDto {
  performanceId: number;
  title: string;
  date: string;
  img?: string;
  lookCount: number;
  createdDate: string;
  statusDescription: string; // 공연 상태 설명 (예: "활성", "비활성", "삭제됨")
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

  // 호스트가 생성한 공연 목록 조회 (관리용)
  getHostPerformances: async (): Promise<PerformanceHostDto[]> => {
    const response = await api.get<PerformanceHostDto[]>('/api/v1/performance/host');
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