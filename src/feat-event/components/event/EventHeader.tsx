import React from 'react';
import { Heart, Share2, Clock as ClockIcon, TrendingUp, Award } from 'lucide-react';
import styles from '../../styles/detail.module.css';

interface EventHeaderProps {
  eventDetail: any;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
  eventMeta: any[];
}

export const EventHeader: React.FC<EventHeaderProps> = ({ 
  eventDetail, 
  isLiked, 
  onLike, 
  onShare, 
  eventMeta 
}) => {
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      ClockIcon,
      TrendingUp,
      Award
    };
    return iconMap[iconName] || ClockIcon;
  };

  return (
    <div className={styles['event-header']}>
      <div className={styles['header-top']}>
        {eventDetail.badge && (
          <div className={styles['event-status-badge']}>
            <div className={styles['badge-dot']}></div>
            {eventDetail.badge}
          </div>
        )}
        <div className={styles['header-actions']}>
          <button className={styles['action-btn']} onClick={onLike}>
            <Heart size={20} className={isLiked ? styles.liked : ''} />
            <span>{isLiked ? '좋아요 취소' : '좋아요'}</span>
          </button>
          <button className={styles['action-btn']} onClick={onShare}>
            <Share2 size={20} />
            <span>공유</span>
          </button>
        </div>
      </div>
      <h1 className={styles['event-main-title']}>{eventDetail.title}</h1>
      {eventDetail.description && (
        <p className={styles['event-description']}>{eventDetail.description}</p>
      )}
      <div className={styles['event-meta']}>
        {eventMeta.map((meta, index) => {
          const IconComponent = getIconComponent(meta.icon);
          return (
            <div key={index} className={styles['meta-item']}>
              <IconComponent size={16} />
              <span>{meta.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 