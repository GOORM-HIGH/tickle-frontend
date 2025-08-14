import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Plus, Check } from 'lucide-react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import { ReceiptPopup } from '../components';
import { PointResponse, pointService } from '../../services/pointService';
import { useAuth } from '../../hooks/useAuth';
import styles from '../styles/carge.module.css';

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

const PointChargePage: React.FC = () => {
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
      // TODO: 백엔드 API 호출
      console.log('충전 요청:', {
        amount: amount
      });
      
      // 실제 사용자 정보로 영수증 데이터 생성
      const receiptData: PointResponse = {
        username: currentUser?.nickname || '사용자',
        orderName: '신용카드',
        amount: amount,
        totalBalance: currentBalance + amount,
        purchasedAt: new Date().toISOString(),
        orderId: `order_${Date.now()}`,
        receiptId: `receipt_${Date.now()}`
      };
      
      setReceiptData(receiptData);
      setShowReceipt(true);
    } catch (error) {
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
      const balanceData = await pointService.getMyPointBalance();
      setCurrentBalance(balanceData.credit);
    } catch (error) {
      console.error('포인트 잔액 조회 실패:', error);
      setCurrentBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

  // 컴포넌트 마운트 시 잔액 조회
  React.useEffect(() => {
    fetchBalance();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Header />
      <div className={styles['point-charge-page']}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles['page-header']}>
            <button className={styles['back-btn']} onClick={handleBack}>
              <ArrowLeft size={20} />
              뒤로가기
            </button>
            <h1 className={styles['page-title']}>포인트 충전</h1>
          </div>

          {/* Current Balance */}
          <div className={styles['balance-section']}>
            <div className={styles['balance-card']}>
              <div className={styles['balance-icon']}>
                <Wallet size={24} />
              </div>
              <div className={styles['balance-info']}>
                <span className={styles['balance-label']}>현재 포인트</span>
                <span className={styles['balance-amount']}>
                  {balanceLoading ? (
                    <div className={styles['loading-spinner']}></div>
                  ) : (
                    `${currentBalance.toLocaleString()} P`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Charge Amount Selection */}
          <div className={styles['charge-section']}>
            <h2 className={styles['section-title']}>충전 금액 선택</h2>
            
            {/* Preset Amounts */}
            <div className={styles['amount-grid']}>
              {chargeAmounts.map((option) => (
                <div
                  key={option.id}
                  className={`${styles['amount-card']} ${selectedAmount === option.amount ? styles.selected : ''} ${option.isPopular ? styles.popular : ''}`}
                  onClick={() => handleAmountSelect(option.amount)}
                >
                  {option.isPopular && <div className={styles['popular-badge']}>인기</div>}
                  <div className={styles['amount-info']}>
                    <span className={styles.amount}>{option.amount.toLocaleString()}원</span>
                  </div>
                  {selectedAmount === option.amount && (
                    <div className={styles['check-icon']}>
                      <Check size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Amount */}
            <div className={styles['custom-amount-section']}>
              <h3 className={styles['custom-title']}>직접 입력</h3>
              <div className={styles['custom-input-wrapper']}>
                <input
                  type="text"
                  className={styles['custom-amount-input']}
                  placeholder="충전할 금액을 입력하세요 (최소 1,000원)"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                />
                <span className={styles['input-suffix']}>원</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className={styles['payment-section']}>
            <h2 className={styles['section-title']}>결제 수단</h2>
            <div className={styles['payment-methods']}>
              <div className={`${styles['payment-method']} ${styles.selected}`}>
                <CreditCard size={20} />
                <span>신용카드</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className={styles['summary-section']}>
            <div className={styles['summary-card']}>
              <div className={`${styles['summary-row']} ${styles.total}`}>
                <span>충전 금액</span>
                <span>{getTotalAmount().toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* Charge Button */}
          <div className={styles['charge-button-section']}>
            <button
              className={`${styles['charge-btn']} ${getTotalAmount() >= 1000 ? styles.active : styles.disabled}`}
              onClick={handleCharge}
              disabled={getTotalAmount() < 1000 || isLoading}
            >
              {isLoading ? (
                <div className={styles['loading-spinner']}></div>
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
      {showReceipt && receiptData && (
        <ReceiptPopup
          receiptData={receiptData}
          onClose={handleReceiptClose}
        />
      )}
    </>
  );
};

export default PointChargePage; 