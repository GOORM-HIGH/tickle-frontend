export interface Reservation {
  reservationId: number;
  performanceId: number;
  performanceTitle: string;
  performanceDate: string;
  reservationDate: string;
  hasJoinedChat: boolean;
  chatRoomId?: number;
}

// 공연장 타입
export type HallType = 'A' | 'B';

// 좌석 등급
export type SeatGradeType = 'VIP' | 'R' | 'S';

// 좌석 관련 타입들
export interface Seat {
  id: string;
  row: string;
  number: number;
  grade: SeatGradeType;
  price: number;
  status: 'available' | 'selected' | 'occupied' | 'reserved';
  isSelected?: boolean;
}

// 백엔드 응답 구조
export interface SeatResponseDto {
  seatId: number;
  seatNumber: string;
  seatGrade: string;
  seatPrice: number;
  statusId: number;
}

// 프론트엔드에서 사용하는 좌석 정보 (매핑 후)
export interface SeatInfoResponseDto {
  id: string;
  row: string;
  number: number;
  grade: SeatGradeType;
  price: number;
  status: 'available' | 'occupied' | 'reserved';
}

// 공연장 타입별 좌석 정보 응답
export interface HallTypeAndSeatInfoResponseDto {
  hallType: HallType;
  seats: SeatResponseDto[];
}

export interface SeatGrade {
  name: string;
  price: number;
  description: string;
}

// 좌석 선점 관련 타입들
export interface SeatPreemptionRequest {
  performanceId: number;
  seatIds: number[]; // seatId (숫자) 배열로 변경
}

export interface PreemptedSeatInfo {
  seatId: number;
  seatNumber: string;
  seatGrade: string;
  seatPrice: number;
}

export interface SeatPreemptionResponse {
  success: boolean;
  preemptionToken?: string;
  preemptedUntil?: string;
  seats?: PreemptedSeatInfo[];
  message: string;
  unavailableSeatIds?: number[];
}

// 쿠폰 응답 DTO (백엔드 구조에 맞춤)
export interface CouponResponseDto {
  couponId: number;
  couponName: string;
  couponRate: number;
  couponValid: string;
}

// 쿠폰 관련 타입들 (기존 호환성)
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

// 결제 정보 조회 응답
export interface ReservationInfoResponseDto {
  seats: PreemptedSeatInfo[];
  totalAmount: number;
  currentPoints: number;
  sufficientPoints: boolean;
  coupons: CouponResponseDto[];
  preemptedUntil: string;
}

// 예매 완료 요청
export interface ReservationCompletionRequestDto {
  preemptionToken: string;
  totalAmount: number;
  couponId?: number;
}

// 예매 완료 응답
export interface ReservationCompletionResponseDto {
  success: boolean;
  reservationId: number;
  reservationNumber: string;
  reservedSeats: ReservedSeatDto[];
  price: number;
  remainingPoints: number;
  reservedAt: string;
  message: string;
}

// 예매된 좌석 정보
export interface ReservedSeatDto {
  seatId: number;
  seatNumber: string;
  seatGrade: string;
  seatPrice: number;
}

// 예매 내역 응답
export interface ReservationHistoryResponseDto {
  reservationId: number;
  reservationNumber: string;
  performanceTitle: string;
  performanceHall: string;
  performanceDate: string;
  seatCount: number;
  seatNumbers: string[];
  price: number;
  status: string;
  reservedAt: string;
  cancellable: boolean;
}

// 예매 상세 정보
export interface ReservationDetailResponseDto {
  reservationId: number;
  reservationNumber: string;
  performance: PerformanceInfo;
  seats: ReservedSeatDto[];
  payment: PaymentInfo;
  reservation: ReservationInfo;
}

// 공연 정보
export interface PerformanceInfo {
  title: string;
  date: string;
  hall: string;
  runtime: number;
}

// 결제 정보 (예매 상세용)
export interface PaymentInfo {
  totalAmount: number;
  usedPoints: number;
  remainingPoints: number;
  usedCoupon?: CouponResponseDto;
}

// 예매 정보
export interface ReservationInfo {
  reservedAt: string;
  status: string;
  cancellable: boolean;
}

// 예매 취소 응답
export interface ReservationCancelResponseDto {
  success: boolean;
  message: string;
  refundAmount: number;
  cancelledAt: string;
}

// 결제 관련 타입들
export interface PaymentCalculationInfo {
  ticketPrice: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'point' | 'card' | 'bank';
  usedCoupon?: Coupon;
  userPoints?: number;
}

export interface ReservationRequest {
  performanceId: number;
  seatIds: number[];
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
  paymentInfo: PaymentCalculationInfo;
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
