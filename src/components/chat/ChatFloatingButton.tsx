import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { chatService } from '../../services/chatService';
import { NotificationBadge } from './NotificationBadge';
import { SimpleChatRoom } from './SimpleChatRoom';
import { ChatRoomList } from './ChatRoomList';
import type { ChatRoom } from '../../services/chatService';

const ChatFloatingButton: React.FC = () => {
  const { currentUser } = useAuth();
  const { chatRooms, totalUnreadCount, loadMyChatRooms, incrementUnreadCount, decrementUnreadCount, addChatRoom } = useChat();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'room' | 'reservations'>('list');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationLoading, setReservationLoading] = useState(false);

  const handleClick = () => {
    if (currentUser) {
      setIsModalOpen(!isModalOpen);
      if (!isModalOpen) {
        loadMyChatRooms();
        if (selectedRoom) {
          setCurrentView('room');
        } else {
          setCurrentView('list');
        }
      }
    } else {
      window.location.href = '/auth/sign-in';
    }
  };

  const handleRoomClick = (room: ChatRoom) => {
    setSelectedRoom(room);
    setCurrentView('room');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentView('list');
    setSelectedRoom(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRoom(null);
  };

  const handleOpenReservations = () => {
    setCurrentView('reservations');
    loadReservations();
  };

  const loadReservations = async () => {
    try {
      setReservationLoading(true);
      // 실제 API 호출로 대체 필요
      setReservations([
        {
          reservationId: 1,
          performanceId: 1,
          performanceTitle: "뮤지컬 레미제라블",
          performanceDate: "2025-08-15T19:30:00",
          reservationDate: "2025-07-20",
          hasJoinedChat: false,
        },
        {
          reservationId: 2,
          performanceId: 2,
          performanceTitle: "연극 햄릿",
          performanceDate: "2025-08-20T20:00:00",
          reservationDate: "2025-07-25",
          hasJoinedChat: false,
        },
        {
          reservationId: 3,
          performanceId: 3,
          performanceTitle: "BTS 월드 투어",
          performanceDate: "2025-09-01T18:00:00",
          reservationDate: "2025-08-01",
          hasJoinedChat: false,
        },
      ]);
    } catch (error) {
      console.error("예매 내역 로드 실패:", error);
    } finally {
      setReservationLoading(false);
    }
  };

  const handleJoinChatFromReservation = async (reservation: any) => {
    console.log("🔥 채팅방 참여하기 버튼 클릭됨!", reservation);
    console.log("🔥 performanceId:", reservation.performanceId);

    try {
      setReservationLoading(true);
      
      // 🎯 채팅방 참여 API 호출
      console.log("🔥 joinChatRoom API 호출 시작...");
      const newChatRoom = await chatService.joinChatRoom(reservation.performanceId);
      console.log("✅ 채팅방 참여 성공:", newChatRoom);
      
      // 🎯 즉시 채팅방 목록에 추가
      addChatRoom(newChatRoom);
      
      // 🎯 채팅방 목록 새로고침
      console.log("🔥 loadMyChatRooms 호출...");
      await loadMyChatRooms();
      
      alert("채팅방에 참여했습니다!");
      
      // 🎯 채팅방으로 이동
      setSelectedRoom(newChatRoom);
      setCurrentView('room');
      
    } catch (error: any) {
      console.error("❌ 채팅방 참여 실패:", error);
      console.error("❌ 에러 상세:", error.response?.data);
      alert("채팅방 참여에 실패했습니다.");
    } finally {
      setReservationLoading(false);
    }
  };

  const handleOpenExistingChat = async (reservation: any) => {
    console.log("🔥 채팅방 열기 버튼 클릭됨!", reservation);

    if (reservation.chatRoomId) {
      const room = chatRooms.find((r) => r.chatRoomId === reservation.chatRoomId);
      if (room) {
        setSelectedRoom(room);
        setCurrentView('room');
      } else {
        alert("채팅방을 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.");
      }
    }
  };

  const handleMessageUpdate = (messageId: number, updatedMessage: any) => {
    console.log('메시지 업데이트:', messageId, updatedMessage);
  };

  const handleMessageDelete = (messageId: number) => {
    console.log('메시지 삭제:', messageId);
  };

  useEffect(() => {
    loadMyChatRooms();
    loadReservations();
  }, []);

  // 🎯 채팅방 목록 새로고침 이벤트 리스너
  useEffect(() => {
    const handleChatRoomListRefresh = () => {
      console.log('🔄 ChatFloatingButton - 채팅방 목록 새로고침 이벤트 수신');
      loadMyChatRooms();
      
      // 🎯 읽지 않은 메시지 카운트 재계산
      setTimeout(() => {
        console.log('🔄 읽지 않은 메시지 카운트 재계산');
        loadMyChatRooms();
      }, 500);
    };

    window.addEventListener('chatRoomListRefresh', handleChatRoomListRefresh);
    
    return () => {
      window.removeEventListener('chatRoomListRefresh', handleChatRoomListRefresh);
    };
  }, [loadMyChatRooms]);

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }}
      >
        💬
        {totalUnreadCount > 0 && (
          <NotificationBadge
            count={totalUnreadCount}
            showAnimation={true}
            size="large"
          />
        )}
      </div>

      {/* iPhone-shaped Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '375px',
            height: '667px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '3px solid #333',
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: '15px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: '17px',
              borderTopRightRadius: '17px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentView === 'room' && (
                <button
                  onClick={handleBackToList}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ←
                </button>
              )}
              {currentView === 'reservations' && (
                <button
                  onClick={handleBackToList}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ←
                </button>
              )}
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                {currentView === 'list' && '💬 내 채팅방'}
                {currentView === 'room' && selectedRoom?.name}
                {currentView === 'reservations' && '🎟️ 내 예매 내역'}
              </h3>
            </div>
            <button
              onClick={handleCloseModal}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {currentView === 'list' && (
              chatRooms.length === 0 ? (
                <div style={{ 
                  padding: '40px 20px', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <p style={{ color: '#666', margin: 0 }}>참여한 채팅방이 없습니다.</p>
                  <button 
                    onClick={handleOpenReservations}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    예매 내역 보기
                  </button>
                </div>
              ) : (
                <div style={{ padding: '10px' }}>
                  {chatRooms.map((room) => (
                    <div
                      key={room.chatRoomId}
                      onClick={() => handleRoomClick(room)}
                      style={{
                        padding: '15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
                        {room.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        👥 {room.participantCount || 0}명 참여 중
                        {room.unreadCount && room.unreadCount > 0 && (
                          <span style={{
                            backgroundColor: '#ff4757',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            marginLeft: '8px'
                          }}>
                            {room.unreadCount}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )
            )}

            {currentView === 'room' && selectedRoom && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <SimpleChatRoom
                  room={selectedRoom}
                  currentUserId={currentUser?.id || 0}
                  currentUserNickname={currentUser?.nickname || ""}
                  onClose={handleBackToList}
                  onMessageUpdate={handleMessageUpdate}
                  onMessageDelete={handleMessageDelete}
                />
              </div>
            )}

            {currentView === 'reservations' && (
              <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
                {reservationLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>예매 내역을 불러오는 중...</p>
                  </div>
                ) : (
                  reservations.map((reservation) => (
                    <div
                      key={reservation.reservationId}
                      style={{
                        padding: '15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        backgroundColor: 'white',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                        {reservation.performanceTitle}
                      </h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        📅 {new Date(reservation.performanceDate).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                        🎫 예매일: {reservation.reservationDate}
                      </p>
                      {reservation.hasJoinedChat ? (
                        <button
                          onClick={() => handleOpenExistingChat(reservation)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          채팅방 열기
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinChatFromReservation(reservation)}
                          disabled={reservationLoading}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: reservationLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            opacity: reservationLoading ? 0.6 : 1,
                          }}
                        >
                          {reservationLoading ? '참여 중...' : '채팅방 참여하기'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Phone Footer (Home Button) */}
          <div
            style={{
              height: '20px',
              backgroundColor: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomLeftRadius: '17px',
              borderBottomRightRadius: '17px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '4px',
                backgroundColor: '#666',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatFloatingButton;
