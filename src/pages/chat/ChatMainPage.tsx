import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { chatService } from "../../services/chatService";
import { ChatRoom } from "../../components/chat/ChatRoom";
import { ChatRoomList } from "../../components/chat/ChatRoomList";
import { NotificationBadge } from "../../components/chat/NotificationBadge";
import type { ChatRoomType, ChatMessage } from "../../types/chat";
import type { Reservation } from "../../types/reservation";

interface ReservationWithChat extends Reservation {
  hasJoinedChat: boolean;
  chatRoomId?: number;
}

export const ChatMainPage: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const {
    chatRooms,
    totalUnreadCount,
    loadMyChatRooms,
    incrementUnreadCount,
    decrementUnreadCount,
  } = useChat();

  const navigate = useNavigate();

  // 모달 상태
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);

  // 채팅방별 메시지 상태 분리
  const [messagesByRoom, setMessagesByRoom] = useState<{
    [chatRoomId: number]: ChatMessage[];
  }>({});
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // 예매 관련 상태
  const [reservations, setReservations] = useState<ReservationWithChat[]>([]);
  const [reservationLoading, setReservationLoading] = useState(false);

  // 참조
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 현재 선택된 채팅방의 메시지만 가져오기
  const currentMessages = selectedRoom
    ? (() => {
        const messages = messagesByRoom[selectedRoom.chatRoomId] || [];
        return messages.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      })()
    : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // 채팅방별 메시지 추가 함수
  const addMessageToRoom = useCallback(
    (chatRoomId: number, message: ChatMessage) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [chatRoomId]: [...(prev[chatRoomId] || []), message],
      }));
    },
    []
  );

  // 채팅방별 메시지 설정 함수
  const setMessagesForRoom = useCallback(
    (chatRoomId: number, messages: ChatMessage[]) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [chatRoomId]: messages,
      }));
    },
    []
  );

  // 메시지 핸들러
  const handleNewMessage = useCallback(
    async (message: ChatMessage) => {
      console.log("📨 새 메시지 수신:", message);

      // 현재 채팅방의 메시지인 경우에만 처리
      if (selectedRoom && message.chatRoomId === selectedRoom.chatRoomId) {
        addMessageToRoom(message.chatRoomId, message);
      }

      // 읽지 않은 메시지 개수 증가
      if (message.senderId !== currentUser?.id) {
        incrementUnreadCount(message.chatRoomId, 1);
      }
    },
    [selectedRoom, currentUser?.id, addMessageToRoom, incrementUnreadCount]
  );

  // 예매 내역 로드
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

  // 채팅방 열기
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

      if (room.unreadMessageCount && room.unreadMessageCount > 0) {
        decrementUnreadCount(room.chatRoomId, room.unreadMessageCount);
      }

      console.log(`✅ 채팅방 ${room.chatRoomId} 열기 완료`);
    } catch (error: any) {
      console.error("❌ 채팅방 열기 실패:", error);
      setIsWebSocketConnected(false);
      alert(`채팅방을 열 수 없습니다: ${error.message}`);
    }
  };

  // 채팅방 닫기
  const handleCloseChatRoom = async () => {
    setIsWebSocketConnected(false);
    setSelectedRoom(null);

    try {
      await loadMyChatRooms();
      console.log("🔄 채팅방 목록 새로고침 완료");
    } catch (error) {
      console.error("❌ 채팅방 목록 새로고침 실패:", error);
    }
  };

  // 메시지 업데이트 처리
  const handleMessageUpdate = (
    messageId: number,
    updatedMessage: ChatMessage
  ) => {
    addMessageToRoom(updatedMessage.chatRoomId, updatedMessage);
  };

  // 메시지 삭제 처리
  const handleMessageDelete = (messageId: number) => {
    console.log("메시지 삭제됨:", messageId);
  };

  // 채팅 참여 처리
  const handleJoinChatFromReservation = async (reservation: ReservationWithChat) => {
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

  // 이미 참여한 채팅방 열기
  const handleOpenExistingChat = async (reservation: ReservationWithChat) => {
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

  // 초기 로드
  useEffect(() => {
    loadMyChatRooms();
    loadReservations();
  }, []);

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1>🎭 티클 채팅</h1>
        {currentUser && (
          <p>
            안녕하세요, <strong>{currentUser.nickname}</strong>님! 👋
          </p>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          로그아웃
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* 예매 내역 */}
        <div style={{ flex: 1 }}>
          <h2>🎟️ 내 예매 내역</h2>
          <button
            onClick={() => setIsReservationOpen(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            예매 내역 보기
          </button>
        </div>

        {/* 채팅방 목록 */}
        <div style={{ flex: 1 }}>
          <h2>💬 내 채팅방</h2>
          <button
            onClick={() => setIsChatListOpen(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            채팅방 목록 보기
          </button>
        </div>
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
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>💬 내 채팅방 목록</h3>
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
            <ChatRoomList
              chatRooms={chatRooms}
              onRoomClick={handleOpenChatRoom}
              onClose={() => setIsChatListOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 예매 내역 모달 */}
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
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "800px",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>🎟️ 내 예매 내역</h3>
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
            {reservationLoading ? (
              <p>로딩 중...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {reservations.map((reservation) => (
                  <div
                    key={reservation.reservationId}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                            fontSize: "14px",
                            color: "#28a745",
                            fontWeight: "bold",
                          }}
                        >
                          ✅ 채팅방 참여 완료
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {reservation.hasJoinedChat ? (
                        <button
                          onClick={() => handleOpenExistingChat(reservation)}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          채팅방 열기
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinChatFromReservation(reservation)}
                          disabled={reservationLoading}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: reservationLoading ? "not-allowed" : "pointer",
                            opacity: reservationLoading ? 0.6 : 1,
                          }}
                        >
                          {reservationLoading ? "처리 중..." : "채팅 참여하기"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 채팅방 모달 */}
      {selectedRoom && (
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
            zIndex: 3000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "800px",
              height: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ChatRoom
              room={selectedRoom}
              currentUserId={currentUser?.id || 0}
              currentUserNickname={currentUser?.nickname || ""}
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

export default ChatMainPage; 