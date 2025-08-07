export interface Reservation {
  reservationId: number;
  performanceId: number;
  performanceTitle: string;
  performanceDate: string;
  reservationDate: string;
  hasJoinedChat: boolean;
  chatRoomId?: number;
}

// 좌석 관련 타입들
export interface Seat {
  id: string;
  row: string;
  number: number;
  grade: 'VIP' | '일반석';
  price: number;
  status: 'available' | 'selected' | 'occupied' | 'reserved';
  isSelected?: boolean;
}

export interface SeatGrade {
  name: string;
  price: number;
  description: string;
}

// 좌석 선점 관련 타입들
export interface SeatPreemptionRequest {
  performanceId: number;
  seatIds: string[];
}

export interface PreemptedSeatInfo {
  seatId: string;
  row: string;
  number: number;
  grade: string;
  price: number;
}

export interface SeatPreemptionResponse {
  success: boolean;
  preemptionToken?: string;
  preemptedUntil?: string;
  seats?: PreemptedSeatInfo[];
  message: string;
  unavailableSeatIds?: string[];
}

// 쿠폰 관련 타입들
export interface Coupon {
  id: number;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  isUsed: boolean;
  expiryDate: string;
}

// 결제 관련 타입들
export interface PaymentInfo {
  ticketPrice: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'point' | 'card' | 'bank';
  usedCoupon?: Coupon;
  userPoints?: number;
}

export interface ReservationRequest {
  performanceId: number;
  seatIds: string[];
  couponId?: number;
  paymentMethod: 'point' | 'card' | 'bank';
  preemptionToken: string;
}

export interface ReservationResponse {
  reservationId: string;
  reservationNumber: string;
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  seats: Seat[];
  paymentInfo: PaymentInfo;
  reservator: string;
  reservationDate: string;
}

// 좌석 선택 상태
export interface SeatSelectionState {
  selectedSeats: Seat[];
  maxSeats: number;
  totalPrice: number;
}

// 사용자 포인트 정보
export interface UserPoints {
  availablePoints: number;
  totalPoints: number;
}
