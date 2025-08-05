import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import type { ChatMessage } from './chatService';

class StompWebSocketService {
  private stompClient: Client | null = null;
  private isConnected: boolean = false;
  private currentChatRoomId: number | null = null;
  private currentUserId: number | null = null; // 🎯 추가: 사용자 ID 저장
  private currentUserNickname: string | null = null; // 🎯 추가: 사용자 닉네임 저장
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
    return new Promise((resolve, reject) => {
      console.log(`🔗 STOMP 연결 시도: 채팅방 ${chatRoomId}`);

      // 기존 연결 해제
      if (this.stompClient) {
        this.disconnect();
      }

      // 🎯 사용자 정보 저장 (토큰 기반으로 고유 식별)
      const token = localStorage.getItem('accessToken');
      this.currentChatRoomId = chatRoomId;
      this.currentUserId = userId;
      this.currentUserNickname = userNickname;
      this.onMessageCallback = onMessage;

      console.log(`🎯 사용자 정보 저장: ID=${userId}, 닉네임=${userNickname}, 토큰=${token?.substring(0, 20)}...`); // 🎯 디버깅 로그

      // 🎯 SockJS 객체 생성 (Spring Boot 엔드포인트)
      const socket = new SockJS('http://localhost:8081/ws');
      
      // 🎯 STOMP 클라이언트 생성
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          // 🎯 JWT 토큰을 헤더로 전송 (STOMP는 지원함)
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
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
          
          // 🎯 채팅방 구독
          this.stompClient?.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
            try {
              console.log('🔔 STOMP 원본 메시지 수신:', message); // 🎯 디버깅 로그 추가
              console.log('🔔 메시지 body:', message.body); // 🎯 디버깅 로그 추가
              
              const chatData = JSON.parse(message.body);
              console.log('📨 STOMP 메시지 수신:', chatData);
              this.handleReceivedMessage(chatData);
            } catch (error) {
              console.error('❌ 메시지 파싱 실패:', error);
            }
          });

          // 🎯 개인 메시지 구독 제거 (중복 방지)
          // this.stompClient?.subscribe(`/user/queue/messages`, (message) => {
          //   // 중복 메시지 방지를 위해 제거
          // });

          // 🎯 JOIN 메시지 전송
          this.sendJoinMessage(userId, userNickname);
          
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

