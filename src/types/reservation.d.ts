// src/types/reservation.d.ts  (전역 타입, 어떤 export/import도 쓰지 말 것)
type ReservationHistoryResponse = {
  reservationId: number;
  reservationNumber: string;
  performanceTitle: string;
  performanceHall: string;
  performanceDate: string;
  seatCount: number;
  seatNumbers: string[];
  price: number;
  status: "예매 결제" | "예매 취소";
  reservedAt: string;
  cancellable: boolean;
};
