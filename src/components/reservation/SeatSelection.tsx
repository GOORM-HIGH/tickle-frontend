import React, { useState, useEffect } from 'react';
import { SeatInfoResponseDto, HallTypeAndSeatInfoResponseDto } from '../../types/reservation';
import { reservationService } from '../../services/reservationService';
import { generateSeatLayout, getSeatGradeColor, getSeatStatusStyle, HALL_SEAT_CONFIG } from '../../utils/seatLayoutUtils';
import './SeatSelection.css';

interface SeatSelectionProps {
  performanceId: number;
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  onSeatSelection: (seats: SeatInfoResponseDto[], preemptionToken: string) => void;
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
  const [seatData, setSeatData] = useState<HallTypeAndSeatInfoResponseDto | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SeatInfoResponseDto[]>([]);
  const [selectedCount, setSelectedCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [preempting, setPreempting] = useState(false);

  // 좌석 정보 초기화
  useEffect(() => {
    initializeSeats();
  }, [performanceId]);

  const initializeSeats = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getSeats(performanceId);
      setSeatData(data);
    } catch (error) {
      console.error('좌석 정보 조회 실패:', error);
      alert('좌석 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 선점 실패 후 좌석 상태 업데이트
  const refreshSeatStatus = async () => {
    try {
      const data = await reservationService.getSeats(performanceId);
      setSeatData(data);
    } catch (error) {
      console.error('좌석 상태 업데이트 실패:', error);
    }
  };

  const handleSeatClick = (seat: SeatInfoResponseDto) => {
    if (seat.status !== 'available') return;

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
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleCountChange = (count: number) => {
    setSelectedCount(count);
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
      // 좌석 선점 API 호출 - seatId (숫자) 사용
      const preemptionRequest = {
        performanceId,
        seatIds: selectedSeats.map(seat => parseInt(seat.id)) // seatId를 숫자로 변환
      };

      const preemptionResponse = await reservationService.preemptSeats(preemptionRequest);

      if (preemptionResponse.success) {
        // 선점 성공 - 결제 페이지로 이동
        onSeatSelection(selectedSeats, preemptionResponse.preemptionToken!);
      } else {
        // 선점 실패 - 실패한 좌석들 표시
        const unavailableSeatIds = preemptionResponse.unavailableSeatIds || [];
        const unavailableSeats = selectedSeats.filter(seat => 
          unavailableSeatIds.includes(parseInt(seat.id)) // seatId를 숫자로 비교
        );
        
        const unavailableSeatNames = unavailableSeats.map(seat => 
          `${seat.row}열 ${seat.number}번`
        ).join(', ');

        alert(`다음 좌석들이 이미 선점되었습니다: ${unavailableSeatNames}\n다른 좌석을 선택해주세요.`);
        
        // 실패한 좌석들을 선택에서 제거
        setSelectedSeats(prev => prev.filter(seat => !unavailableSeatIds.includes(parseInt(seat.id))));
        
        // 좌석 상태를 다시 조회하여 최신 상태 반영
        await refreshSeatStatus();
      }
    } catch (error) {
      console.error('좌석 선점 실패:', error);
      
      // 에러 타입에 따른 구체적인 메시지 표시
      let errorMessage = '좌석 선점 중 오류가 발생했습니다. 다시 시도해주세요.';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
        } else if (error.message.includes('403')) {
          errorMessage = '권한이 없습니다.';
        } else if (error.message.includes('404')) {
          errorMessage = '공연 정보를 찾을 수 없습니다.';
        } else if (error.message.includes('409')) {
          errorMessage = '이미 선점된 좌석이 포함되어 있습니다.';
        } else if (error.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('Network Error')) {
          errorMessage = '네트워크 연결을 확인해주세요.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setPreempting(false);
    }
  };

  const getSeatStatusClass = (seat: SeatInfoResponseDto) => {
    if (seat.status === 'occupied' || seat.status === 'reserved') return 'seat-occupied';
    if (selectedSeats.some(s => s.id === seat.id)) return 'seat-selected';
    return 'seat-available';
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) {
    return <div className="loading">좌석 정보를 불러오는 중...</div>;
  }

  if (!seatData) {
    return <div className="error">좌석 정보를 불러올 수 없습니다.</div>;
  }

  const seatLayout = generateSeatLayout(seatData.hallType, seatData.seats);
  
  const hallConfig = HALL_SEAT_CONFIG[seatData.hallType];

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
        <div className="hall-type-info">
          공연장 타입: {seatData.hallType}타입
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
            {Object.entries(seatLayout).map(([grade, gradeData]) => {
              return (
                <div key={grade} className="seat-grade-section">
                  <div className="grade-header" style={{ backgroundColor: getSeatGradeColor(grade as any) }}>
                    {grade}석 ({gradeData.price.toLocaleString()}원)
                  </div>
                  {gradeData.seats.map((rowSeats, rowIndex) => {
                    return (
                      <div key={`${grade}-${rowIndex}`} className="seat-row">
                        <div className="row-label">{gradeData.rows[rowIndex]}</div>
                        <div className="seat-numbers">
                          {rowSeats.map(seat => (
                            <button
                              key={seat.id}
                              className={`seat ${getSeatStatusClass(seat)}`}
                              onClick={() => handleSeatClick(seat)}
                              disabled={seat.status === 'occupied' || seat.status === 'reserved'}
                              style={{
                                ...getSeatStatusStyle(seat.status),
                                border: selectedSeats.some(s => s.id === seat.id) ? '3px solid #3498DB' : undefined
                              }}
                            >
                              {seat.number}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
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
                    <span className="seat-grade">{seat.grade}석</span>
                    <span className="seat-price">{seat.price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-seats">좌석을 선택해주세요.</p>
            )}
          </div>

          {/* 총 금액 */}
          {selectedSeats.length > 0 && (
            <div className="section">
              <h3>총 금액</h3>
              <div className="total-price">
                {totalPrice.toLocaleString()}원
              </div>
            </div>
          )}

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
            {Object.entries(hallConfig).map(([grade, config]) => (
              <div key={grade} className="grade-info">
                <span className="grade-name">
                  {grade}석 ({config.rows.join(', ')}열)
                </span>
                <span className="grade-price">{config.price.toLocaleString()}원</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
