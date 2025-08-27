import React, { useState, useEffect } from 'react';
import { Check, Download, Share2, X, Receipt, CreditCard, User, Clock, Hash } from 'lucide-react';
import { PointResponse } from '../../../services/pointService.ts';
import styles from '../../../types/styles/mypage/history.module.css';

interface ReceiptPopupProps {
  receiptData: PointResponse;
  onClose: () => void;
}

const ReceiptPopup: React.FC<ReceiptPopupProps> = ({ receiptData, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setShowConfetti(true);
    
    // 3초 후 컨페티 효과 제거
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // 300ms 후에 onClose 호출하여 부드러운 애니메이션 제공
    setTimeout(onClose, 300);
  };

  const handleDownload = () => {
    // 영수증 다운로드 로직
    console.log('영수증 다운로드');
  };

  const handleShare = () => {
    // 공유 로직
    console.log('영수증 공유');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { date, time } = formatDate(receiptData.purchasedAt);

  return (
    <div className={`${styles['receipt-overlay']} ${isVisible ? styles.visible : ''}`}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className={styles.confettiContainer}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={styles.confetti}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      <div className={`${styles['receipt-modal']} ${isVisible ? styles.visible : ''}`}>
        {/* Success Animation */}
        <div className={styles.successAnimation}>
          <div className={styles.checkmark}>
            <Check size={48} />
          </div>
        </div>

        {/* Receipt Header */}
        <div className={styles.receiptHeader}>
          <div className={styles.receiptTitle}>
            <Receipt size={24} />
            <h2>결제 완료</h2>
          </div>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className={styles.receiptContent}>
          <div className={styles.receiptCard}>
            {/* Receipt Header */}
            <div className={styles.receiptCardHeader}>
              <div className={styles.companyInfo}>
                <h3>Tickle</h3>
                <p>포인트 충전 서비스</p>
              </div>
              <div className={styles.receiptNumber}>
                <span>영수증</span>
                <strong>#{receiptData.receiptId.slice(-8)}</strong>
              </div>
            </div>

            {/* Receipt Details */}
            <div className={styles.receiptDetails}>
              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <User size={16} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>주문자</span>
                  <span className={styles.detailValue}>{receiptData.username}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <CreditCard size={16} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>결제 수단</span>
                  <span className={styles.detailValue}>{receiptData.orderName}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <Receipt size={16} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>충전 금액</span>
                  <span className={`${styles.detailValue} ${styles.amount}`}>
                    {receiptData.amount.toLocaleString()} P
                  </span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <User size={16} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>보유 금액</span>
                  <span className={`${styles.detailValue} ${styles.balance}`}>
                    {receiptData.totalBalance.toLocaleString()} P
                  </span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <Clock size={16} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>결제 시간</span>
                  <span className={styles.detailValue}>{date} {time}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}>
                  <Hash size={16} />
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>주문번호</span>
                  <span className={styles.detailValue}>{receiptData.orderId}</span>
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className={styles.receiptFooter}>
              <div className={styles.footerMessage}>
                <p>🎉 포인트 충전이 완료되었습니다!</p>
                <p>Tickle과 함께 해주셔서 감사합니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.receiptActions}>
          <button className={styles.actionButton} onClick={handleDownload}>
            <Download size={16} />
            다운로드
          </button>
          <button className={styles.actionButton} onClick={handleShare}>
            <Share2 size={16} />
            공유하기
          </button>
          <button className={`${styles.actionButton} ${styles.primary}`} onClick={handleClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPopup; 