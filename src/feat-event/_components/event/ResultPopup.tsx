import React, { useState, useEffect } from 'react';
import styles from '../../styles/detail.module.css';

interface ResultPopupProps {
  isVisible: boolean;
  isWinner: boolean;
  message: string;
  onClose: () => void;
}

export const ResultPopup: React.FC<ResultPopupProps> = ({ isVisible, isWinner, message, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isVisible) {
      if (isWinner) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 2000);
      }
    }
  }, [isVisible, isWinner]);

  if (!isVisible) return null;

  return (
    <div className={styles['result-popup-overlay']}>
      {/* Confetti for winners */}
      {showConfetti && (
        <div className={styles['confetti-container']}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={styles.confetti}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 6)]
              }}
            />
          ))}
        </div>
      )}

      {/* Sparkles for non-winners */}
      {showSparkles && (
        <div className={styles['sparkles-container']}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={styles.sparkle}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 1}s`
              }}
            />
          ))}
        </div>
      )}

      <div className={`${styles['result-popup']} ${isWinner ? styles.winner : styles.loser}`}>
        <div className={styles['result-content']}>
          {/* Animated background */}
          <div className={`${styles['result-bg']} ${isWinner ? styles['winner-bg'] : styles['loser-bg']}`}>
            <div className={styles['bg-pattern']}></div>
          </div>

          {/* Main content */}
          <div className={styles['result-main']}>
            <div className={`${styles['result-icon']} ${isWinner ? styles['winner-icon'] : styles['loser-icon']}`}>
              {isWinner ? (
                <>
                  <div className={styles.trophy}>🏆</div>
                  <div className={styles.stars}>
                    <span className={styles.star}>⭐</span>
                    <span className={styles.star}>⭐</span>
                    <span className={styles.star}>⭐</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles['sad-face']}>😢</div>
                  <div className={styles.clouds}>
                    <span className={styles.cloud}>☁️</span>
                    <span className={styles.cloud}>☁️</span>
                  </div>
                </>
              )}
            </div>

            <h2 className={`${styles['result-title']} ${isWinner ? styles['winner-title'] : styles['loser-title']}`}>
              {isWinner ? '🎉 축하합니다! 🎉' : '아쉽네요... 😔'}
            </h2>

            <div className={styles['result-message-container']}>
              <p className={styles['result-message']}>
                {message}
              </p>
            </div>

            <div className={styles['result-actions']}>
              {isWinner && (
                <div className={styles['winner-badge']}>
                  <span className={styles['badge-text']}>🎫 티켓 당첨!</span>
                </div>
              )}
              <button className={`${styles['close-btn']} ${isWinner ? styles['winner-btn'] : styles['loser-btn']}`} onClick={onClose}>
                {isWinner ? '🎉 확인하기' : '다시 시도하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 