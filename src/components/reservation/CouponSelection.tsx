import React, { useState, useEffect } from 'react';
import { Seat, Coupon, PaymentInfo, UserPoints } from '../../types/reservation';
import { reservationService } from '../../services/reservationService';
import './CouponSelection.css';

interface CouponSelectionProps {
  selectedSeats: Seat[];
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  preemptionToken: string;
  onCouponSelection: (paymentInfo: PaymentInfo) => void;
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'point' | 'card' | 'bank'>('point');
  const [remainingTime, setRemainingTime] = useState(300); // 5분 (300초)
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);

  // 쿠폰 및 포인트 초기화
  useEffect(() => {
    initializeData();
  }, []);

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

  const initializeData = async () => {
    try {
      // 쿠폰과 포인트 정보를 동시에 로드
      const [couponsData, pointsData] = await Promise.all([
        reservationService.getCoupons(),
        reservationService.getUserPoints()
      ]);
      
      setCoupons(couponsData);
      setUserPoints(pointsData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponSelect = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const calculatePaymentInfo = (): PaymentInfo => {
    const ticketPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    let discountAmount = 0;

    if (selectedCoupon) {
      if (selectedCoupon.discountType === 'percentage') {
        discountAmount = Math.min(
          (ticketPrice * selectedCoupon.discountValue) / 100,
          selectedCoupon.maxDiscount || Infinity
        );
      } else {
        discountAmount = selectedCoupon.discountValue;
      }
    }

    const finalAmount = Math.max(0, ticketPrice - discountAmount);

    return {
      ticketPrice,
      discountAmount,
      finalAmount,
      paymentMethod,
      usedCoupon: selectedCoupon || undefined,
      userPoints: userPoints?.availablePoints
    };
  };

  const handlePayment = () => {
    const paymentInfo = calculatePaymentInfo();
    onCouponSelection(paymentInfo);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const paymentInfo = calculatePaymentInfo();
  const hasEnoughPoints = userPoints && paymentInfo.finalAmount <= userPoints.availablePoints;

  if (loading) {
    return <div className="loading">결제 정보를 불러오는 중...</div>;
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
            {coupons.map(coupon => (
              <div key={coupon.id} className="coupon-item">
                <label className="coupon-checkbox">
                  <input
                    type="radio"
                    name="coupon"
                    checked={selectedCoupon?.id === coupon.id}
                    onChange={() => handleCouponSelect(coupon)}
                  />
                  <span className="checkmark"></span>
                  <div className="coupon-info">
                    <span className="coupon-name">{coupon.name} (보유: 1장)</span>
                    <span className="coupon-description">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% 할인` 
                        : `${coupon.discountValue.toLocaleString()}원 할인`}
                    </span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 선택 정보 */}
        <div className="selection-info">
          <h2>선택 정보</h2>
          
          {/* 선택된 좌석 */}
          <div className="selected-seats-box">
            <h3>선택된 좌석</h3>
            {selectedSeats.map(seat => (
              <div key={seat.id} className="selected-seat">
                <span className="seat-info">{seat.row}열 {seat.number}번</span>
                <span className="seat-grade">{seat.grade}</span>
                <span className="seat-price">{seat.price.toLocaleString()}원</span>
              </div>
            ))}
          </div>

          {/* 사용자 포인트 정보 */}
          {userPoints && (
            <div className="points-info">
              <h3>보유 포인트</h3>
              <div className="points-detail">
                <span>사용 가능 포인트</span>
                <span className="points-amount">{userPoints.availablePoints.toLocaleString()}P</span>
              </div>
              <div className="points-detail">
                <span>총 포인트</span>
                <span className="points-amount">{userPoints.totalPoints.toLocaleString()}P</span>
              </div>
            </div>
          )}

          {/* 결제 금액 */}
          <div className="payment-summary">
            <div className="payment-item">
              <span>티켓 가격</span>
              <span>{paymentInfo.ticketPrice.toLocaleString()}원</span>
            </div>
            {selectedCoupon && (
              <div className="payment-item discount">
                <span>할인 쿠폰 ({selectedCoupon.discountValue}%)</span>
                <span>-{paymentInfo.discountAmount.toLocaleString()}원</span>
              </div>
            )}
            <div className="payment-item final">
              <span>최종 결제금액</span>
              <span>{paymentInfo.finalAmount.toLocaleString()}원</span>
            </div>
          </div>

          {/* 포인트 부족 알림 */}
          {paymentMethod === 'point' && userPoints && !hasEnoughPoints && (
            <div className="point-warning">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">포인트 부족</span>
              <p className="warning-description">
                포인트로 결제하려면 {(paymentInfo.finalAmount - userPoints.availablePoints).toLocaleString()}P가 더 필요합니다.
              </p>
              <button className="point-charge-button">포인트 충전하기</button>
            </div>
          )}

          {/* 결제하기 버튼 */}
          <button
            className="payment-button"
            onClick={handlePayment}
            disabled={remainingTime === 0 || (paymentMethod === 'point' && !hasEnoughPoints)}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponSelection;
