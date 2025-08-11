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
    console.log(`🔗 STOMP 연결 시도: 채팅방 ${chatRoomId}, 사용자 ID ${userId}, 닉네임 ${userNickname}`);
    return new Promise((resolve, reject) => {
      console.log(`🔗 STOMP 연결 시도: 채팅방 ${chatRoomId}`);

      // 🎯 기존 연결 해제 (중복 방지)
      if (this.stompClient) {
        console.log('🔗 기존 STOMP 연결 해제 중...');
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
        
        // 🎯 채팅방 구독 (먼저 구독 설정)
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

        // 🎯 구독 설정 후 잠시 대기 후 JOIN 메시지 전송
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

    // 🎯 연결 활성화
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
    
    // 🎯 JWT 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    console.log('🎯 JOIN 메시지 JWT 토큰:', token ? token.substring(0, 50) + '...' : '없음');
    
    // 🎯 Spring Boot STOMP 엔드포인트로 전송 (JWT 토큰 포함)
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
    
    // 🎯 JWT 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    console.log('🎯 메시지 전송 JWT 토큰:', token ? token.substring(0, 50) + '...' : '없음');
    
    // 🎯 Spring Boot STOMP 엔드포인트로 전송 (JWT 토큰 포함)
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
    if (!this.onMessageCallback) return;

    console.log('🎯 handleReceivedMessage 시작, 원본 데이터:', data); // �� 디버깅 로그

    // 🎯 삭제 이벤트 처리
    if (data.type === 'DELETE') {
      console.log('🗑️ 삭제 이벤트 수신:', data);
      const deleteMessage: ChatMessage = {
        id: data.messageId,
        chatRoomId: data.chatRoomId || this.currentChatRoomId!,
        memberId: data.senderId || 0,
        messageType: 'TEXT',
        content: '삭제된 메시지입니다.',
        createdAt: new Date().toISOString(),
        senderNickname: data.senderNickname || '알 수 없음',
        isMyMessage: false,
        isDeleted: true // 삭제된 메시지 표시
      };
      this.onMessageCallback(deleteMessage);
      return;
    }

    // 🎯 백엔드 응답을 ChatMessage 형태로 변환
    const senderId = data.senderId || data.memberId || 0;
    
    // 🎯 JWT에서 직접 userId 추출
    let currentUserIdFromToken = this.currentUserId;
    
    try {
      const currentToken = localStorage.getItem('accessToken');
      if (currentToken) {
        const base64Url = currentToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const tokenPayload = JSON.parse(jsonPayload);
        
        console.log('🎯 JWT 페이로드:', tokenPayload);
        
        // 🎯 JWT에서 직접 userId 추출
        if (tokenPayload.userId) {
          currentUserIdFromToken = tokenPayload.userId;
          console.log(`🎯 JWT에서 직접 추출한 userId: ${tokenPayload.userId}`);
        } else {
          console.warn('🎯 JWT에 userId가 없음, 저장된 사용자 정보 사용');
          // fallback: 저장된 사용자 정보 사용
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            currentUserIdFromToken = user.id;
            console.log(`🎯 저장된 사용자 정보 사용: ID=${user.id}, 닉네임=${user.nickname}`);
          }
        }
      }
      console.log(`🎯 최종 사용자 ID: ${currentUserIdFromToken} (타입: ${typeof currentUserIdFromToken})`);
    } catch (error) {
      console.warn('사용자 정보 추출 실패, 저장된 사용자 ID 사용:', error);
      currentUserIdFromToken = this.currentUserId;
    }
    
    // 🎯 isMyMessage 판단 (senderId로만 체크)
    const isMyMessage = senderId === currentUserIdFromToken;
    
    console.log(`🎯 최종 isMyMessage: ${isMyMessage}`);
    console.log(`🎯 발신자 정보: ID=${senderId}, 닉네임="${data.senderNickname}"`);
    console.log(`🎯 현재 사용자: ID=${currentUserIdFromToken}, 닉네임="${this.currentUserNickname}"`);
    
    // 🎯 디버깅: 모든 메시지가 내 메시지로 표시되는 문제 해결
    if (isMyMessage) {
      console.log(`🎯 내 메시지 확인: ID=${senderId}, 닉네임="${data.senderNickname}"`);
    } else {
      console.log(`🎯 상대방 메시지 확인: ID=${senderId}, 닉네임="${data.senderNickname}"`);
    }
    
    // 🎯 숫자 타입 비교를 위한 변환
    const senderIdNum = Number(senderId);
    const currentUserIdNum = Number(currentUserIdFromToken);
    const finalIsMyMessage = senderIdNum === currentUserIdNum;
    
    console.log(`🎯 숫자 변환 후 비교: ${senderIdNum} === ${currentUserIdNum} = ${finalIsMyMessage}`);
    
    const chatMessage: ChatMessage = {
      id: data.messageId || data.id || 0,
      chatRoomId: data.chatRoomId || this.currentChatRoomId!,
      memberId: senderId,
      messageType: data.messageType || 'TEXT',
      content: data.content || data.message || '',
      createdAt: data.createdAt || new Date().toISOString(),
      senderNickname: data.senderNickname || data.sender || '알 수 없음',
      isMyMessage: finalIsMyMessage // 🎯 숫자 변환 후 비교 결과 사용
    };

    console.log(`🎯 메시지 발신자 ID: ${senderId}, 현재 사용자 ID: ${currentUserIdFromToken}, 내 메시지: ${isMyMessage}`);
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

      // 🎯 JWT 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      console.log('🎯 LEAVE 메시지 JWT 토큰:', token ? token.substring(0, 50) + '...' : '없음');
      
      try {
        this.stompClient.publish({
          destination: '/app/chat.leave', // 백엔드 @MessageMapping("/chat.leave")
          body: JSON.stringify(leaveMessage),
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
