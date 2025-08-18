import api from './api';
import { 
  Seat, 
  Coupon, 
  ReservationRequest, 
  ReservationResponse,
  PaymentInfo,
  SeatPreemptionRequest,
  SeatPreemptionResponse,
  UserPoints,
  HallTypeAndSeatInfoResponseDto,
  ReservationInfoResponseDto,
  ReservationCompletionRequestDto,
  ReservationCompletionResponseDto,
  ReservationHistoryResponseDto,
  ReservationDetailResponseDto,
  ReservationCancelResponseDto
} from '../types/reservation';

export const reservationService = {
  // 좌석 목록 조회 (공연장 타입별 좌석 정보)
  getSeats: async (performanceId: number): Promise<HallTypeAndSeatInfoResponseDto> => {
    const response = await api.get<{data: HallTypeAndSeatInfoResponseDto}>(`/api/v1/reservation/${performanceId}/seats`);
    return response.data.data;
  },

  // 좌석 선점
  preemptSeats: async (request: SeatPreemptionRequest): Promise<SeatPreemptionResponse> => {
    const response = await api.post<{data: SeatPreemptionResponse}>('/api/v1/reservation/preempt', request);
    return response.data.data;
  },

  // 결제 정보 조회 (새로운 API)
  getPaymentInfo: async (preemptionToken: string): Promise<ReservationInfoResponseDto> => {
    const response = await api.get<{data: ReservationInfoResponseDto}>(`/api/v1/reservation/payment-info/${preemptionToken}`);
    return response.data.data;
  },

  // 예매 완료
  completeReservation: async (request: ReservationCompletionRequestDto): Promise<ReservationCompletionResponseDto> => {
    const response = await api.post<{data: ReservationCompletionResponseDto}>('/api/v1/reservation/complete', request);
    return response.data.data;
  },

  // 예매 내역 조회
  getReservationHistory: async (page: number = 0, size: number = 10, status?: string): Promise<ReservationHistoryResponseDto[]> => {
    const params: any = { page, size };
    if (status) params.status = status;
    
    const response = await api.get<{data: ReservationHistoryResponseDto[]}>('/api/v1/reservation/history', { params });
    return response.data.data;
  },

  // 예매 상세 정보 조회
  getReservationDetail: async (reservationId: number): Promise<ReservationDetailResponseDto> => {
    const response = await api.get<{data: ReservationDetailResponseDto}>(`/api/v1/reservation/${reservationId}`);
    return response.data.data;
  },

  // 예매 취소
  cancelReservation: async (reservationId: number): Promise<ReservationCancelResponseDto> => {
    const response = await api.post<{data: ReservationCancelResponseDto}>(`/api/v1/reservation/${reservationId}`);
    return response.data.data;
  },

  // 사용자 포인트 조회
  getUserPoints: async (): Promise<UserPoints> => {
    const response = await api.get<{data: UserPoints}>('/api/v1/members/points');
    return response.data.data;
  },

  // 쿠폰 목록 조회
  getCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get<{data: Coupon[]}>('/api/v1/coupons/my');
    return response.data.data;
  },

  // 예매 생성 (기존 호환성)
  createReservation: async (reservationRequest: ReservationRequest): Promise<ReservationResponse> => {
    const response = await api.post<{data: ReservationResponse}>('/api/v1/reservation', reservationRequest);
    return response.data.data;
  },

  // 예매 내역 조회 (기존 호환성)
  getMyReservations: async (): Promise<ReservationResponse[]> => {
    const response = await api.get<{data: ReservationResponse[]}>('/api/v1/reservation/my');
    return response.data.data;
  }
};

