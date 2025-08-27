import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Plus, Check } from 'lucide-react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import { ReceiptPopup } from '../../feat-mypage/components';
import { PointResponse, pointService } from '../../services/pointService';
import { useAuth } from '../../hooks/useAuth';
import '../../types/styles/mypage/carge.module.css';

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
  const { currentUser } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<PointResponse | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

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
      // 실제 포인트 충전 API 호출
      const request = {
        orderId: `order_${Date.now()}`,
        order_name: 'Tickle 포인트 충전',
        receipt_id: `receipt_${Date.now()}`,
        amount,
        username: currentUser?.nickname || '사용자',
        purchasedAt: new Date().toISOString()
      };

      console.log('포인트 충전 API 요청:', request);
      
      const result = await pointService.chargePoint(request);
      console.log('포인트 충전 API 응답:', result);
      
      // 영수증 데이터 설정
      setReceiptData(result);
      setShowReceipt(true);
      
      // 잔액 새로고침
      fetchBalance();
    } catch (error) {
      console.error('포인트 충전 실패:', error);
      alert('충전 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    navigate('/point/history');
  };

  // 포인트 잔액 조회
  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const balanceData = await pointService.getMyPointBalance();
      setCurrentBalance(balanceData.credit);
    } catch (error) {
      console.error('잔액 조회 실패:', error);
      // 에러 발생 시 기본값 설정
      setCurrentBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBalance();
  }, []);

  const handleBack = () => {
    navigate('/point/history');
  };

  return (
    <>
      <Header />
      <div className="pageContainer">
        {/* Header */}
        <div className="pageHeader">
          <button className="backButton" onClick={handleBack}>
            <ArrowLeft size={20} />
            뒤로가기
          </button>
          <h1 className="pageTitle">포인트 충전</h1>
        </div>

        {/* Current Balance */}
        <div className="balanceSection">
          <div className="balanceCard">
            <div className="balanceIcon">
              <Wallet size={24} />
            </div>
            <div className="balanceInfo">
              <span className="balanceLabel">현재 보유 포인트</span>
              <span className="balanceAmount">
                {balanceLoading ? (
                  <div className="loadingSpinner"></div>
                ) : (
                  `${currentBalance.toLocaleString()} P`
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Charge Amount Selection */}
        <div className="chargeSection">
          <h2 className="sectionTitle">충전 금액 선택</h2>
          
          {/* Preset Amounts */}
          <div className="amountGrid">
            {chargeAmounts.map((option) => (
              <div
                key={option.id}
                className={`amountCard ${selectedAmount === option.amount ? 'selected' : ''} ${option.isPopular ? 'popular' : ''}`}
                onClick={() => handleAmountSelect(option.amount)}
              >
                {option.isPopular && <div className="popularBadge">인기</div>}
                <div className="amountInfo">
                  <span className="amount">{option.amount.toLocaleString()}원</span>
                </div>
                {selectedAmount === option.amount && (
                  <div className="checkIcon">
                    <Check size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="customAmountSection">
            <h3 className="customTitle">직접 입력</h3>
            <div className="customInputWrapper">
              <input
                type="text"
                className="customAmountInput"
                placeholder="충전할 금액을 입력하세요 (최소 1,000원)"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
              <span className="inputSuffix">원</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="paymentSection">
          <h2 className="sectionTitle">결제 수단</h2>
          <div className="paymentMethods">
            <div className={`paymentMethod selected`}>
              <CreditCard size={20} />
              <span>신용카드</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="summarySection">
          <div className="summaryCard">
            <div className={`summaryRow total`}>
              <span>충전 금액</span>
              <span>{getTotalAmount().toLocaleString()}원</span>
            </div>
          </div>
        </div>

        {/* Charge Button */}
        <div className="chargeButtonSection">
          <button
            className={`chargeBtn ${getTotalAmount() >= 1000 ? 'active' : 'disabled'}`}
            onClick={handleCharge}
            disabled={getTotalAmount() < 1000 || isLoading}
          >
            {isLoading ? (
              <div className="loadingSpinner"></div>
            ) : (
              <>
                <Plus size={20} />
                {getTotalAmount().toLocaleString()}원 충전하기
              </>
            )}
          </button>
        </div>
      </div>
      <Footer />
      {showReceipt && receiptData && (
        <ReceiptPopup
          receiptData={receiptData}
          onClose={handleReceiptClose}
        />
      )}
    </>
  );
};
