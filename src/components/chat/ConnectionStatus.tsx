import React, { useState, useEffect } from 'react';

interface Props {
  isConnected: boolean;
  lastConnected?: Date;
  connectionAttempts?: number;
}

export const ConnectionStatus: React.FC<Props> = ({
  isConnected,
  lastConnected,
  connectionAttempts = 0
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (isConnected) return '#28a745';
    if (connectionAttempts > 0) return '#ffc107';
    return '#dc3545';
  };

  const getStatusText = () => {
    if (isConnected) return '실시간 연결됨';
    if (connectionAttempts > 0) return '재연결 시도 중...';
    return '연결 끊김';
  };

  const getStatusIcon = () => {
    if (isConnected) return '🟢';
    if (connectionAttempts > 0) return '🟡';
    return '🔴';
  };

  const formatLastConnected = () => {
    if (!lastConnected) return '없음';
    const now = new Date();
    const diff = now.getTime() - lastConnected.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return lastConnected.toLocaleDateString('ko-KR');
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setShowDetails(!showDetails)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '12px',
          backgroundColor: getStatusColor() + '20',
          color: getStatusColor(),
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: `1px solid ${getStatusColor()}40`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = getStatusColor() + '30';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = getStatusColor() + '20';
        }}
        title="연결 상태 클릭하여 상세 정보 보기"
      >
        <span style={{ fontSize: '10px' }}>{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </div>

      {/* 상세 정보 팝업 */}
      {showDetails && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '12px',
          fontSize: '12px',
          minWidth: '200px',
          zIndex: 1000,
          marginTop: '4px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>연결 상태</strong>
          </div>
          <div style={{ marginBottom: '4px' }}>
            상태: {getStatusText()}
          </div>
          <div style={{ marginBottom: '4px' }}>
            마지막 연결: {formatLastConnected()}
          </div>
          {connectionAttempts > 0 && (
            <div style={{ marginBottom: '4px' }}>
              재연결 시도: {connectionAttempts}회
            </div>
          )}
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
            {isConnected 
              ? '실시간 메시지 송수신이 가능합니다.'
              : '연결이 끊어져 메시지 전송이 제한됩니다.'
            }
          </div>
        </div>
      )}
    </div>
  );
}; 