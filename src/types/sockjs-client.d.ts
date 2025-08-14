// src/types/sockjs-client.d.ts
declare module 'sockjs-client/dist/sockjs' {
  import SockJS from 'sockjs-client';
  export = SockJS;
}

// 추가로 sockjs-client 전체에 대한 타입도 선언
declare module 'sockjs-client' {
  export default class SockJS {
    constructor(url: string, protocols?: string | string[], options?: any);
    close(code?: number, reason?: string): void;
    send(data: string): void;
    
    onopen: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onclose: ((event: CloseEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    
    readyState: number;
    url: string;
    protocol: string;
    
    static readonly CONNECTING: 0;
    static readonly OPEN: 1;
    static readonly CLOSING: 2;
    static readonly CLOSED: 3;
  }
}
