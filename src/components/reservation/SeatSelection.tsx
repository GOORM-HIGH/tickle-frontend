import React, { useState, useEffect } from 'react';
import { Seat, SeatGrade } from '../../types/reservation';
import { reservationService } from '../../services/reservationService';
import './SeatSelection.css';

interface SeatSelectionProps {
  performanceId: number;
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  onSeatSelection: (seats: Seat[], preemptionToken: string) => void;
  onClose: () => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  performanceId,
  performanceTitle,
  performanceDate,
  venue,
  onSeatSelection,
  onClose
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [maxSeats, setMaxSeats] = useState(5);
  const [selectedCount, setSelectedCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [preempting, setPreempting] = useState(false);

  // 좌석 등급 정보
  const seatGrades: SeatGrade[] = [
    { name: 'VIP석', price: 120000, description: 'A-C열' },
    { name: '일반석', price: 80000, description: 'D-E열' }
  ];

  // 좌석 초기화
  useEffect(() => {
    initializeSeats();
  }, []);

  const initializeSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const numbers = Array.from({ length: 20 }, (_, i) => i + 1);
    const newSeats: Seat[] = [];

    rows.forEach(row => {
      numbers.forEach(number => {
        const seatId = `${row}${number}`;
        const isVIP = ['A', 'B', 'C'].includes(row);
        const price = isVIP ? 120000 : 80000;
        
        // 일부 좌석을 매진/선점 상태로 설정 (테스트용)
        const isOccupied = Math.random() < 0.3; // 30% 확률로 매진
        
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

    setSeats(newSeats);
    setLoading(false);
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      // 좌석 선택 해제
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      // 좌석 선택
      if (selectedSeats.length >= selectedCount) {
        alert(`최대 ${selectedCount}개의 좌석만 선택할 수 있습니다.`);
        return;
      }
      setSelectedSeats(prev => [...prev, { ...seat, isSelected: true }]);
    }
  };

  const handleCountChange = (count: number) => {
    setSelectedCount(count);
    setMaxSeats(count);
    // 선택된 좌석이 새로운 개수보다 많으면 초과분 제거
    if (selectedSeats.length > count) {
      setSelectedSeats(prev => prev.slice(0, count));
    }
  };

  const handleReservation = async () => {
    if (selectedSeats.length === 0) {
      alert('좌석을 선택해주세요.');
      return;
    }
    if (selectedSeats.length !== selectedCount) {
      alert(`선택된 좌석 수(${selectedSeats.length})와 관람 인원(${selectedCount})이 일치하지 않습니다.`);
      return;
    }

    setPreempting(true);
    
    try {
      // 좌석 선점 API 호출
      const preemptionRequest = {
        performanceId,
        seatIds: selectedSeats.map(seat => seat.id)
      };

      const preemptionResponse = await reservationService.preemptSeats(preemptionRequest);

      if (preemptionResponse.success) {
        // 선점 성공 - 결제 페이지로 이동
        onSeatSelection(selectedSeats, preemptionResponse.preemptionToken!);
      } else {
        // 선점 실패 - 실패한 좌석들 표시
        const unavailableSeatIds = preemptionResponse.unavailableSeatIds || [];
        const unavailableSeats = selectedSeats.filter(seat => 
          unavailableSeatIds.includes(seat.id)
        );
        
        const unavailableSeatNames = unavailableSeats.map(seat => 
          `${seat.row}열 ${seat.number}번`
        ).join(', ');

        alert(`다음 좌석들이 이미 선점되었습니다: ${unavailableSeatNames}\n다른 좌석을 선택해주세요.`);
        
        // 실패한 좌석들을 선택에서 제거하고 매진 상태로 변경
        setSelectedSeats(prev => prev.filter(seat => !unavailableSeatIds.includes(seat.id)));
        setSeats(prev => prev.map(seat => 
          unavailableSeatIds.includes(seat.id) 
            ? { ...seat, status: 'occupied' as const }
            : seat
        ));
      }
    } catch (error) {
      console.error('좌석 선점 실패:', error);
      alert('좌석 선점 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setPreempting(false);
    }
  };

  const getSeatStatusClass = (seat: Seat) => {
    if (seat.status === 'occupied') return 'seat-occupied';
    if (selectedSeats.some(s => s.id === seat.id)) return 'seat-selected';
    return 'seat-available';
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) {
    return <div className="loading">좌석 정보를 불러오는 중...</div>;
  }

  return (
    <div className="seat-selection">
      {/* 헤더 */}
      <div className="seat-selection-header">
        <button onClick={onClose} className="back-button">
          ← 공연 상세로 돌아가기
        </button>
        <h1>좌석 선택</h1>
        <div className="performance-info">
          {performanceTitle} | {performanceDate} | {venue}
        </div>
      </div>

      <div className="seat-selection-content">
        {/* 좌측: 좌석 배치도 */}
        <div className="seat-map-container">
          {/* 무대 */}
          <div className="stage">
            <span>STAGE (무대)</span>
          </div>

          {/* 좌석 배치도 */}
          <div className="seat-map">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(row => (
              <div key={row} className="seat-row">
                <div className="row-label">{row}</div>
                <div className="seat-numbers">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(number => {
                    const seat = seats.find(s => s.row === row && s.number === number);
                    if (!seat) return null;
                    
                    return (
                      <button
                        key={`${row}${number}`}
                        className={`seat ${getSeatStatusClass(seat)}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === 'occupied'}
                      >
                        {number}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 범례 */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-seat seat-available"></div>
              <span>선택가능</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat seat-selected"></div>
              <span>선택됨</span>
            </div>
            <div className="legend-item">
              <div className="legend-seat seat-occupied"></div>
              <span>선점/매진</span>
            </div>
          </div>
        </div>

        {/* 우측: 선택 정보 */}
        <div className="selection-sidebar">
          {/* 관람 인원 선택 */}
          <div className="section">
            <h3>관람 인원 선택</h3>
            <div className="count-selector">
              {[1, 2, 3, 4, 5].map(count => (
                <button
                  key={count}
                  className={`count-button ${selectedCount === count ? 'selected' : ''}`}
                  onClick={() => handleCountChange(count)}
                >
                  {count}명
                </button>
              ))}
            </div>
          </div>

          {/* 선택된 좌석 */}
          <div className="section">
            <h3>선택된 좌석</h3>
            {selectedSeats.length > 0 ? (
              <div className="selected-seats">
                {selectedSeats.map(seat => (
                  <div key={seat.id} className="selected-seat">
                    <span className="seat-info">{seat.row}열 {seat.number}번</span>
                    <span className="seat-grade">{seat.grade}</span>
                    <span className="seat-price">{seat.price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-seats">좌석을 선택해주세요.</p>
            )}
          </div>

          {/* 예매하기 버튼 */}
          <button
            className="reservation-button"
            onClick={handleReservation}
            disabled={selectedSeats.length === 0 || preempting}
          >
            {preempting ? '좌석 선점 중...' : '예매하기'}
          </button>

          {/* 좌석 등급별 가격 */}
          <div className="section">
            <h3>좌석 등급별 가격</h3>
            {seatGrades.map(grade => (
              <div key={grade.name} className="grade-info">
                <span className="grade-name">{grade.name} ({grade.description})</span>
                <span className="grade-price">{grade.price.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
