import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import type { ChatMessage } from './chatService';
import { getAccessToken, getUserInfo } from '../utils/tokenUtils';

class StompWebSocketService {
  private stompClient: Client | null = null;
  private isConnected: boolean = false;
  private currentChatRoomId: number | null = null;
  private currentUserId: number | null = null; // 추가: 사용자 ID 저장
  private currentUserNickname: string | null = null; // 추가: 사용자 닉네임 저장
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;

  /**
   * STOMP + SockJS 연결
   */
  connect(
    chatRoomId: number,
    userId: number,
    userNickname: string,
    onMessage: (message: ChatMessage) => void
  ): Promise<void> {
    console.log(`🔗 STOMP 연결 시도: 채팅방 ${chatRoomId}, 사용자 ID ${userId}, 닉네임 ${userNickname}`);
    return new Promise((resolve, reject) => {
      console.log(`🔗 STOMP 연결 시도: 채팅방 ${chatRoomId}`);

      // 기존 연결 해제 (중복 방지)
      if (this.stompClient) {
        console.log('기존 STOMP 연결 해제 중...');
        this.disconnect();
        // 연결 해제 완료 대기
        setTimeout(() => {
          this.createConnection(chatRoomId, userId, userNickname, onMessage, resolve, reject);
        }, 100);
      } else {
        this.createConnection(chatRoomId, userId, userNickname, onMessage, resolve, reject);
      }
    });
  }

