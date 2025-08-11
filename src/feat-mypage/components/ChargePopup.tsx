import React, { useState } from 'react';
import { pointService, PointResponse } from '../../services/pointService';
import { Bootpay } from '@bootpay/client-js';
import styles from '../styles/history.module.css';

interface ChargePopupProps {
  currentBalance: number;
  onClose: () => void;
  onReceipt: (receiptData: PointResponse) => void;
}

const ChargePopup: React.FC<ChargePopupProps> = ({
  currentBalance,
  onClose,
  onReceipt
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('토스');
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

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleCharge = async () => {
    const amount = selectedAmount || parseInt(customAmount) || 0;
    
    if (amount < 1000) {
      alert('최소 충전 금액은 1,000원입니다.');
      return;
    }

    setIsLoading(true);
    try {
      const config = await pointService.getBootpayConfig();

      console.log("✅ Bootpay 라이브러리 확인됨:", Bootpay);

      const paymentData = {
        application_id: config.appId,
        price: amount,
        order_name: "Tickle 포인트 충전",
        order_id: config.orderId,
        pg: "토스",
        method: "토스",
        user: {
          username: config.username,
          email: config.email,
          phone: config.phone.replace(/[^0-9]/g, '')
        },
        items: [{
          id: "tickle_point",
          name: "Tickle 포인트",
          qty: 1,
          price: amount
        }],
        extra: {
          open_type: "iframe",
          card_quota: [],
          separately_confirmed: true,
          display_error_result: true
        }
      };

      const response = await Bootpay.requestPayment(paymentData);

      if (response.event === 'confirm') {
        const confirmRes = await Bootpay.confirm();
        if (confirmRes.event === 'done') {
          await sendChargeToServer(confirmRes.data);
        }
      } else if (response.event === 'done') {
        await sendChargeToServer(response.data);
      }

    } catch (err: any) {
      alert("결제 실패: " + (err?.error_message || err?.message || "알 수 없는 오류"));
    } finally {
      setIsLoading(false);
    }
  };

  const sendChargeToServer = async (data: any) => {
    try {
      const result = await pointService.chargePoint({
        orderId: data.order_id,
        order_name: data.order_name,
        receipt_id: data.receipt_id,
        amount: data.price,
        username: data.username,
        purchasedAt: data.purchasedAt
      });

      console.log("결제 서버 전송 데이터:", {
        orderId: data.order_id,
        amount: data.price,
        username: data.username,
        purchasedAt: data.purchasedAt
      });

      // onReceipt 호출하여 영수증 팝업 표시
      onReceipt(result);
      onClose();

    } catch (error) {
      alert("⚠️ 결제는 완료되었지만 포인트 적립에 실패했습니다.");
    }
  };

  const getDisplayAmount = () => {
    return selectedAmount || parseInt(customAmount) || 0;
  };

  return (
    <div className={styles['charge-popup-overlay']}>
      <div className={styles['charge-popup']}>
        <div className={styles['popup-header']}>
          <h2>포인트 충전</h2>
          <button className={styles['close-btn']} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles['popup-content']}>
          <div className={styles['current-balance']}>
            <span className={styles['balance-label']}>현재 포인트</span>
            <span className={styles['balance-amount']}>{currentBalance.toLocaleString()} P</span>
          </div>
          
          <div className={styles['charge-options']}>
            <h3>충전 금액 선택</h3>
            <div className={styles['amount-grid']}>
              {[10000, 30000, 50000, 100000, 200000, 500000].map((amount) => (
                <div
                  key={amount}
                  className={`${styles['amount-option']} ${selectedAmount === amount ? styles.selected : ''}`}
                  onClick={() => handleAmountSelect(amount)}
                >
                  {amount.toLocaleString()}원
                </div>
              ))}
            </div>
            
            <div className={styles['custom-amount']}>
              <h4>직접 입력</h4>
              <input
                type="text"
                placeholder="충전할 금액을 입력하세요 (최소 1,000원)"
                className={styles['amount-input']}
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
            </div>
          </div>
          
          <div className={styles['payment-method']}>
            <h3>결제 수단</h3>
            <div className={styles['method-grid']}>
              {['토스'].map((method) => (
                <div
                  key={method}
                  className={`${styles['method-option']} ${selectedPaymentMethod === method ? styles.selected : ''}`}
                  onClick={() => handlePaymentMethodSelect(method)}
                >
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles['charge-summary']}>
            <div className={styles['summary-row']}>
              <span>충전 금액</span>
              <span>{getDisplayAmount().toLocaleString()}원</span>
            </div>
          </div>
          
          <button 
            className={styles['charge-button']}
            onClick={handleCharge}
            disabled={getDisplayAmount() < 1000 || isLoading}
          >
            {isLoading ? '충전 중...' : '충전하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChargePopup;