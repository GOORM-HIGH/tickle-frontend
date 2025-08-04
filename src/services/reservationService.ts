// src/services/reservationService.ts (새로 생성)
import api from './api';

export interface Reservation {
  reservationId: number;
  performanceId: number;
  performanceTitle: string;
  performanceDate: string;
  reservationDate: string;
  hasJoinedChat: boolean;
  chatRoomId?: number;
}

export const reservationService = {
  // 내 예매 내역 조회
  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get<{data: Reservation[]}>('/api/v1/reservations/my');
    return response.data.data;
  },

  // 공연별 채팅방 참여
  joinChatByPerformance: async (performanceId: number): Promise<{chatRoomId: number}> => {
    const response = await api.post<{data: {chatRoomId: number}}>(`/api/v1/chat/performance/${performanceId}/join`, {
      message: "채팅방에 참여했습니다."
    });
    return response.data.data;
  }
};
