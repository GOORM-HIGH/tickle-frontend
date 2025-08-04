import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { chatService } from '../services/chatService';
import { stompWebSocketService } from '../services/stompWebSocketService';
import type { ChatRoom, ChatMessage } from '../services/chatService';

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

export const MainPage: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const { chatRooms, totalUnreadCount, loadMyChatRooms } = useChat();
  
  // 모달 상태
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  
  // 🎯 채팅방별 메시지 상태 분리
  const [messagesByRoom, setMessagesByRoom] = useState<{ [chatRoomId: number]: ChatMessage[] }>({});
  const [messageInput, setMessageInput] = useState('');
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  
  // 예매 관련 상태
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationLoading, setReservationLoading] = useState(false);
  
  // 참조
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎯 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🎯 현재 선택된 채팅방의 메시지만 가져오기
  const currentMessages = selectedRoom ? (messagesByRoom[selectedRoom.chatRoomId] || []) : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // 🎯 채팅방별 메시지 추가 함수
  const addMessageToRoom = useCallback((chatRoomId: number, message: ChatMessage) => {
    setMessagesByRoom(prev => ({
      ...prev,
      [chatRoomId]: [...(prev[chatRoomId] || []), message]
    }));
  }, []);

  // 🎯 채팅방별 메시지 설정 함수
  const setMessagesForRoom = useCallback((chatRoomId: number, messages: ChatMessage[]) => {
    setMessagesByRoom(prev => ({
      ...prev,
      [chatRoomId]: messages
    }));
  }, []);

  // 🎯 메시지 핸들러 (채팅방 ID 포함)
  const handleNewMessage = useCallback((message: ChatMessage) => {
    console.log('📨 새 메시지 수신:', message);
    
    // 🎯 해당 채팅방에만 메시지 추가
    if (message.chatRoomId) {
      addMessageToRoom(message.chatRoomId, message);
    }
  }, [addMessageToRoom]);

  // 예매내역 로드
  const loadMyReservations = async () => {
    setReservationLoading(true);
    try {
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
          hasJoinedChat: false
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

  // 🎯 채팅방 열기 (개선된 버전)
  const handleOpenChatRoom = async (room: ChatRoom) => {
    if (!room || !currentUser) {
      alert('채팅방 정보나 사용자 정보가 올바르지 않습니다.');
      return;
    }

    console.log('🚪 채팅방 입장:', room);
    
    try {
      setSelectedRoom(room);
      setIsChatListOpen(false);
      
      // 🎯 해당 채팅방의 메시지가 이미 로드되어 있는지 확인
      if (!messagesByRoom[room.chatRoomId]) {
        console.log(`💬 채팅방 ${room.chatRoomId} 메시지 새로 로드`);
        const roomMessages = await chatService.getMessages(room.chatRoomId);
        setMessagesForRoom(room.chatRoomId, roomMessages);
      } else {
        console.log(`💬 채팅방 ${room.chatRoomId} 기존 메시지 사용 (${messagesByRoom[room.chatRoomId].length}개)`);
      }
      
      // 🎯 WebSocket 연결 (이전 연결이 있으면 자동으로 해제됨)
      await stompWebSocketService.connect(
        room.chatRoomId,
        currentUser.id,
        currentUser.nickname,
        handleNewMessage
      );
      
      setIsWebSocketConnected(true);
      console.log(`✅ 채팅방 ${room.chatRoomId} 연결 완료`);
      
    } catch (error) {
      console.error('❌ 채팅방 열기 실패:', error);
      setIsWebSocketConnected(false);
      alert(`채팅방을 열 수 없습니다: ${error.message}`);
    }
  };

  // 🎯 채팅방 닫기 (메시지 유지)
  const handleCloseChatRoom = () => {
    try {
      stompWebSocketService.disconnect();
    } catch (error) {
      console.error('❌ STOMP 연결 해제 실패:', error);
    }
    
    setIsWebSocketConnected(false);
    setSelectedRoom(null);
    setMessageInput('');
    // 🎯 메시지는 초기화하지 않음 (messagesByRoom 상태 유지)
  };

  // 🎯 메시지 전송 (현재 채팅방에만)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedRoom || !currentUser) return;

    const messageContent = messageInput.trim();
    setMessageInput(''); // 즉시 입력창 클리어

    try {
      if (isWebSocketConnected) {
        // 🎯 STOMP로 실시간 전송
        stompWebSocketService.sendMessage(messageContent);
        console.log(`📤 채팅방 ${selectedRoom.chatRoomId}에 STOMP 메시지 전송:`, messageContent);
      } else {
        // REST API 사용
        const newMessage = await chatService.sendMessage(selectedRoom.chatRoomId, messageContent);
        addMessageToRoom(selectedRoom.chatRoomId, newMessage);
        console.log(`📤 채팅방 ${selectedRoom.chatRoomId}에 REST API 메시지 전송:`, newMessage);
      }
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
      setMessageInput(messageContent); // 실패 시 입력 복원
    }
  };

  // 🎯 채팅 참여 처리
  const handleJoinChatFromReservation = async (reservation: Reservation) => {
    console.log('🔥 채팅 참여하기 버튼 클릭됨!', reservation);
    
    try {
      setReservationLoading(true);
      
      const chatRoom = await chatService.getChatRoomByPerformance(reservation.performanceId);
      console.log('🔥 채팅방 조회 성공:', chatRoom);
      
      await chatService.joinChatRoom(chatRoom.chatRoomId);
      console.log('🔥 채팅방 참여 성공');
      
      setReservations(prev => 
        prev.map(r => 
          r.reservationId === reservation.reservationId 
            ? { ...r, hasJoinedChat: true, chatRoomId: chatRoom.chatRoomId }
            : r
        )
      );
      
      await loadMyChatRooms();
      alert(`${reservation.performanceTitle} 채팅방에 성공적으로 참여했습니다!`);
      
      setIsReservationOpen(false);
      setIsChatListOpen(true);
      
    } catch (error) {
      console.error('🔥 채팅방 참여 실패 오류:', error);
      alert(`채팅방 참여에 실패했습니다: ${error.message}`);
    } finally {
      setReservationLoading(false);
    }
  };

  // 🎯 이미 참여한 채팅방 열기
  const handleOpenExistingChat = async (reservation: Reservation) => {
    console.log('🔥 채팅방 열기 버튼 클릭됨!', reservation);
    
    if (reservation.chatRoomId) {
      const room = chatRooms.find(r => r.chatRoomId === reservation.chatRoomId);
      if (room) {
        setIsReservationOpen(false);
        await handleOpenChatRoom(room);
      } else {
        alert('채팅방을 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      {/* 헤더 */}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🎭 티클 메인 페이지</h1>
        <p>실시간 채팅 시스템 - 채팅방별 분리!</p>
        <button
          onClick={logout}
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

      {/* 🆕 디버깅 정보 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        backgroundColor: isWebSocketConnected ? '#28a745' : '#dc3545',
        color: 'white',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1001
      }}>
        {isWebSocketConnected ? '🟢 실시간 연결' : '🔴 연결 끊김'}
        {selectedRoom && (
          <div>채팅방: {selectedRoom.chatRoomId}</div>
        )}
      </div>

      {/* 🆕 메시지 개수 표시 */}
      <div style={{
        position: 'fixed',
        top: '50px',
        right: '10px',
        padding: '8px',
        backgroundColor: '#333',
        color: 'white',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1001
      }}>
        현재 메시지: {currentMessages.length}개
        <br />
        총 채팅방: {Object.keys(messagesByRoom).length}개
      </div>

      {/* 플로팅 채팅 버튼 */}
      <div
        onClick={() => setIsChatListOpen(true)}
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
          top: 0, left: 0, right: 0, bottom: 0,
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
                onClick={() => setIsChatListOpen(false)}
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
                    
                    <button
                      onClick={() => {
                        setIsChatListOpen(false);
                        setIsReservationOpen(true);
                        loadMyReservations();
                      }}
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
                    onClick={() => handleOpenChatRoom(room)}
                    style={{
                      padding: '16px',
                      border: selectedRoom?.chatRoomId === room.chatRoomId ? '2px solid #007bff' : '1px solid #eee',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      backgroundColor: selectedRoom?.chatRoomId === room.chatRoomId ? '#f0f8ff' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0' }}>
                          {room.name || room.chatRoomName || `채팅방 ${room.chatRoomId}`}
                        </h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                          👥 {room.participantCount || 0}명 참여 중
                          {/* 🎯 채팅방별 메시지 개수 표시 */}
                          {messagesByRoom[room.chatRoomId] && (
                            <span style={{ marginLeft: '10px' }}>
                              💬 {messagesByRoom[room.chatRoomId].length}개 메시지
                            </span>
                          )}
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

      {/* 예매내역 페이지 모달 */}
      {isReservationOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
                onClick={() => setIsReservationOpen(false)}
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

      {/* 개별 채팅방 모달 */}
      {selectedRoom && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
                <h3 style={{ margin: 0 }}>
                  {selectedRoom.name || selectedRoom.chatRoomName || `채팅방 ${selectedRoom.chatRoomId}`}
                </h3>
                <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
                  👥 {selectedRoom.participantCount || 0}명 참여 중 • 
                  📋 채팅방 ID: {selectedRoom.chatRoomId} • 
                  💬 메시지 {currentMessages.length}개
                </p>
              </div>
              <button
                onClick={handleCloseChatRoom}
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
              {currentMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
                  <h3>메시지가 없습니다</h3>
                  <p>첫 메시지를 보내보세요!</p>
                </div>
              ) : (
                <>
                  {currentMessages.map((message, index) => (
                    <div
                      key={`${message.id}-${index}`}
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
                        backgroundColor: message.messageType === 'SYSTEM' 
                          ? '#e9ecef' 
                          : message.isMyMessage ? '#007bff' : 'white',
                        color: message.messageType === 'SYSTEM' 
                          ? '#6c757d' 
                          : message.isMyMessage ? 'white' : 'black',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        textAlign: message.messageType === 'SYSTEM' ? 'center' : 'left'
                      }}>
                        {!message.isMyMessage && message.messageType !== 'SYSTEM' && (
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
                        {message.messageType !== 'SYSTEM' && (
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
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
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
};
