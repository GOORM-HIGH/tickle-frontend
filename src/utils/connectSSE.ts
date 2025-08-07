// src/utils/connectSSE.ts
import { EventSourcePolyfill } from "event-source-polyfill";

export const connectSSE = (
  token: string,
  onMessage: (data: string) => void,
  onError?: (error: any) => void
): EventSourcePolyfill => {
  const eventSource = new EventSourcePolyfill(
    "http://127.0.0.1:8081/api/v1/notifications/sse-connect",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
      heartbeatTimeout: 3600000, // 1시간
    } as any // 타입 명시 (TS 오류 방지)
  );

  // 연결 성공
  eventSource.onopen = () => {
    console.log("🔗 SSE 연결 성공");
  };

  // 메시지 수신
  eventSource.onmessage = (event) => {
    console.log("📨 SSE 메시지 수신:", event.data);
    onMessage(event.data);
  };

  // 에러 처리
  eventSource.onerror = (err) => {
    console.error("❌ SSE 에러:", err);
    eventSource.close();
    onError?.(err);
  };

  return eventSource;
};
