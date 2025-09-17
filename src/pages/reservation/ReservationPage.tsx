import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import SeatSelection from '../../components/reservation/SeatSelection';
import CouponSelection from '../../components/reservation/CouponSelection';
import ReservationComplete from '../../components/reservation/ReservationComplete';
import { SeatInfoResponseDto, PaymentCalculationInfo, ReservationResponse } from '../../types/reservation';
import { reservationService } from '../../services/reservationService';
import { performanceApi, PerformanceDetailDto } from '../../services/performanceApi';
import { useTimeConversion } from '../../hooks/useTimeConversion';
import './ReservationPage.css';

type ReservationStep = 'seat-selection' | 'payment' | 'complete';

const ReservationPage: React.FC = () => {
  const { performanceId } = useParams<{ performanceId: string }>();
  const navigate = useNavigate();
  const { formatDate } = useTimeConversion();
  
  const [currentStep, setCurrentStep] = useState<ReservationStep>('seat-selection');
  const [selectedSeats, setSelectedSeats] = useState<SeatInfoResponseDto[]>([]);
  const [preemptionToken, setPreemptionToken] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentCalculationInfo | null>(null);
  const [reservationData, setReservationData] = useState<ReservationResponse | null>(null);
  const [performanceInfo, setPerformanceInfo] = useState({
    title: '',
    date: '',
    venue: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (performanceId) {
      loadPerformanceInfo();
    }
  }, [performanceId]);

  const loadPerformanceInfo = async () => {
    try {
      setLoading(true);
      const response = await performanceApi.getPerformanceDetail(parseInt(performanceId || '1'));
      
      if (response.data) {
        const performance = response.data;
        setPerformanceInfo({
          title: performance.title,
          date: formatDate(performance.date, 'full'),
          venue: performance.hallAddress
        });
      }
    } catch (error) {
      console.error('공연 정보 조회 실패:', error);
      setError('공연 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelection = (seats: SeatInfoResponseDto[], token: string) => {
    setSelectedSeats(seats);
    setPreemptionToken(token);
    setCurrentStep('payment');
  };

  const handleCouponSelection = async (paymentInfo: PaymentCalculationInfo) => {
    setPaymentInfo(paymentInfo);
    
    try {
      // 예매 완료 API 호출 (createReservation 대신 completeReservation 사용)
      const completionRequest = {
        preemptionToken: preemptionToken,
        totalAmount: paymentInfo.finalAmount,
        couponId: paymentInfo.usedCoupon?.id
      };

      const completionResponse = await reservationService.completeReservation(completionRequest);
      
      if (completionResponse.success) {
        // 예매 완료 성공 - 응답 데이터를 예매 데이터로 변환
        const reservationData: ReservationResponse = {
          reservationId: completionResponse.reservationId.toString(),
          reservationNumber: completionResponse.reservationNumber,
          performanceTitle: performanceInfo.title,
          performanceDate: performanceInfo.date,
          venue: performanceInfo.venue,
          seats: selectedSeats,
          paymentInfo: paymentInfo,
          reservator: '사용자', // 실제로는 인증된 사용자 정보 사용
          reservationDate: new Date().toISOString()
        };
        
        setReservationData(reservationData);
        setCurrentStep('complete');
      } else {
        alert(completionResponse.message || '예매 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('예매 완료 실패:', error);
      alert('예매 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleBackToSeatSelection = () => {
    setCurrentStep('seat-selection');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <div className="loading">공연 정보를 불러오는 중...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="error">
          {error}
          <button onClick={() => navigate(-1)} className="back-button">
            뒤로 가기
          </button>
        </div>
      </>
    );
  }

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
    <>
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
    </>
  );
};

export default ReservationPage;
