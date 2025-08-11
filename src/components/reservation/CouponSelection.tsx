import React, { useState, useEffect } from 'react';
import { SeatInfoResponseDto, Coupon, PaymentCalculationInfo, ReservationInfoResponseDto } from '../../types/reservation';
import { reservationService } from '../../services/reservationService';
import './CouponSelection.css';

interface CouponSelectionProps {
  selectedSeats: SeatInfoResponseDto[];
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  preemptionToken: string;
  onCouponSelection: (paymentInfo: PaymentCalculationInfo) => void;
  onBack: () => void;
}

const CouponSelection: React.FC<CouponSelectionProps> = ({
  selectedSeats,
  performanceTitle,
  performanceDate,
  venue,
  preemptionToken,
  onCouponSelection,
  onBack
}) => {
  const [paymentInfo, setPaymentInfo] = useState<ReservationInfoResponseDto | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'point' | 'card' | 'bank'>('point');
  const [remainingTime, setRemainingTime] = useState(300); // 5분 (300초)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 결제 정보 초기화
  useEffect(() => {
    initializePaymentInfo();
  }, [preemptionToken]);

  // 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('좌석 선점 시간이 만료되었습니다. 다시 선택해주세요.');
          onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onBack]);

  const initializePaymentInfo = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getPaymentInfo(preemptionToken);
      setPaymentInfo(data);
    } catch (error) {
      console.error('결제 정보 조회 실패:', error);
      setError('결제 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCouponSelect = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const calculateFinalPaymentInfo = (): PaymentCalculationInfo => {
    if (!paymentInfo) {
      return {
        ticketPrice: 0,
        discountAmount: 0,
        finalAmount: 0,
        paymentMethod,
        userPoints: 0
      };
    }

    let discountAmount = 0;

    if (selectedCoupon) {
      if (selectedCoupon.discountType === 'percentage') {
        discountAmount = Math.min(
          (paymentInfo.totalAmount * selectedCoupon.discountValue) / 100,
          selectedCoupon.maxDiscount || Infinity
        );
      } else {
        discountAmount = selectedCoupon.discountValue;
      }
    }

    const finalAmount = Math.max(0, paymentInfo.totalAmount - discountAmount);

    return {
      ticketPrice: paymentInfo.totalAmount,
      discountAmount,
      finalAmount,
      paymentMethod,
      usedCoupon: selectedCoupon || undefined,
      userPoints: paymentInfo.currentPoints
    };
  };

  const handlePayment = () => {
    const finalPaymentInfo = calculateFinalPaymentInfo();
    onCouponSelection(finalPaymentInfo);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const finalPaymentInfo = calculateFinalPaymentInfo();
  const hasEnoughPoints = paymentInfo && finalPaymentInfo.finalAmount <= paymentInfo.currentPoints;

  if (loading) {
    return <div className="loading">결제 정보를 불러오는 중...</div>;
  }

  if (error || !paymentInfo) {
    return <div className="error">{error || '결제 정보를 불러올 수 없습니다.'}</div>;
  }

  return (
    <div className="coupon-selection">
      {/* 헤더 */}
      <div className="coupon-selection-header">
        <button onClick={onBack} className="back-button">
          ← 좌석 선택으로 돌아가기
        </button>
        <h1>결제</h1>
        <div className="performance-info">
          {performanceTitle} | {performanceDate} | {venue}
        </div>
      </div>

      {/* 타이머 */}
      <div className="timer-banner">
        좌석 선점 시간: {formatTime(remainingTime)} 남음
      </div>

      <div className="coupon-selection-content">
        {/* 좌측: 쿠폰 선택 */}
        <div className="coupon-section">
          <h2>할인 및 혜택</h2>
          <div className="coupon-list">
            <h3>할인 쿠폰</h3>
            {paymentInfo.coupons && paymentInfo.coupons.length > 0 ? (
              paymentInfo.coupons.map(coupon => (
                <div key={coupon.couponId} className="coupon-item">
                  <label className="coupon-checkbox">
                    <input
                      type="radio"
                      name="coupon"
                      checked={selectedCoupon?.id === coupon.couponId}
                      onChange={() => handleCouponSelect({
                        id: coupon.couponId,
                        name: coupon.couponName,
                        discountType: 'percentage',
                        discountValue: coupon.couponRate,
                        minAmount: 0,
                        maxDiscount: undefined,
                        isUsed: false,
                        expiryDate: coupon.couponValid
                      })}
                    />
                    <span className="checkmark"></span>
                    <div className="coupon-info">
                      <span className="coupon-name">{coupon.couponName} (보유: 1장)</span>
                      <span className="coupon-description">
                        {coupon.couponRate}% 할인
                      </span>
                    </div>
                  </label>
                </div>
              ))
            ) : (
              <div className="no-coupons">
                <p>사용 가능한 쿠폰이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 선택 정보 */}
        <div className="selection-info">
          <h2>선택 정보</h2>
          
          {/* 선택된 좌석 */}
          <div className="selected-seats-box">
            <h3>선택된 좌석</h3>
            {paymentInfo.seats.map(seat => (
              <div key={seat.seatId} className="selected-seat">
                <span className="seat-info">{seat.seatNumber}</span>
                <span className="seat-grade">{seat.seatGrade}석</span>
                <span className="seat-price">{seat.seatPrice.toLocaleString()}원</span>
              </div>
            ))}
          </div>

          {/* 사용자 포인트 정보 */}
          <div className="points-info">
            <h3>보유 포인트</h3>
            <div className="points-detail">
              <span>사용 가능 포인트</span>
              <span className="points-amount">{paymentInfo.currentPoints.toLocaleString()}P</span>
            </div>
            <div className="points-detail">
              <span>포인트 충분 여부</span>
              <span className="points-amount">{paymentInfo.sufficientPoints ? '충분' : '부족'}</span>
            </div>
          </div>

          {/* 결제 금액 */}
          <div className="payment-summary">
            <div className="payment-item">
              <span>티켓 가격</span>
              <span>{finalPaymentInfo.ticketPrice.toLocaleString()}원</span>
            </div>
            {selectedCoupon && (
              <div className="payment-item discount">
                <span>할인 쿠폰 ({selectedCoupon.discountValue}%)</span>
                <span>-{finalPaymentInfo.discountAmount.toLocaleString()}원</span>
              </div>
            )}
            <div className="payment-item final">
              <span>최종 결제금액</span>
              <span>{finalPaymentInfo.finalAmount.toLocaleString()}원</span>
            </div>
          </div>

          {/* 포인트 부족 알림 */}
          {paymentMethod === 'point' && !paymentInfo.sufficientPoints && (
            <div className="point-warning">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">포인트 부족</span>
              <p className="warning-description">
                포인트로 결제하려면 {(finalPaymentInfo.finalAmount - paymentInfo.currentPoints).toLocaleString()}P가 더 필요합니다.
              </p>
              <button className="point-charge-button">포인트 충전하기</button>
            </div>
          )}

          {/* 결제하기 버튼 */}
          <button
            className="payment-button"
            onClick={handlePayment}
            disabled={remainingTime === 0 || (paymentMethod === 'point' && !paymentInfo.sufficientPoints)}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponSelection;