      // 🎯 연결 활성화
      this.stompClient.activate();
    });
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
    
    // 🎯 Spring Boot STOMP 엔드포인트로 전송
    this.stompClient.publish({
      destination: '/app/chat.join', // 백엔드 @MessageMapping("/chat.join")
      body: JSON.stringify(joinMessage)
    });
  }

  /**
   * 채팅 메시지 전송 (수정된 버전)
   */
  sendMessage(content: string): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('❌ STOMP 연결이 없습니다');
      return;
    }

    // 🎯 사용자 정보 검증
    if (!this.currentUserId || !this.currentUserNickname) {
      console.error('❌ 사용자 정보가 없습니다');
      return;
    }

    const messageData = {
      type: 'MESSAGE',
      chatRoomId: this.currentChatRoomId,
      senderId: this.currentUserId, // 🎯 저장된 사용자 ID 사용
      senderNickname: this.currentUserNickname, // 🎯 저장된 닉네임 사용
      messageType: 'TEXT',
      content: content
    };

    console.log('📤 STOMP 메시지 전송:', messageData);
    console.log(`🎯 전송자 정보: ID=${this.currentUserId}, 닉네임=${this.currentUserNickname}`); // 🎯 디버깅 로그
    
    // 🎯 Spring Boot STOMP 엔드포인트로 전송
    this.stompClient.publish({
      destination: '/app/chat.message', // 백엔드 @MessageMapping("/chat.message")
      body: JSON.stringify(messageData)
    });
  }

  /**
   * 수신된 메시지 처리 (디버깅 강화)
   */
  private handleReceivedMessage(data: any): void {
    if (!this.onMessageCallback) return;

    console.log('🎯 handleReceivedMessage 시작, 원본 데이터:', data); // 🎯 디버깅 로그

    // 🎯 백엔드 응답을 ChatMessage 형태로 변환
    const senderId = data.senderId || data.memberId || 0;
    const currentToken = localStorage.getItem('accessToken');
    
    // 🎯 JWT 토큰에서 사용자 ID 추출 (백엔드 수정 후)
    let currentUserIdFromToken = this.currentUserId;
    try {
      if (currentToken) {
        const tokenPayload = JSON.parse(atob(currentToken.split('.')[1]));
        console.log('🎯 토큰 페이로드:', tokenPayload);
        
        // 🎯 백엔드에서 수정된 후 - memberId가 숫자로 저장되어 있을 것
        const memberId = tokenPayload.memberId || tokenPayload.sub || tokenPayload.id;
        console.log('🎯 추출된 memberId:', memberId, '타입:', typeof memberId);
        
        if (typeof memberId === 'number') {
          currentUserIdFromToken = memberId;
        } else if (typeof memberId === 'string' && !isNaN(Number(memberId))) {
          currentUserIdFromToken = Number(memberId);
        } else {
          // 🎯 저장된 사용자 ID 사용 (connect 시점에 저장된 값)
          currentUserIdFromToken = this.currentUserId;
          console.log('🎯 토큰에서 ID 추출 실패, 저장된 ID 사용:', currentUserIdFromToken);
        }
        console.log(`🎯 최종 사용자 ID: ${currentUserIdFromToken} (타입: ${typeof currentUserIdFromToken})`);
      }
    } catch (error) {
      console.warn('토큰 파싱 실패, 저장된 사용자 ID 사용:', error);
      currentUserIdFromToken = this.currentUserId;
    }
    
    // 🎯 정확한 사용자 구분 (백엔드 senderId 문제 임시 해결)
    // 백엔드에서 senderId가 모두 1로 설정되는 문제가 있음
    // 임시로 발신자 닉네임으로 구분
    const isMyMessage = data.senderNickname === this.currentUserNickname;
    console.log(`🎯 비교: senderNickname("${data.senderNickname}") === currentUserNickname("${this.currentUserNickname}") = ${isMyMessage}`);
    console.log(`🎯 발신자 닉네임: "${data.senderNickname}" (이제 닉네임이 표시되어야 함)`);
    
    const chatMessage: ChatMessage = {
      id: data.messageId || data.id || Date.now(),
      chatRoomId: data.chatRoomId || this.currentChatRoomId!,
      memberId: senderId,
      messageType: data.messageType || 'TEXT',
      content: data.content || data.message || '',
      createdAt: data.createdAt || new Date().toISOString(),
      senderNickname: data.senderNickname || data.sender || '알 수 없음',
      isMyMessage: isMyMessage
    };

    console.log(`🎯 메시지 발신자 ID: ${senderId}, 현재 사용자 ID: ${currentUserIdFromToken}, 내 메시지: ${isMyMessage}, 토큰: ${currentToken?.substring(0, 20)}...`);
    console.log(`🎯 발신자 닉네임: "${data.senderNickname}" (원본: "${data.sender}")`);

    console.log('🎯 변환된 ChatMessage:', chatMessage); // 🎯 디버깅 로그
    this.onMessageCallback(chatMessage);
  }

  /**
   * 테스트 메시지 전송 (디버깅용)
   */
  sendTestMessage(content: string): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('❌ STOMP 연결이 없습니다');
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

    console.log('🧪 테스트 메시지 전송:', testData);
    
    this.stompClient.publish({
      destination: '/app/chat.test', // 🎯 테스트 엔드포인트
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
        senderId: this.currentUserId, // 🎯 사용자 ID 추가
        senderNickname: this.currentUserNickname, // 🎯 닉네임 추가
        messageType: 'SYSTEM'
      };

      try {
        this.stompClient.publish({
          destination: '/app/chat.leave', // 백엔드 @MessageMapping("/chat.leave")
          body: JSON.stringify(leaveMessage)
        });
      } catch (error) {
        console.error('❌ LEAVE 메시지 전송 실패:', error);
      }

      // 연결 해제
      this.stompClient.deactivate();
    }

    this.isConnected = false;
    this.currentChatRoomId = null;
    this.currentUserId = null; // 🎯 사용자 정보 초기화
    this.currentUserNickname = null; // 🎯 사용자 정보 초기화
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
