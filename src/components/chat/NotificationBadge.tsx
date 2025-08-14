import React, { useEffect, useState } from 'react';

interface Props {
  count: number;
  maxCount?: number;
  showAnimation?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const NotificationBadge: React.FC<Props> = ({
  count,
  maxCount = 99,
  showAnimation = true,
  size = 'medium'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setIsVisible(true);
      if (showAnimation) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    } else {
      setIsVisible(false);
    }
  }, [count, showAnimation]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: '16px',
          height: '16px',
          fontSize: '10px',
          minWidth: '16px'
        };
      case 'large':
        return {
          width: '28px',
          height: '28px',
          fontSize: '14px',
          minWidth: '28px'
        };
      default: // medium
        return {
          width: '20px',
          height: '20px',
          fontSize: '12px',
          minWidth: '20px'
        };
    }
  };

  if (!isVisible) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div
      style={{
        position: 'absolute',
        top: '-6px',
        right: '-6px',
        backgroundColor: '#dc3545',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        zIndex: 1000,
        ...getSizeStyles(),
        transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)',
        animation: isAnimating ? 'pulse 0.6s ease-in-out' : 'none'
      }}
    >
      {displayCount}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}; 