  /**
   * STOMP 연결 생성 (내부 메서드)
   */
  private createConnection(
    chatRoomId: number,
    userId: number,
    userNickname: string,
    onMessage: (message: ChatMessage) => void,
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    // 사용자 정보 저장 (토큰 기반으로 고유 식별)
    const token = getAccessToken();
    this.currentChatRoomId = chatRoomId;
    this.currentUserId = userId;
    this.currentUserNickname = userNickname;
    this.onMessageCallback = onMessage;

    console.log(`사용자 정보 저장: ID=${userId}, 닉네임=${userNickname}, 토큰=${token?.substring(0, 20)}...`); // 디버깅 로그

    // SockJS 객체 생성 (Spring Boot 엔드포인트)
    const socket = new SockJS('http://localhost:8081/ws-sockjs');
    
    // STOMP 클라이언트 생성
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        // JWT 토큰을 헤더로 전송 (STOMP는 지원함)
        'Authorization': `Bearer ${getAccessToken()}`,
        'X-User-Id': userId.toString(),
        'X-User-Nickname': userNickname,
        'X-Session-Id': sessionStorage.getItem('sessionId') || `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 브라우저 세션 ID
      },
      debug: (str) => {
        console.log('🔍 STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log('✅ STOMP 연결 성공:', frame);
        this.isConnected = true;
        
        // 채팅방 구독 (먼저 구독 설정)
        this.stompClient?.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
          try {
            console.log('STOMP 원본 메시지 수신:', message); // 디버깅 로그 추가
            console.log('메시지 body:', message.body); // 디버깅 로그 추가
            
            const chatData = JSON.parse(message.body);
            console.log('STOMP 메시지 수신:', chatData);
            this.handleReceivedMessage(chatData);
          } catch (error) {
            console.error('메시지 파싱 실패:', error);
          }
        });

        // 구독 설정 후 잠시 대기 후 JOIN 메시지 전송
        setTimeout(() => {
          this.sendJoinMessage(userId, userNickname);
        }, 100);
        
        resolve();
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 오류:', frame);
        this.isConnected = false;
        reject(new Error(`STOMP Error: ${frame.headers['message']}`));
      },
      onWebSocketError: (error) => {
        console.error('❌ WebSocket 오류:', error);
        this.isConnected = false;
        reject(error);
      },
      onDisconnect: () => {
        console.log('🔌 STOMP 연결 해제');
        this.isConnected = false;
      }
    });

            // 연결 활성화
        this.stompClient.activate();
  }

  /**
   * JOIN 메시지 전송
   */
  private sendJoinMessage(userId: number, userNickname: string): void {
    if (!this.stompClient || !this.isConnected) return;

    const joinMessage = {
      type: 'JOIN',
      chatRoomId: this.currentChatRoomId,
      senderId: userId,
      senderNickname: userNickname,
      messageType: 'SYSTEM',
      content: `${userNickname}님이 채팅방에 참여했습니다.`
    };

    console.log('🚪 JOIN 메시지 전송:', joinMessage);
    
    // JWT 토큰 가져오기
    const token = getAccessToken();
    console.log('JOIN 메시지 JWT 토큰:', token ? token.substring(0, 50) + '...' : '없음');
    
    // Spring Boot STOMP 엔드포인트로 전송 (JWT 토큰 포함)
    this.stompClient.publish({
      destination: '/app/chat.join', // 백엔드 @MessageMapping("/chat.join")
      body: JSON.stringify(joinMessage),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * 채팅 메시지 전송 (수정된 버전)
   */
  sendMessage(content: string): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('STOMP 연결이 없습니다');
      return;
    }

    // 사용자 정보 검증
    if (!this.currentUserId || !this.currentUserNickname) {
      console.error('사용자 정보가 없습니다');
      return;
    }

    const messageData = {
      type: 'MESSAGE',
      chatRoomId: this.currentChatRoomId,
      senderId: this.currentUserId, // 저장된 사용자 ID 사용
      senderNickname: this.currentUserNickname, // 저장된 닉네임 사용
      messageType: 'TEXT',
      content: content
    };

    console.log('STOMP 메시지 전송:', messageData);
    console.log(`전송자 정보: ID=${this.currentUserId}, 닉네임=${this.currentUserNickname}`); // 디버깅 로그
    
    // JWT 토큰 가져오기
    const token = getAccessToken();
    console.log('메시지 전송 JWT 토큰:', token ? token.substring(0, 50) + '...' : '없음');
    
    // Spring Boot STOMP 엔드포인트로 전송 (JWT 토큰 포함)
    this.stompClient.publish({
      destination: '/app/chat.message', // 백엔드 @MessageMapping("/chat.message")
      body: JSON.stringify(messageData),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * 수신된 메시지 처리 (디버깅 강화)
   */
  private handleReceivedMessage(data: any): void {
    console.log('🎯 handleReceivedMessage 시작, 원본 데이터:', data);
    console.log('🎯 onMessageCallback 존재 여부:', !!this.onMessageCallback);
    
    if (!this.onMessageCallback) {
      console.error('❌ onMessageCallback이 설정되지 않았습니다!');
      return;
    }

    // 삭제 이벤트 처리
    if (data.type === 'DELETE') {
      console.log('삭제 이벤트 수신:', data);
      const deleteMessage: ChatMessage = {
        id: data.messageId,
        chatRoomId: data.chatRoomId || this.currentChatRoomId!,
        memberId: data.senderId || 0,
        messageType: 'TEXT',
        content: '삭제된 메시지입니다.',
        createdAt: new Date().toISOString(),
        senderNickname: data.senderNickname || '알 수 없음',
        isMyMessage: false,
        isDeleted: true
      };
      this.onMessageCallback(deleteMessage);
      return;
    }

    // JOIN/LEAVE 시스템 메시지 처리
    if (data.type === 'USER_JOIN' || data.type === 'USER_LEAVE') {
      console.log('시스템 메시지 수신:', data);
      const systemMessage: ChatMessage = {
        id: data.messageId || Date.now(),
        chatRoomId: data.chatRoomId || this.currentChatRoomId!,
        memberId: data.senderId || 0,
        messageType: 'SYSTEM',
        content: data.content || data.message || '',
        createdAt: data.createdAt || new Date().toISOString(),
        senderNickname: data.senderNickname || '시스템',
        isMyMessage: false, // 시스템 메시지는 항상 false
        isDeleted: false
      };
      this.onMessageCallback(systemMessage);
      return;
    }

    // 일반 메시지 처리
    const senderId = Number(data.senderId || data.memberId || 0);
    const currentUserId = Number(this.currentUserId || 0);

    // isMyMessage 계산 (숫자 타입으로 정확히 비교)
    const isMyMessage = senderId === currentUserId;

    console.log(`메시지 처리: 발신자=${senderId}, 현재사용자=${currentUserId}, 내메시지=${isMyMessage}`);

    const chatMessage: ChatMessage = {
      id: data.messageId || data.id || 0,
      chatRoomId: data.chatRoomId || this.currentChatRoomId!,
      memberId: senderId,
      messageType: data.messageType || 'TEXT',
      content: data.content || data.message || '',
      createdAt: data.createdAt || new Date().toISOString(),
      senderNickname: data.senderNickname || data.sender || '알 수 없음',
      isMyMessage: isMyMessage,
      isDeleted: data.isDeleted || false
    };

    console.log('변환된 ChatMessage:', chatMessage);
    this.onMessageCallback(chatMessage);
  }

  /**
   * 테스트 메시지 전송 (디버깅용)
   */
  sendTestMessage(content: string): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('STOMP 연결이 없습니다');
      return;
    }

    const testData = {
      type: 'TEST',
      chatRoomId: this.currentChatRoomId,
      senderId: this.currentUserId || 999,
      senderNickname: this.currentUserNickname || '테스터',
      messageType: 'TEXT',
      content: content
    };

    console.log('테스트 메시지 전송:', testData);
    
    this.stompClient.publish({
      destination: '/app/chat.test', // 테스트 엔드포인트
      body: JSON.stringify(testData)
    });
  }

  /**
   * LEAVE 메시지 전송 및 연결 해제
   */
  disconnect(): void {
    if (this.stompClient && this.isConnected) {
      // LEAVE 메시지 전송
      const leaveMessage = {
        type: 'LEAVE',
        chatRoomId: this.currentChatRoomId,
        senderId: this.currentUserId, // 사용자 ID 추가
        senderNickname: this.currentUserNickname, // 닉네임 추가
        messageType: 'SYSTEM'
      };

      // JWT 토큰 가져오기
      const token = getAccessToken();
      console.log('LEAVE 메시지 JWT 토큰:', token ? token.substring(0, 50) + '...' : '없음');
      
      try {
        this.stompClient.publish({
          destination: '/app/chat.leave', // 백엔드 @MessageMapping("/chat.leave")
          body: JSON.stringify(leaveMessage),
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('LEAVE 메시지 전송 실패:', error);
      }

      // 연결 해제
      this.stompClient.deactivate();
    }

    this.isConnected = false;
    this.currentChatRoomId = null;
    this.currentUserId = null; // 사용자 정보 초기화
    this.currentUserNickname = null; // 사용자 정보 초기화
    this.onMessageCallback = null;
    this.stompClient = null;
  }

  /**
   * 연결 상태 확인
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * 현재 사용자 정보 확인 (디버깅용)
   */
  getCurrentUserInfo(): { userId: number | null; nickname: string | null } {
    return {
      userId: this.currentUserId,
      nickname: this.currentUserNickname
    };
  }
}

export const stompWebSocketService = new StompWebSocketService();
