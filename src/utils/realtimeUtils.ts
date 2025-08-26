import { EventSourcePolyfill } from "event-source-polyfill";
import type { EventSourcePolyfillInit } from "event-source-polyfill";
import api from "../services/api";
import { getAccessToken } from "./tokenUtils";

export type SSEHandle = {
  raw: EventSourcePolyfill | null;
  close: () => void;
};

export function connect({
  path = "/api/v1/notifications/connect",
  onMessage,
  onError,
  withCredentials = true,
  heartbeatTimeout = 3_600_000,
}: ConnectSSEOptions): SSEHandle {
  const baseURL = api.defaults.baseURL ?? window.location.origin;
  const url = new URL(path, baseURL).toString();

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let es: EventSourcePolyfill | null = null;
  let closedManually = false;

  const open = () => {
    const init: EventSourcePolyfillInit = {
      headers,
      withCredentials,
      heartbeatTimeout,
    } as EventSourcePolyfillInit;

    es = new EventSourcePolyfill(url, init);

    es.onopen = () => {
      console.log("실시간 통신 성공");
    };

    es.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(
          (event as MessageEvent).data
        ) as RealtimeNotification;
        console.log("실시간 알림 데이터:", data);
        onMessage(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("실시간 알림 파싱 오류:", e);
      }
    });

    es.onerror = (err) => {
      console.error("실시간 통신 에러:", err);
      es?.close();
      onError?.(err);
    };
  };

  open();

  return {
    get raw() {
      return es;
    },
    close: () => {
      closedManually = true;
      es?.close();
    },
  };
}
