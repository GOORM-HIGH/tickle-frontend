// src/components/ticket/TicketEventCard.tsx
import { useNavigate } from 'react-router-dom';

interface TicketEventCardProps {
  title: string;
  description: string;
  statusId?: number; // 상태 ID (4: 예정, 5: 진행중, 6: 마감)
  eventId?: string;
  imageUrl?: string;
}

export default function TicketEventCard({ title, description, statusId, eventId, imageUrl }: TicketEventCardProps) {
  const navigate = useNavigate();

  // 상태별 텍스트와 스타일 설정
  const getStatusInfo = (statusId?: number) => {
    switch (statusId) {
      case 4:
        return {
          text: '이벤트 예정',
          backgroundColor: '#e3f2fd', // 연한 파란색
          color: '#1976d2',
          borderColor: '#bbdefb'
        };
      case 5:
        return {
          text: '이벤트 중',
          backgroundColor: '#e8f5e8', // 연한 초록색
          color: '#2e7d32',
          borderColor: '#c8e6c9'
        };
      case 6:
        return {
          text: '이벤트 마감',
          backgroundColor: '#ffebee', // 연한 빨간색
          color: '#c62828',
          borderColor: '#ffcdd2'
        };
      default:
        return {
          text: '이벤트 중',
          backgroundColor: '#f2f4f8',
          color: '#333',
          borderColor: '#e0e0e0'
        };
    }
  };

  const statusInfo = getStatusInfo(statusId);

  const handleClick = () => {
    if (eventId) {
      navigate(`/event/ticket/${eventId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        flex: '1 1 200px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        padding: '1.5rem',
        position: 'relative',
        minHeight: '420px',
        cursor: eventId ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...(eventId && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }
        })
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          backgroundColor: statusInfo.backgroundColor,
          color: statusInfo.color,
          fontWeight: 'bold',
          padding: '0.2rem 0.6rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          zIndex: 1,
          border: `1px solid ${statusInfo.borderColor}`,
        }}
      >
        {statusInfo.text}
      </div>

      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title}
          style={{ 
            width: '100%', 
            height: '420px', 
            objectFit: 'cover', 
            borderRadius: '12px', 
            marginBottom: '1rem' 
          }}
          onError={(e) => {
            // 이미지 로드 실패 시 기본 이미지로 대체
            e.currentTarget.src = 'https://via.placeholder.com/280x140/f0f0f0/999999?text=이벤트+이미지';
          }}
        />
      ) : (
        <div style={{ 
          height: '420px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '12px', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '0.875rem'
        }}>
          이벤트 이미지
        </div>
      )}
      
      <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h4>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>{description}</p>
    </div>
  );
}