import React from 'react';
import { Target, Zap, Gift, Ticket, ArrowLeft } from 'lucide-react';
import styles from '../../styles/detail.module.css';

interface EventDetailsProps {
  eventDetail: any;
  eventRules: any[];
  onApply: () => void;
  onBackToList: () => void;
  loading?: boolean;
  statusId?: number;
  eventStatusName?: string;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ 
  eventDetail, 
  eventRules, 
  onApply, 
  onBackToList, 
  loading = false, 
  statusId, 
  eventStatusName 
}) => {
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Target,
      Zap,
      Gift
    };
    return iconMap[iconName] || Target;
  };

  const eventInfoItems = [
    { label: '장소', value: eventDetail.performancePlace },
    { label: '공연기간', value: eventDetail.performanceDate },
    { label: '공연시간', value: eventDetail.performanceRuntime },
    { label: '이벤트 티켓 좌석', value: eventDetail.seatNumber },
    { label: '이벤트 티켓 좌석 등급', value: eventDetail.seatGrade },
    { label: '이벤트 응모 가격', value: eventDetail.perPrice + 'P', isHighlight: true }
  ];

  return (
    <div className={styles['right-column']}>
      <div className={styles['event-rules']}>
        <h4>이벤트 규칙</h4>
        <div className={styles['rules-list']}>
          {eventRules.map((rule, index) => {
            const IconComponent = getIconComponent(rule.icon);
            return (
              <div key={index} className={styles['rule-item']}>
                <IconComponent size={16} />
                <span>{rule.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles['details-section']}>
        <div className={styles['section-header']}>
          <h3>이벤트 상세 정보</h3>
        </div>
        
        <div className={styles['event-info']}>
          {eventInfoItems.map((item, index) => (
            <div 
              key={index} 
              className={`${styles['info-item']} ${item.isHighlight ? styles.highlight : ''}`}
            >
              <span className={styles['info-label']}>{item.label}</span>
              <span className={`${styles['info-value']} ${item.isHighlight ? styles.price : ''}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className={styles['action-buttons']}>
          {statusId === 6 || eventStatusName === '이벤트 완료' ? (
            <button className={`${styles.btn} ${styles['btn-disabled']}`} disabled>
              <Ticket size={20} />
              종료된 이벤트
            </button>
          ) : statusId === 4 || eventStatusName === '이벤트 예정' ? (
            <button className={`${styles.btn} ${styles['btn-scheduled']}`} disabled>
              <Ticket size={20} />
              이벤트 예정
            </button>
          ) : (
            <button className={`${styles.btn} ${styles['btn-primary']}`} onClick={onApply} disabled={loading}>
              <Ticket size={20} />
              {loading ? '응모 중...' : '응모하기'}
            </button>
          )}
          <button className={`${styles.btn} ${styles['btn-secondary']}`} onClick={onBackToList} disabled={loading}>
            <ArrowLeft size={20} />
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
}; 