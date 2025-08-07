import api from './api';
import { 
  Seat, 
  Coupon, 
  ReservationRequest, 
  ReservationResponse,
  PaymentInfo,
  SeatPreemptionRequest,
  SeatPreemptionResponse,
  UserPoints
} from '../types/reservation';

export const reservationService = {
  // 좌석 목록 조회
  getSeats: async (performanceId: number): Promise<Seat[]> => {
    try {
      const response = await api.get<{data: Seat[]}>(`/api/v1/performances/${performanceId}/seats`);
      return response.data.data;
    } catch (error) {
      console.error('좌석 조회 실패:', error);
      // 테스트용 더미 데이터 반환
      return generateDummySeats();
    }
  },

  // 좌석 선점
  preemptSeats: async (request: SeatPreemptionRequest): Promise<SeatPreemptionResponse> => {
    try {
      const response = await api.post<{data: SeatPreemptionResponse}>('/api/v1/reservation/preempt', request);
      return response.data.data;
    } catch (error) {
      console.error('좌석 선점 실패:', error);
      // 테스트용 더미 응답 반환
      return generateDummyPreemptionResponse(request);
    }
  },

  // 사용자 포인트 조회
  getUserPoints: async (): Promise<UserPoints> => {
    try {
      const response = await api.get<{data: UserPoints}>('/api/v1/members/points');
      return response.data.data;
    } catch (error) {
      console.error('포인트 조회 실패:', error);
      // 테스트용 더미 데이터 반환
      return {
        availablePoints: 50000,
        totalPoints: 75000
      };
    }
  },

  // 쿠폰 목록 조회
  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const response = await api.get<{data: Coupon[]}>('/api/v1/coupons/my');
      return response.data.data;
    } catch (error) {
      console.error('쿠폰 조회 실패:', error);
      // 테스트용 더미 데이터 반환
      return generateDummyCoupons();
    }
  },

  // 예매 생성
  createReservation: async (reservationRequest: ReservationRequest): Promise<ReservationResponse> => {
    try {
      const response = await api.post<{data: ReservationResponse}>('/api/v1/reservations', reservationRequest);
      return response.data.data;
    } catch (error) {
      console.error('예매 생성 실패:', error);
      // 테스트용 더미 데이터 반환
      return generateDummyReservationResponse(reservationRequest);
    }
  },

  // 예매 내역 조회
  getMyReservations: async (): Promise<ReservationResponse[]> => {
    try {
      const response = await api.get<{data: ReservationResponse[]}>('/api/v1/reservations/my');
      return response.data.data;
    } catch (error) {
      console.error('예매 내역 조회 실패:', error);
      return [];
    }
  },

  // 예매 취소
  cancelReservation: async (reservationId: string): Promise<void> => {
    try {
      await api.delete(`/api/v1/reservations/${reservationId}`);
    } catch (error) {
      console.error('예매 취소 실패:', error);
      throw error;
    }
  },

  // 좌석 선점
  reserveSeats: async (performanceId: number, seatIds: string[]): Promise<void> => {
    try {
      await api.post(`/api/v1/performances/${performanceId}/seats/reserve`, { seatIds });
    } catch (error) {
      console.error('좌석 선점 실패:', error);
      throw error;
    }
  },

  // 좌석 선점 해제
  releaseSeats: async (performanceId: number, seatIds: string[]): Promise<void> => {
    try {
      await api.delete(`/api/v1/performances/${performanceId}/seats/reserve`, { data: { seatIds } });
    } catch (error) {
      console.error('좌석 선점 해제 실패:', error);
      throw error;
    }
  }
};

// 테스트용 더미 데이터 생성 함수들
const generateDummySeats = (): Seat[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
  const newSeats: Seat[] = [];

  rows.forEach(row => {
    numbers.forEach(number => {
      const seatId = `${row}${number}`;
      const isVIP = ['A', 'B', 'C'].includes(row);
      const price = isVIP ? 120000 : 80000;
      
      // 일부 좌석을 매진/선점 상태로 설정
      const isOccupied = Math.random() < 0.3;
      
      newSeats.push({
        id: seatId,
        row,
        number,
        grade: isVIP ? 'VIP' : '일반석',
        price,
        status: isOccupied ? 'occupied' : 'available'
      });
    });
  });

  return newSeats;
};

const generateDummyPreemptionResponse = (request: SeatPreemptionRequest): SeatPreemptionResponse => {
  // 70% 확률로 성공
  const isSuccess = Math.random() < 0.7;
  
  if (isSuccess) {
    const preemptedSeats = request.seatIds.map(seatId => ({
      seatId,
      row: seatId.charAt(0),
      number: parseInt(seatId.slice(1)),
      grade: ['A', 'B', 'C'].includes(seatId.charAt(0)) ? 'VIP' : '일반석',
      price: ['A', 'B', 'C'].includes(seatId.charAt(0)) ? 120000 : 80000
    }));

    return {
      success: true,
      preemptionToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      preemptedUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5분 후
      seats: preemptedSeats,
      message: '좌석 선점이 완료되었습니다.'
    };
  } else {
    // 실패 시 일부 좌석만 선점 불가능
    const unavailableSeatIds = request.seatIds.slice(0, Math.floor(request.seatIds.length * 0.3));
    
    return {
      success: false,
      message: '일부 좌석이 이미 선점되었습니다.',
      unavailableSeatIds
    };
  }
};

const generateDummyCoupons = (): Coupon[] => {
  return [
    {
      id: 1,
      name: '10% 할인 쿠폰',
      discountType: 'percentage',
      discountValue: 10,
      minAmount: 50000,
      maxDiscount: 50000,
      isUsed: false,
      expiryDate: '2024-12-31'
    },
    {
      id: 2,
      name: '30% 할인 쿠폰',
      discountType: 'percentage',
      discountValue: 30,
      minAmount: 100000,
      maxDiscount: 100000,
      isUsed: false,
      expiryDate: '2024-12-31'
    },
    {
      id: 3,
      name: '5,000원 할인 쿠폰',
      discountType: 'fixed',
      discountValue: 5000,
      minAmount: 30000,
      isUsed: false,
      expiryDate: '2024-12-31'
    }
  ];
};

const generateDummyReservationResponse = (request: ReservationRequest): ReservationResponse => {
  const now = new Date();
  const reservationNumber = `TK-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
  
  return {
    reservationId: `res_${Date.now()}`,
    reservationNumber,
    performanceTitle: '뮤지컬 "레미제라블"',
    performanceDate: '2024년 8월 15일 (목) 19:30',
    venue: '세종문화회관 대극장',
    seats: request.seatIds.map((seatId, index) => ({
      id: seatId,
      row: seatId.charAt(0),
      number: parseInt(seatId.slice(1)),
      grade: ['A', 'B', 'C'].includes(seatId.charAt(0)) ? 'VIP' : '일반석',
      price: ['A', 'B', 'C'].includes(seatId.charAt(0)) ? 120000 : 80000,
      status: 'selected'
    })),
    paymentInfo: {
      ticketPrice: request.seatIds.length * 120000,
      discountAmount: 0,
      finalAmount: request.seatIds.length * 120000,
      paymentMethod: request.paymentMethod
    },
    reservator: '홍길동',
    reservationDate: now.toLocaleString('ko-KR')
  };
};

