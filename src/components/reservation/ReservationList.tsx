import React from 'react';

interface Props {
  onClose: () => void;
}

export const ReservationList: React.FC<Props> = ({ onClose }) => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎫</div>
        <h3 style={{ color: '#666' }}>예매내역 컴포넌트</h3>
        <p style={{ color: '#999' }}>여기에 예매내역 로직이 들어갑니다</p>
        
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
};
