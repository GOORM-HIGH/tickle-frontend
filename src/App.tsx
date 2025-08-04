import React, { useState, useEffect } from 'react';
import { chatService, ChatRoom, ChatMessage } from './services/chatService';
import { authService } from './services/authService';

// 예매 내역 타입
interface Reservation {
  reservationId: number;
  performanceId: number;
  performanceTitle: string;
  performanceDate: string;
  reservationDate: string;
  hasJoinedChat: boolean;
  chatRoomId?: number;
}

function App() {
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false); // 🆕 예매내역 페이지
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: 'tester1@example.com', password: '1234' });
  
  // 🆕 예매내역 관련 state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationLoading, setReservationLoading] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      loadMyChatRooms();
    }
  }, []);

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authService.login(loginForm);
      localStorage.setItem('accessToken', response.accessToken);
      setIsLoggedIn(true);
      await loadMyChatRooms();
      alert('로그인 성공!');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인 실패! 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 내 채팅방 목록 로드
  const loadMyChatRooms = async () => {
    try {
      const rooms = await chatService.getMyRooms();
      setChatRooms(rooms);
      console.log('채팅방 목록:', rooms);
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
    }
  };

  // 🆕 예매내역 로드
  const loadMyReservations = async () => {
    setReservationLoading(true);
    try {
      // 실제로는 reservationService.getMyReservations() 호출
      // 임시 더미 데이터
      setReservations([
        {
          reservationId: 1,
          performanceId: 1,
          performanceTitle: "뮤지컬 레미제라블",
          performanceDate: "2025-08-15T19:30:00",
          reservationDate: "2025-07-20",
          hasJoinedChat: false
        },
        {
          reservationId: 2, 
          performanceId: 2,
          performanceTitle: "연극 햄릿",
          performanceDate: "2025-08-20T20:00:00", 
          reservationDate: "2025-07-25",
          hasJoinedChat: true,
          chatRoomId: 2
        },
        {
          reservationId: 3,
          performanceId: 3,
          performanceTitle: "BTS 월드 투어",
          performanceDate: "2025-09-01T18:00:00",
          reservationDate: "2025-08-01", 
          hasJoinedChat: false
        }
      ]);
    } catch (error) {
      console.error('예매 내역 로드 실패:', error);
    } finally {
      setReservationLoading(false);
    }
  };

  // 🆕 채팅 참여 처리
  const handleJoinChatFromReservation = async (reservation: Reservation) => {
    try {
      setReservationLoading(true);
      
      // 해당 공연의 채팅방 조회 및 참여
      const chatRoom = await chatService.getChatRoomByPerformance(reservation.performanceId);
      await chatService.joinChatRoom(chatRoom.chatRoomId);
      
      // 예매 정보 업데이트
      setReservations(prev => 
        prev.map(r => 
          r.reservationId === reservation.reservationId 
            ? { ...r, hasJoinedChat: true, chatRoomId: chatRoom.chatRoomId }
            : r
        )
      );
      
      // 채팅방 목록 새로고침
      await loadMyChatRooms();
      
      alert(`${reservation.performanceTitle} 채팅방에 성공적으로 참여했습니다!`);
      
      // 예매 페이지 닫고 채팅 목록 열기
      setIsReservationOpen(false);
      setIsChatListOpen(true);
      
    } catch (error) {
      console.error('채팅방 참여 실패:', error);
      alert('채팅방 참여에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setReservationLoading(false);
    }
  };

  // 🆕 이미 참여한 채팅방 열기
  const handleOpenExistingChat = async (reservation: Reservation) => {
    if (reservation.chatRoomId) {
      // 채팅방 목록에서 해당 채팅방 찾기
      const room = chatRooms.find(r => r.chatRoomId === reservation.chatRoomId);
      if (room) {
        setIsReservationOpen(false);
        await openChatRoom(room);
      }
    }
  };

  // 채팅방 메시지 로드
  const loadMessages = async (chatRoomId: number) => {
    try {
      const roomMessages = await chatService.getMessages(chatRoomId);
      setMessages(roomMessages);
      console.log('메시지 목록:', roomMessages);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      const newMessage = await chatService.sendMessage(selectedRoom.chatRoomId, messageInput.trim());
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      console.log('메시지 전송 성공:', newMessage);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const toggleChatList = () => {
    setIsChatListOpen(!isChatListOpen);
    setSelectedRoom(null);
  };

  // 🆕 예매내역 페이지 열기
  const openReservationPage = () => {
    setIsChatListOpen(false);
    setIsReservationOpen(true);
    loadMyReservations(); // 예매내역 로드
  };

  // 🆕 예매내역 페이지 닫기
  const closeReservationPage = () => {
    setIsReservationOpen(false);
  };

  const openChatRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    setIsChatListOpen(false);
    await loadMessages(room.chatRoomId);
  };

  const closeChatRoom = () => {
    setSelectedRoom(null);
    setMessages([]);
  };

  const totalUnreadCount = chatRooms.reduce((total, room) => total + (room.unreadCount || 0), 0);

  // 로그인 안 된 경우
  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '400px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
            🎭 티클 채팅 로그인
          </h2>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label>이메일:</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <label>비밀번호:</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
            테스트 계정으로 미리 입력되어 있습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🎭 티클 메인 페이지</h1>
        <p>예매 기반 채팅 시스템 - 백엔드 API 연동!</p>
        <button
          onClick={() => {
            authService.logout();
            setIsLoggedIn(false);
            setChatRooms([]);
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 플로팅 채팅 버튼 */}
      <div
        onClick={toggleChatList}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          backgroundColor: '#007bff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '24px',
          zIndex: 1000,
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
        }}
      >
        💬
        
        {totalUnreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </div>

      {/* 채팅방 목록 모달 */}
      {isChatListOpen && (
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
            maxWidth: '500px',
            maxHeight: '80%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0 }}>💬 내 채팅방</h2>
                <p style={{ margin: '5px 0 0', color: '#666' }}>
                  참여 중인 채팅방 {chatRooms.length}개
                </p>
              </div>
              <button
                onClick={toggleChatList}
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

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {chatRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
                  <h3 style={{ color: '#666' }}>참여한 채팅방이 없습니다</h3>
                  <p style={{ color: '#999' }}>예매한 공연의 채팅방에 참여해보세요!</p>
                  
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                    <button
                      onClick={loadMyChatRooms}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      새로고침
                    </button>
                    
                    {/* 🆕 핵심: 예매내역 페이지로 이동 버튼 */}
                    <button
                      onClick={openReservationPage}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      📋 채팅 참여하러 가기
                    </button>
                  </div>
                </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room.chatRoomId}
                    onClick={() => openChatRoom(room)}
                    style={{
                      padding: '16px',
                      border: '1px solid #eee',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0' }}>{room.name}</h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                          👥 {room.participantCount || 0}명 참여 중
                        </p>
                        {room.lastMessage && (
                          <p style={{ margin: '5px 0 0', color: '#999', fontSize: '12px' }}>
                            {room.lastMessage.senderNickname}: {room.lastMessage.content}
                          </p>
                        )}
                      </div>
                      
                      {room.unreadCount && room.unreadCount > 0 && (
                        <span style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🆕 예매내역 페이지 모달 */}
      {isReservationOpen && (
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
                onClick={closeReservationPage}
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
              {reservationLoading ? (
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
                            onClick={() => handleOpenExistingChat(reservation)}
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
                            onClick={() => handleJoinChatFromReservation(reservation)}
                            disabled={reservationLoading}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: reservationLoading ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              opacity: reservationLoading ? 0.6 : 1
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
      )}

      {/* 개별 채팅방 모달 (기존과 동일) */}
      {selectedRoom && (
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
          zIndex: 2500
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            height: '70%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 채팅방 헤더 */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa'
            }}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedRoom.name}</h3>
                <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
                  👥 {selectedRoom.participantCount || 0}명 참여 중 • 예매 기반 채팅
                </p>
              </div>
              <button
                onClick={closeChatRoom}
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

            {/* 메시지 영역 */}
            <div style={{
              flex: 1,
              padding: '20px',
              backgroundColor: '#f8f9fa',
              overflowY: 'auto'
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
                  <h3>메시지가 없습니다</h3>
                  <p>첫 메시지를 보내보세요!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      marginBottom: '15px',
                      display: 'flex',
                      justifyContent: message.isMyMessage ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '10px 15px',
                      borderRadius: '18px',
                      backgroundColor: message.isMyMessage ? '#007bff' : 'white',
                      color: message.isMyMessage ? 'white' : 'black',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      {!message.isMyMessage && (
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginBottom: '5px',
                          opacity: 0.8
                        }}>
                          {message.senderNickname}
                        </div>
                      )}
                      <div>{message.content}</div>
                      <div style={{
                        fontSize: '11px',
                        marginTop: '5px',
                        opacity: 0.7
                      }}>
                        {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 메시지 입력 */}
            <form onSubmit={handleSendMessage} style={{
              padding: '20px',
              borderTop: '1px solid #eee',
              backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '24px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: messageInput.trim() ? '#007bff' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: messageInput.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  전송
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
