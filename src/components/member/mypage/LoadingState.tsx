import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "권한 확인 중..." 
}) => {
  return (
    <div className="mypage-loading">
      <h2>{message}</h2>
    </div>
  );
};

export default LoadingState;
