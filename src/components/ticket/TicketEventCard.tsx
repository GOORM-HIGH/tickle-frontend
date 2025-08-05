// src/components/ticket/TicketEventCard.tsx
import { useNavigate } from 'react-router-dom';

interface TicketEventCardProps {
  title: string;
  description: string;
  tag?: string;
  eventId?: string;
  imageUrl?: string;
}

export default function TicketEventCard({ title, description, tag = '이벤트 중', eventId, imageUrl }: TicketEventCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        flex: '1 1 240px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        padding: '1.5rem',
        position: 'relative',
        minHeight: '280px',
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
          backgroundColor: '#f2f4f8',
          color: '#333',
          fontWeight: 'bold',
          padding: '0.2rem 0.6rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          zIndex: 1,
        }}
      >
        {tag}
      </div>

      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title}
          style={{ 
            width: '100%', 
            height: '140px', 
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
          height: '140px', 
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