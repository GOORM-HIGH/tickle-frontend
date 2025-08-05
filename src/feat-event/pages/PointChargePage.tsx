import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Plus, Check } from 'lucide-react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import '../styles/PointChargePage.css';

interface ChargeAmount {
  id: number;
  amount: number;
  bonus: number;
  isPopular?: boolean;
}

const chargeAmounts: ChargeAmount[] = [
  { id: 1, amount: 10000, bonus: 0 },
  { id: 2, amount: 30000, bonus: 0, isPopular: true },
  { id: 3, amount: 50000, bonus: 0 },
  { id: 4, amount: 100000, bonus: 0 },
  { id: 5, amount: 200000, bonus: 0 },
  { id: 6, amount: 500000, bonus: 0 },
];

export const PointChargePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getTotalAmount = () => {
    if (customAmount) {
      return parseInt(customAmount) || 0;
    }
    if (selectedAmount) {
      return selectedAmount;
    }
    return 0;
  };

  const handleCharge = async () => {
    const amount = getTotalAmount();
    if (amount < 1000) {
      alert('최소 충전 금액은 1,000원입니다.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: 백엔드 API 호출
      console.log('충전 요청:', {
        amount: amount
      });
      
      // 임시로 성공 처리
      setTimeout(() => {
        alert('포인트 충전이 완료되었습니다!');
        navigate('/point/history');
      }, 1000);
    } catch (error) {
      alert('충전 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Header />
      <div className="point-charge-page">
        <div className="container">
          {/* Header */}
          <div className="page-header">
            <button className="back-btn" onClick={handleBack}>
              <ArrowLeft size={20} />
              뒤로가기
            </button>
            <h1 className="page-title">포인트 충전</h1>
          </div>

          {/* Current Balance */}
          <div className="balance-section">
            <div className="balance-card">
              <div className="balance-icon">
                <Wallet size={24} />
              </div>
              <div className="balance-info">
                <span className="balance-label">현재 포인트</span>
                <span className="balance-amount">125,000 P</span>
              </div>
            </div>
          </div>

          {/* Charge Amount Selection */}
          <div className="charge-section">
            <h2 className="section-title">충전 금액 선택</h2>
            
            {/* Preset Amounts */}
            <div className="amount-grid">
              {chargeAmounts.map((option) => (
                <div
                  key={option.id}
                  className={`amount-card ${selectedAmount === option.amount ? 'selected' : ''} ${option.isPopular ? 'popular' : ''}`}
                  onClick={() => handleAmountSelect(option.amount)}
                >
                  {option.isPopular && <div className="popular-badge">인기</div>}
                  <div className="amount-info">
                    <span className="amount">{option.amount.toLocaleString()}원</span>
                  </div>
                  {selectedAmount === option.amount && (
                    <div className="check-icon">
                      <Check size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="custom-amount-section">
              <h3 className="custom-title">직접 입력</h3>
              <div className="custom-input-wrapper">
                <input
                  type="text"
                  className="custom-amount-input"
                  placeholder="충전할 금액을 입력하세요 (최소 1,000원)"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                />
                <span className="input-suffix">원</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-section">
            <h2 className="section-title">결제 수단</h2>
            <div className="payment-methods">
              <div className="payment-method selected">
                <CreditCard size={20} />
                <span>신용카드</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-section">
            <div className="summary-card">
              <div className="summary-row total">
                <span>충전 금액</span>
                <span>{getTotalAmount().toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* Charge Button */}
          <div className="charge-button-section">
            <button
              className={`charge-btn ${getTotalAmount() >= 1000 ? 'active' : 'disabled'}`}
              onClick={handleCharge}
              disabled={getTotalAmount() < 1000 || isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Plus size={20} />
                  {getTotalAmount().toLocaleString()}원 충전하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}; 