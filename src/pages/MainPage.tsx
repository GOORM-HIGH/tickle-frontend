import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { chatService } from "../services/chatService";
import { stompWebSocketService } from "./../services/stompWebSocketService";
import { ChatRoom } from "../components/chat/ChatRoom";
import { EnhancedChatRoomList } from "../components/chat/EnhancedChatRoomList";
import { NotificationBadge } from "../components/chat/NotificationBadge";
import type {
  ChatRoom as ChatRoomType,
  ChatMessage,
} from "../services/chatService";

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
  const {
    chatRooms,
    totalUnreadCount,
    loadMyChatRooms,
    incrementUnreadCount, // ✅ 새 메시지 수신 시 증가
    decrementUnreadCount, // ✅ 읽음 처리 시 감소
  } = useChat();

  // 🎯 totalUnreadCount 디버깅
  console.log("🎯 MainPage - totalUnreadCount:", totalUnreadCount);
  console.log("🎯 MainPage - chatRooms 개수:", chatRooms.length);

  // 모달 상태
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);

  // 🎯 채팅방별 메시지 상태 분리
  const [messagesByRoom, setMessagesByRoom] = useState<{
    [chatRoomId: number]: ChatMessage[];
  }>({});
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // 🎯 브라우저 세션 ID 생성 (각 창을 고유하게 식별)
  useEffect(() => {
    if (!sessionStorage.getItem("sessionId")) {
      const sessionId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("sessionId", sessionId);
      console.log(`🎯 새로운 브라우저 세션 생성: ${sessionId}`);
    }
  }, []);

  // 예매 관련 상태
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationLoading, setReservationLoading] = useState(false);

  // 참조
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎯 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🎯 현재 선택된 채팅방의 메시지만 가져오기 (캐시 우선, 정렬 포함)
  const currentMessages = selectedRoom
    ? (() => {
        const messages = messagesByRoom[selectedRoom.chatRoomId] || [];
        // 시간순으로 정렬 (최신이 아래로)
        return messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      })()
    : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // 🎯 채팅방별 메시지 추가 함수 (캐싱 포함)
  const addMessageToRoom = useCallback(
    (chatRoomId: number, message: ChatMessage) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [chatRoomId]: [...(prev[chatRoomId] || []), message],
      }));
    },
    []
  );

  // 🎯 채팅방별 메시지 설정 함수 (캐싱 포함)
  const setMessagesForRoom = useCallback(
    (chatRoomId: number, messages: ChatMessage[]) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [chatRoomId]: messages,
      }));
    },
    []
  );

  // 🎯 메시지 핸들러 (채팅방 ID 포함)
  const handleNewMessage = useCallback(
    async (message: ChatMessage) => {
      console.log("📨 새 메시지 수신:", message);

      // 🎯 해당 채팅방에만 메시지 추가
      if (message.chatRoomId) {
        addMessageToRoom(message.chatRoomId, message);

        // 🎯 내가 보낸 메시지가 아니고, 현재 선택된 채팅방이 아닌 경우에만 읽지 않은 메시지 개수 증가
        if (
          !message.isMyMessage &&
          selectedRoom?.chatRoomId !== message.chatRoomId
        ) {
          incrementUnreadCount(message.chatRoomId);

          // 🎯 새 메시지 수신 시 채팅방 목록 새로고침 (읽지 않은 메시지 개수 반영)
          try {
            await loadMyChatRooms();
            console.log("🔄 새 메시지 수신으로 인한 채팅방 목록 새로고침");
          } catch (error) {
            console.error(
              "❌ 새 메시지 수신 시 채팅방 목록 새로고침 실패:",
              error
            );
          }
        }
      }
    },
    [addMessageToRoom, selectedRoom, incrementUnreadCount, loadMyChatRooms]
  );

  // 🎯 주기적 채팅방 목록 새로고침 (읽지 않은 메시지 개수 동기화)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await loadMyChatRooms();
        console.log("🔄 주기적 채팅방 목록 새로고침 (30초마다)");
      } catch (error) {
        console.error("❌ 주기적 채팅방 목록 새로고침 실패:", error);
      }
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [loadMyChatRooms]);

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

  // 🎯 채팅방 열기 (개선된 버전)
  const handleOpenChatRoom = async (room: ChatRoomType) => {
    if (!room || !currentUser) {
      alert("채팅방 정보나 사용자 정보가 올바르지 않습니다.");
      return;
    }

    console.log("🚪 채팅방 입장:", room);

    try {
      setSelectedRoom(room);
      setIsChatListOpen(false);
      setIsWebSocketConnected(true);

      // 🎯 채팅방 입장 시 읽지 않은 메시지 개수 감소
      // 실제 읽음 처리는 ChatRoom 컴포넌트에서 자동으로 수행됨
      // 여기서는 UI 업데이트만 수행
      if (room.unreadMessageCount && room.unreadMessageCount > 0) {
        decrementUnreadCount(room.chatRoomId, room.unreadMessageCount);
        console.log(
          `📉 채팅방 입장으로 인한 읽지 않은 메시지 개수 감소: ${room.unreadMessageCount}개`
        );
      }

      console.log(`✅ 채팅방 ${room.chatRoomId} 열기 완료`);
    } catch (error: any) {
      console.error("❌ 채팅방 열기 실패:", error);
      setIsWebSocketConnected(false);
      alert(`채팅방을 열 수 없습니다: ${error.message}`);
    }
  };

  // 🎯 채팅방 닫기
  const handleCloseChatRoom = async () => {
    setIsWebSocketConnected(false);
    setSelectedRoom(null);

    // 🎯 채팅방을 닫을 때 채팅방 목록 새로고침 (읽음 상태 반영)
    try {
      await loadMyChatRooms();
      console.log("🔄 채팅방 목록 새로고침 완료 (읽음 상태 반영)");
    } catch (error) {
      console.error("❌ 채팅방 목록 새로고침 실패:", error);
    }
  };

  // 🎯 메시지 업데이트 처리
  const handleMessageUpdate = (
    messageId: number,
    updatedMessage: ChatMessage
  ) => {
    addMessageToRoom(updatedMessage.chatRoomId, updatedMessage);
  };

  // 🎯 메시지 삭제 처리
  const handleMessageDelete = (messageId: number) => {
    // 메시지 삭제 로직은 ChatRoom 컴포넌트에서 처리됨
    console.log("메시지 삭제됨:", messageId);
  };

  // 🎯 채팅 참여 처리
  const handleJoinChatFromReservation = async (reservation: Reservation) => {
    console.log("🔥 채팅 참여하기 버튼 클릭됨!", reservation);

    try {
      setReservationLoading(true);

      const chatRoom = await chatService.getChatRoomByPerformance(
        reservation.performanceId
      );
      console.log("🔥 채팅방 조회 성공:", chatRoom);

      await chatService.joinChatRoom(chatRoom.chatRoomId);
      console.log("🔥 채팅방 참여 성공");

      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === reservation.reservationId
            ? { ...r, hasJoinedChat: true, chatRoomId: chatRoom.chatRoomId }
            : r
        )
      );

      await loadMyChatRooms();
      alert(
        `${reservation.performanceTitle} 채팅방에 성공적으로 참여했습니다!`
      );

      setIsReservationOpen(false);
      setIsChatListOpen(true);
    } catch (error: any) {
      console.error("🔥 채팅방 참여 실패 오류:", error);
      alert(`채팅방 참여에 실패했습니다: ${error.message}`);
    } finally {
      setReservationLoading(false);
    }
  };

  // 🎯 이미 참여한 채팅방 열기
  const handleOpenExistingChat = async (reservation: Reservation) => {
    console.log("🔥 채팅방 열기 버튼 클릭됨!", reservation);

    if (reservation.chatRoomId) {
      const room = chatRooms.find(
        (r) => r.chatRoomId === reservation.chatRoomId
      );
      if (room) {
        setIsReservationOpen(false);
        await handleOpenChatRoom(room);
      } else {
        alert("채팅방을 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.");
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f0" }}>
      {/* 헤더 */}
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>🎭 티클 메인 페이지</h1>
        <p>실시간 채팅 시스템 - 채팅방별 분리!</p>
        <button
          onClick={() => {
            logout();
            // 로그아웃 후 상태 초기화
            setSelectedRoom(null);
            setIsChatListOpen(false);
            setIsReservationOpen(false);
            setMessagesByRoom({});
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#c82333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#dc3545";
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 🆕 디버깅 정보 */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          padding: "8px 12px",
          backgroundColor: isWebSocketConnected ? "#28a745" : "#dc3545",
          color: "white",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1001,
        }}
      >
        {isWebSocketConnected ? "🟢 실시간 연결" : "🔴 연결 끊김"}
        {selectedRoom && <div>채팅방: {selectedRoom.chatRoomId}</div>}
        <div>
          사용자: {currentUser?.nickname || "Unknown"} (ID:{" "}
          {currentUser?.id || "N/A"})
        </div>
        <div>채팅방 수: {Object.keys(messagesByRoom).length}</div>
        <div>
          토큰:{" "}
          {localStorage.getItem("accessToken")?.substring(0, 20) || "None"}...
        </div>
        <div>현재 시간: {new Date().toLocaleTimeString()}</div>
        <div>
          브라우저 세션: {sessionStorage.getItem("sessionId") || "None"}
        </div>
      </div>

      {/* 🆕 메시지 개수 표시 */}
      <div
        style={{
          position: "fixed",
          top: "50px",
          right: "10px",
          padding: "8px",
          backgroundColor: "#333",
          color: "white",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1001,
        }}
      >
        현재 메시지: {currentMessages.length}개
        <br />총 채팅방: {Object.keys(messagesByRoom).length}개
      </div>

      {/* 플로팅 채팅 버튼 */}
      <div
        onClick={() => setIsChatListOpen(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          backgroundColor: "#007bff",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "24px",
          zIndex: 1000,
          color: "white",
          boxShadow: "0 4px 12px rgba(0,123,255,0.3)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,123,255,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,123,255,0.3)";
        }}
      >
        💬
        {/* 🎯 디버깅용 - 직접 숫자 표시 */}
        {totalUnreadCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {totalUnreadCount}
          </div>
        )}
        {/* 🎯 백엔드 수정 후 - 플로팅 버튼 NotificationBadge 복원 */}
        {totalUnreadCount > 0 && (
          <NotificationBadge
            count={totalUnreadCount}
            showAnimation={true}
            size="large"
          />
        )}
      </div>

      {/* 채팅방 목록 모달 */}
      {isChatListOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>💬 내 채팅방</h2>
                <p style={{ margin: "5px 0 0", color: "#666" }}>
                  참여 중인 채팅방 {chatRooms.length}개
                </p>
              </div>
              <button
                onClick={() => setIsChatListOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              <EnhancedChatRoomList
                chatRooms={chatRooms}
                onOpenChatRoom={handleOpenChatRoom}
                onJoinChatRoom={(performanceId) => {
                  setIsChatListOpen(false);
                  setIsReservationOpen(true);
                  loadMyReservations();
                }}
                currentUserId={currentUser?.id || 0}
              />
            </div>
          </div>
        </div>
      )}

      {/* 예매내역 페이지 모달 */}
      {isReservationOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>🎫 내 예매내역</h2>
                <p style={{ margin: "5px 0 0", color: "#666" }}>
                  예매한 공연의 채팅방에 참여하세요
                </p>
              </div>
              <button
                onClick={() => setIsReservationOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {reservationLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  예매내역을 불러오는 중...
                </div>
              ) : reservations.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                    🎫
                  </div>
                  <h3 style={{ color: "#666" }}>예매내역이 없습니다</h3>
                  <p style={{ color: "#999" }}>
                    공연을 예매한 후 채팅방에 참여해보세요!
                  </p>
                </div>
              ) : (
                reservations.map((reservation) => (
                  <div
                    key={reservation.reservationId}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "16px",
                      backgroundColor: "white",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
                          {reservation.performanceTitle}
                        </h3>

                        <div style={{ marginBottom: "12px" }}>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#666",
                              marginBottom: "4px",
                            }}
                          >
                            📅 공연일시:{" "}
                            {new Date(
                              reservation.performanceDate
                            ).toLocaleString("ko-KR")}
                          </div>
                          <div style={{ fontSize: "14px", color: "#666" }}>
                            🎟️ 예매일:{" "}
                            {new Date(
                              reservation.reservationDate
                            ).toLocaleDateString("ko-KR")}
                          </div>
                        </div>

                        {reservation.hasJoinedChat && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              backgroundColor: "#d4edda",
                              color: "#155724",
                              padding: "4px 12px",
                              borderRadius: "16px",
                              fontSize: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            ✅ 채팅방 참여 완료
                          </div>
                        )}
                      </div>

                      <div style={{ marginLeft: "20px" }}>
                        {reservation.hasJoinedChat ? (
                          <button
                            onClick={() => handleOpenExistingChat(reservation)}
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            채팅방 열기
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleJoinChatFromReservation(reservation)
                            }
                            disabled={reservationLoading}
                            style={{
                              padding: "10px 20px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: reservationLoading
                                ? "not-allowed"
                                : "pointer",
                              fontSize: "14px",
                              opacity: reservationLoading ? 0.6 : 1,
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
      {selectedRoom && currentUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2500,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "800px",
              height: "80%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ChatRoom
              room={selectedRoom}
              currentUserId={currentUser.id}
              currentUserNickname={currentUser.nickname}
              onClose={handleCloseChatRoom}
              onMessageUpdate={handleMessageUpdate}
              onMessageDelete={handleMessageDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
};
