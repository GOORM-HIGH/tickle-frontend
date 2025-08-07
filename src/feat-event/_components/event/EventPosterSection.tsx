import React from 'react';
import { Star } from 'lucide-react';
import styles from '../../styles/detail.module.css';

interface EventPosterSectionProps {
  posterUrl: string;
  performanceImg?: string;
  performanceTitle: string;
}

const EventPosterSection: React.FC<EventPosterSectionProps> = ({
  posterUrl,
  performanceImg,
  performanceTitle
}) => {
  return (
    <div className={styles['poster-section']}>
      <div className={styles['poster-container']}>
        <img 
          src={performanceImg || posterUrl} 
          alt={performanceTitle}
          className={styles['event-poster']}
          onError={(e) => {
            e.currentTarget.src = posterUrl;
          }}
        />
        <div className={styles['poster-overlay']}>
          <div className={styles['overlay-content']}>
            <Star size={24} className={styles['star-icon']} />
            <span>특별 이벤트</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPosterSection; 