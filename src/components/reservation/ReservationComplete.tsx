import React from 'react';
import { ReservationResponse } from '../../types/reservation';
import './ReservationComplete.css';

interface ReservationCompleteProps {
  reservationData: ReservationResponse;
  onGoHome: () => void;
}

const ReservationComplete: React.FC<ReservationCompleteProps> = ({
  reservationData,
  onGoHome
}) => {
  return (
    <div className="reservation-complete">
      {/* 완료 메시지 */}
      <div className="completion-message">
        <div className="checkmark-icon">✅</div>
        <h1 className="completion-title">예매가 완료되었습니다!</h1>
        <p className="completion-subtitle">티켓 정보를 확인해주세요</p>
      </div>

      {/* 예매 티켓 정보 */}
      <div className="ticket-info-container">
        <div className="ticket-info-header">
          <span>예매번호: {reservationData.reservationNumber}</span>
        </div>
        <div className="ticket-info-content">
          <div className="info-row">
            <span className="info-label">공연명</span>
            <span className="info-value">{reservationData.performanceTitle}</span>
          </div>
          <div className="info-row">
            <span className="info-label">공연일시</span>
            <span className="info-value">{reservationData.performanceDate}</span>
          </div>
          <div className="info-row">
            <span className="info-label">공연장소</span>
            <span className="info-value">{reservationData.venue}</span>
          </div>
          <div className="info-row">
            <span className="info-label">좌석</span>
            <span className="info-value">
              {reservationData.seats.map(seat => `${seat.row}열 ${seat.number}번 (${seat.grade})`).join(', ')}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">결제금액</span>
            <span className="info-value amount">{reservationData.paymentInfo.finalAmount.toLocaleString()}원</span>
          </div>
          {reservationData.paymentInfo.usedCoupon && (
            <div className="info-row">
              <span className="info-label">할인혜택</span>
              <span className="info-value discount">
                {reservationData.paymentInfo.usedCoupon.discountValue}% 할인 쿠폰 적용 (-{reservationData.paymentInfo.discountAmount.toLocaleString()}원)
              </span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">결제방법</span>
            <span className="info-value">
              {reservationData.paymentInfo.paymentMethod === 'point' ? '포인트 결제' : 
               reservationData.paymentInfo.paymentMethod === 'card' ? '카드 결제' : '계좌이체'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">예매자</span>
            <span className="info-value">{reservationData.reservator}</span>
          </div>
          <div className="info-row">
            <span className="info-label">결제일시</span>
            <span className="info-value">{reservationData.reservationDate}</span>
          </div>
        </div>
      </div>

      {/* 안내사항 */}
      <div className="notice-container">
        <h3 className="notice-title">안내사항</h3>
        <ul className="notice-list">
          <li>공연 당일 신분증과 예매번호를 지참해주세요</li>
          <li>공연 시작 30분 전까지 입장 가능합니다</li>
          <li>티켓 변경/취소는 공연 3일 전까지만 가능합니다</li>
        </ul>
      </div>

      {/* 홈으로 돌아가기 버튼 */}
      <div className="home-button-container">
        <button className="home-button" onClick={onGoHome}>
          🏠 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default ReservationComplete;
