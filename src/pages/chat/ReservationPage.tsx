import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { chatService } from '../../services/chatService';
import type { Reservation } from '../../types/reservation';

interface ReservationWithChat extends Reservation {
  hasJoinedChat: boolean;
  chatRoomId?: number;
}

export const ReservationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { chatRooms, loadMyChatRooms } = useChat();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<ReservationWithChat[]>([]);
  const [loading, setLoading] = useState(false);

  // 예매 내역 로드
  const loadReservations = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // 채팅 참여 처리
  const handleJoinChatFromReservation = async (reservation: ReservationWithChat) => {
    console.log("🔥 채팅 참여하기 버튼 클릭됨!", reservation);

    try {
      setLoading(true);

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

      // 채팅방으로 이동
      navigate(`/chat/rooms/${chatRoom.chatRoomId}`);
    } catch (error: any) {
      console.error("🔥 채팅방 참여 실패 오류:", error);
      alert(`채팅방 참여에 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 이미 참여한 채팅방 열기
  const handleOpenExistingChat = async (reservation: ReservationWithChat) => {
    console.log("🔥 채팅방 열기 버튼 클릭됨!", reservation);

    if (reservation.chatRoomId) {
      navigate(`/chat/rooms/${reservation.chatRoomId}`);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadReservations();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1>🎟️ 내 예매 내역</h1>
        <button
          onClick={() => navigate('/chat')}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← 채팅 목록으로
        </button>
      </div>

      {loading ? (
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
                    disabled={loading}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? "처리 중..." : "채팅 참여하기"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationPage; 