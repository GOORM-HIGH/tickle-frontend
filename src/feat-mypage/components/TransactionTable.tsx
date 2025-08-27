import React from 'react';
import styles from '../../types/styles/mypage/history.module.css';
import { PointHistory } from '../types';

interface TransactionTableProps {
  history: PointHistory[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ history }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'charge_completed':
        return <span className={`${styles.statusTag} ${styles.chargeCompleted}`}>충전 완료</span>;
      case 'completed':
        return <span className={`${styles.statusTag} ${styles.completed}`}>결제 완료</span>;
      case 'cancelled':
        return <span className={`${styles.statusTag} ${styles.cancelled}`}>결제 취소</span>;
      default:
        return <span className={`${styles.statusTag} ${styles.completed}`}>결제 완료</span>;
    }
  };

  return (
    <div className={styles.transactionSection}>
      <div className={styles.transactionTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>예매일</div>
          <div className={styles.headerCell}>공연명</div>
          <div className={styles.headerCell}>공연장</div>
          <div className={styles.headerCell}>공연일</div>
          <div className={styles.headerCell}>가격</div>
          <div className={styles.headerCell}>상태</div>
        </div>
        <div className={styles.tableBody}>
          {history.length === 0 ? (
            <div className={styles.emptyState}>
              <p>내역이 없습니다.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <span className={styles.dateTime}>{formatDate(item.createdAt)}</span>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.eventName}>{item.description || '내역 없음'}</span>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.venueName}>{item.bankInfo || '정보 없음'}</span>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.eventDate}>{formatDate(item.createdAt)}</span>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.amount}>{item.amount.toLocaleString()}원</span>
                </div>
                <div className={styles.tableCell}>
                  {getStatusTag(item.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default TransactionTable; 