import api from '../../services/api';
import { PerformanceRequestDto, UpdatePerformanceRequestDto, PerformanceListItem } from '../types/performance';

export interface PerformanceHostDto {
  performanceId: number;
  title: string;
  date: string;
  img?: string;
  statusDescription: string;
  lookCount: number;
  createdDate: string;
  deletedDate?: string;
}

export interface PerformanceResponseDto {
  performanceId: number;
  status?: string;
  statusDescription?: string;
  title: string;
  genreTitle?: string;
  price?: string;
  date: string;
  runtime: number;
  hallType: string;
  hallAddress: string;
  hostBizName?: string;
  startDate: string;
  endDate: string;
  isEvent?: boolean; // 서버에서 응답하지 않을 수 있으므로 optional로 변경
  img?: string;
  createdAt?: string;
  updatedAt?: string;
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
  
  // HOST 권한으로 생성한 공연 목록 조회
  getHostPerformances: async (): Promise<PerformanceHostDto[]> => {
    const response = await api.get('/api/v1/performance/host');
    console.log('API 응답:', response);
    // 백엔드 응답 구조에 따라 data 필드에서 실제 데이터 추출
    return response.data.data || response.data || [];
  },
  
  // 공연 상세 조회
  getPerformanceDetail: async (performanceId: number): Promise<PerformanceResponseDto> => {
    const response = await api.get(`/api/v1/performance/${performanceId}`);
    console.log('공연 상세 조회 응답:', response);
    return response.data.data || response.data;
  },
  
  // 공연 수정
  updatePerformance: async (performanceId: number, data: UpdatePerformanceRequestDto): Promise<PerformanceResponseDto> => {
    console.log('공연 수정 요청 데이터:', data);
    console.log('isEvent 값:', data.isEvent);
    const response = await api.patch(`/api/v1/performance/${performanceId}`, data);
    console.log('공연 수정 응답:', response);
    return response.data.data || response.data;
  },
  
  // 공연 삭제
  deletePerformance: async (performanceId: number): Promise<void> => {
    const response = await api.delete(`/api/v1/performance/${performanceId}`);
    console.log('공연 삭제 응답:', response);
  },
}; 