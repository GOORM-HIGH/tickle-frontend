export interface Reservation {
  reservationId: number;
  performanceId: number;
  performanceTitle: string;
  performanceDate: string;
  reservationDate: string;
  hasJoinedChat: boolean;
  chatRoomId?: number;
}
