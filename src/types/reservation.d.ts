type ReservationHistoryResponse = {
  reservationId: number;
  reservationNumber: string;
  performanceTitle: string;
  performanceHall: string;
  performanceDate: string; // ISO
  seatCount: number;
  seatNumbers: string[];
  price: number;
  status: "예매 결제" | "예매 취소"; // 서버 값과 일치 필수
  reservedAt: string; // ISO
  cancellable: boolean;
};
