import { EventSourcePolyfill } from "event-source-polyfill";

interface NotificationMessage {
  title: string;
  message: string;
}

/**
 * SSE 연결을 설정합니다.
 *
 * @param token - 인증 토큰 (Bearer)
 * @param onMessage - 알림 메시지 수신 시 호출되는 콜백
 * @param onError - 에러 발생 시 호출되는 콜백 (선택)
 * @returns EventSourcePolyfill 인스턴스
 */
export const connectSSE = (
  token: string,
  onMessage: (data: NotificationMessage) => void,
  onError?: (error: any) => void
): EventSourcePolyfill => {
  const eventSource = new EventSourcePolyfill(
    "http://127.0.0.1:8081/api/v1/notifications/sse-connect",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
      heartbeatTimeout: 3600000,
    } as any // 타입 오류 방지
  );

  eventSource.onopen = () => {
    console.log("🔗 SSE 연결 성공");
  };

  eventSource.addEventListener("notification", (event) => {
    try {
      const data: NotificationMessage = JSON.parse(
        (event as MessageEvent).data
      );
      console.log("🔔 알림 SSE 메시지:", data);
      onMessage(data);
    } catch (error) {
      console.error("❗ SSE 메시지 파싱 오류:", error);
    }
  });

  eventSource.onerror = (err) => {
    console.error("❌ SSE 에러:", err);
    eventSource.close();
    onError?.(err);
  };

  return eventSource;
};
