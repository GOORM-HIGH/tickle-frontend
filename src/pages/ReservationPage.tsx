// 임시 예매내역 페이지

import React, { useState, useEffect } from 'react';

interface Reservation {
  reservationId: number;
  performanceId: number;
  performanceTitle: string;
  performanceDate: string;
  reservationDate: string;
  hasJoinedChat: boolean;
  chatRoomId?: number;
}

interface Props {
  onClose: () => void;
  onJoinChat: (reservation: Reservation) => void;
}

const ReservationPage: React.FC<Props> = ({ onClose, onJoinChat }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyReservations();
  }, []);

  const loadMyReservations = async () => {
    try {
      // 실제로는 reservationService.getMyReservations() 호출
      const response = await fetch('/api/v1/reservations/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReservations(data.data);
      }
    } catch (error) {
      console.error('예매 내역 로드 실패:', error);
      
      // 임시 더미 데이터 (개발용)
      setReservations([
        {
          reservationId: 1,
          performanceId: 1,
          performanceTitle: "뮤지컬 레미제라블",
          performanceDate: "2025-08-15 19:30",
          reservationDate: "2025-07-20",
          hasJoinedChat: false
        },
        {
          reservationId: 2, 
          performanceId: 2,
          performanceTitle: "연극 햄릿",
          performanceDate: "2025-08-20 20:00", 
          reservationDate: "2025-07-25",
          hasJoinedChat: true,
          chatRoomId: 2
        },
        {
          reservationId: 3,
          performanceId: 3,
          performanceTitle: "BTS 월드 투어",
          performanceDate: "2025-09-01 18:00",
          reservationDate: "2025-08-01", 
          hasJoinedChat: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChat = async (reservation: Reservation) => {
    try {
      setLoading(true);
      
      // 해당 공연의 채팅방에 자동 참여
      const response = await fetch(`/api/v1/chat/performance/${reservation.performanceId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `${reservation.performanceTitle} 채팅방에 참여했습니다.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // 예매 정보 업데이트
        const updatedReservation = {
          ...reservation,
          hasJoinedChat: true,
          chatRoomId: data.data.chatRoomId
        };
        
        // 상위 컴포넌트에 알림 (채팅방 목록 새로고침 및 모달 전환)
        onJoinChat(updatedReservation);
        
        alert(`${reservation.performanceTitle} 채팅방에 성공적으로 참여했습니다!`);
      }
    } catch (error) {
      console.error('채팅방 참여 실패:', error);
      alert('채팅방 참여에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0 }}>🎫 내 예매내역</h2>
            <p style={{ margin: '5px 0 0', color: '#666' }}>
              예매한 공연의 채팅방에 참여하세요
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* 예매 목록 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              예매내역을 불러오는 중...
            </div>
          ) : reservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎫</div>
              <h3 style={{ color: '#666' }}>예매내역이 없습니다</h3>
              <p style={{ color: '#999' }}>공연을 예매한 후 채팅방에 참여해보세요!</p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.reservationId}
                style={{
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                      {reservation.performanceTitle}
                    </h3>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                        📅 공연일시: {new Date(reservation.performanceDate).toLocaleString('ko-KR')}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        🎟️ 예매일: {new Date(reservation.reservationDate).toLocaleDateString('ko-KR')}
                      </div>
                    </div>

                    {reservation.hasJoinedChat && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        marginBottom: '12px'
                      }}>
                        ✅ 채팅방 참여 완료
                      </div>
                    )}
                  </div>

                  <div style={{ marginLeft: '20px' }}>
                    {reservation.hasJoinedChat ? (
                      <button
                        onClick={() => onJoinChat(reservation)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        채팅방 열기
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinChat(reservation)}
                        disabled={loading}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          opacity: loading ? 0.6 : 1
                        }}
                      >
                        채팅 참여하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
