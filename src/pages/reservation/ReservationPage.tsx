import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import SeatSelection from '../../components/reservation/SeatSelection';
import CouponSelection from '../../components/reservation/CouponSelection';
import ReservationComplete from '../../components/reservation/ReservationComplete';
import { Seat, PaymentInfo, ReservationResponse } from '../../types/reservation';
import { reservationService } from '../../services/reservationService';
import './ReservationPage.css';

type ReservationStep = 'seat-selection' | 'payment' | 'complete';

const ReservationPage: React.FC = () => {
  const { performanceId } = useParams<{ performanceId: string }>();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<ReservationStep>('seat-selection');
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [preemptionToken, setPreemptionToken] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [reservationData, setReservationData] = useState<ReservationResponse | null>(null);
  const [performanceInfo, setPerformanceInfo] = useState({
    title: '뮤지컬 "레미제라블"',
    date: '2024.08.15 (목) 19:30',
    venue: '세종문화회관 대극장'
  });

  useEffect(() => {
    if (performanceId) {
      loadPerformanceInfo();
    }
  }, [performanceId]);

  const loadPerformanceInfo = async () => {
    // 실제로는 API에서 공연 정보를 가져와야 함
    // 여기서는 테스트용 데이터 사용
    setPerformanceInfo({
      title: '뮤지컬 "레미제라블"',
      date: '2024.08.15 (목) 19:30',
      venue: '세종문화회관 대극장'
    });
  };

  const handleSeatSelection = (seats: Seat[], token: string) => {
    setSelectedSeats(seats);
    setPreemptionToken(token);
    setCurrentStep('payment');
  };

  const handleCouponSelection = async (paymentInfo: PaymentInfo) => {
    setPaymentInfo(paymentInfo);
    
    try {
      // 예매 생성 API 호출
      const reservationRequest = {
        performanceId: parseInt(performanceId || '1'),
        seatIds: selectedSeats.map(seat => seat.id),
        couponId: paymentInfo.usedCoupon?.id,
        paymentMethod: paymentInfo.paymentMethod,
        preemptionToken: preemptionToken
      };

      const reservationResponse = await reservationService.createReservation(reservationRequest);
      setReservationData(reservationResponse);
      setCurrentStep('complete');
    } catch (error) {
      console.error('예매 생성 실패:', error);
      alert('예매 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleBackToSeatSelection = () => {
    setCurrentStep('seat-selection');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'seat-selection':
        return (
          <SeatSelection
            performanceId={parseInt(performanceId || '1')}
            performanceTitle={performanceInfo.title}
            performanceDate={performanceInfo.date}
            venue={performanceInfo.venue}
            onSeatSelection={handleSeatSelection}
            onClose={() => navigate(-1)}
          />
        );
      
      case 'payment':
        return (
          <CouponSelection
            selectedSeats={selectedSeats}
            performanceTitle={performanceInfo.title}
            performanceDate={performanceInfo.date}
            venue={performanceInfo.venue}
            preemptionToken={preemptionToken}
            onCouponSelection={handleCouponSelection}
            onBack={handleBackToSeatSelection}
          />
        );
      
      case 'complete':
        return reservationData ? (
          <ReservationComplete
            reservationData={reservationData}
            onGoHome={handleGoHome}
          />
        ) : (
          <div>예매 정보를 불러오는 중...</div>
        );
      
      default:
        return <div>잘못된 단계입니다.</div>;
    }
  };

  return (
    <Layout>
      <div className="reservation-page">
        {/* 진행 단계 표시 */}
        {currentStep !== 'complete' && (
          <div className="progress-indicator">
            <div className={`progress-step ${currentStep === 'seat-selection' ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">좌석 선택</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep === 'payment' ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">결제</div>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-number">3</div>
              <div className="step-label">예매 완료</div>
            </div>
          </div>
        )}

        {/* 현재 단계 렌더링 */}
        {renderCurrentStep()}
      </div>
    </Layout>
  );
};

export default ReservationPage;
