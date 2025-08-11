import { HallType, SeatGradeType, SeatInfoResponseDto, SeatResponseDto } from '../types/reservation';

// 백엔드 응답을 프론트엔드 형식으로 변환
export const mapSeatResponseToSeatInfo = (seatResponse: SeatResponseDto): SeatInfoResponseDto => {
  // seatNumber에서 row와 number 추출 (예: 'A01' -> row: 'A', number: 1)
  const row = seatResponse.seatNumber.charAt(0);
  const number = parseInt(seatResponse.seatNumber.slice(1));
  
  // statusId를 status로 변환
  const getStatusFromStatusId = (statusId: number): 'available' | 'occupied' | 'reserved' => {
    switch (statusId) {
      case 11: return 'available';
      case 12: return 'occupied';
      case 13: return 'reserved';
      default: return 'available';
    }
  };

  return {
    id: seatResponse.seatId.toString(), // seatId를 문자열로 변환하여 id로 사용
    row,
    number,
    grade: seatResponse.seatGrade as SeatGradeType,
    price: seatResponse.seatPrice,
    status: getStatusFromStatusId(seatResponse.statusId)
  };
};

// 공연장 타입별 좌석 정보
export const HALL_SEAT_CONFIG = {
  A: {
    VIP: { rows: ['A', 'B'], price: 120000 },
    R: { rows: ['C', 'D', 'E', 'F'], price: 90000 }
  },
  B: {
    VIP: { rows: ['A', 'B', 'C'], price: 120000 },
    R: { rows: ['D', 'E', 'F'], price: 90000 },
    S: { rows: ['G', 'H', 'I'], price: 70000 }
  }
} as const;

// 공연장 타입별 좌석 배치도 생성
export const generateSeatLayout = (hallType: HallType, seats: SeatResponseDto[]) => {
  const config = HALL_SEAT_CONFIG[hallType];
  
  // 백엔드 응답을 프론트엔드 형식으로 변환
  const mappedSeats = seats.map(mapSeatResponseToSeatInfo);
  
  // seatNumber로 매핑 (A01, A02 등)
  const seatMap = new Map(mappedSeats.map(seat => [seat.row + String(seat.number).padStart(2, '0'), seat]));
  
  const layout: { [grade in SeatGradeType]?: { rows: string[], price: number, seats: SeatInfoResponseDto[][] } } = {};
  
  // 각 등급별로 좌석 그룹화
  Object.entries(config).forEach(([grade, gradeConfig]) => {
    const gradeSeats: SeatInfoResponseDto[][] = [];
    
    gradeConfig.rows.forEach((row: string) => {
      const rowSeats: SeatInfoResponseDto[] = [];
      for (let number = 1; number <= 20; number++) {
        const seatNumber = `${row}${String(number).padStart(2, '0')}`; // 'A01', 'A02' 형식
        const seat = seatMap.get(seatNumber);
        if (seat) {
          rowSeats.push(seat);
        }
      }
      if (rowSeats.length > 0) {
        gradeSeats.push(rowSeats);
      }
    });
    
    layout[grade as SeatGradeType] = {
      rows: gradeConfig.rows,
      price: gradeConfig.price,
      seats: gradeSeats
    };
  });
  
  return layout;
};

// 좌석 등급별 색상
export const getSeatGradeColor = (grade: SeatGradeType): string => {
  switch (grade) {
    case 'VIP':
      return '#FFD700'; // 골드
    case 'R':
      return '#FF6B6B'; // 빨강
    case 'S':
      return '#4ECDC4'; // 청록
    default:
      return '#95A5A6'; // 회색
  }
};

// 좌석 상태별 스타일 (이미지에 맞게 수정)
export const getSeatStatusStyle = (status: string): { backgroundColor: string; cursor: string } => {
  switch (status) {
    case 'available':
      return { backgroundColor: '#FFFFFF', cursor: 'pointer' }; // 흰색 (선택가능)
    case 'occupied':
      return { backgroundColor: '#CCCCCC', cursor: 'not-allowed' }; // 회색 (선점/매진)
    case 'reserved':
      return { backgroundColor: '#CCCCCC', cursor: 'not-allowed' }; // 회색 (선점/매진)
    case 'selected':
      return { backgroundColor: '#007BFF', cursor: 'pointer' }; // 파란색 (선택됨)
    default:
      return { backgroundColor: '#95A5A6', cursor: 'not-allowed' };
  }
};
