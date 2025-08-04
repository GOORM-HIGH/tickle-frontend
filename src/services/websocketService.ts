// WebSocket 서비스

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  private client: Client | null = null;
  private chatRoomId: number | null = null;

  connect(chatRoomId: number, token: string, onMessage: (message: any) => void) {
    this.chatRoomId = chatRoomId;
    
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => console.log('WebSocket:', str),
      
      onConnect: () => {
        console.log('WebSocket 연결 성공');
        
        // 채팅방 구독
        this.client?.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          onMessage(receivedMessage);
        });
      },
      
      onStompError: (frame) => {
        console.error('WebSocket 오류:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  sendMessage(message: any) {
    if (this.client && this.client.connected && this.chatRoomId) {
      this.client.publish({
        destination: `/app/chat/${this.chatRoomId}/message`,
        body: JSON.stringify(message)
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.chatRoomId = null;
    }
  }
}

export const websocketService = new WebSocketService();
