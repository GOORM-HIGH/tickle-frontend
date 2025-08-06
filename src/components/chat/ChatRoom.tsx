import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { MessageSearch } from './MessageSearch';
import { ConnectionStatus } from './ConnectionStatus';
import { stompWebSocketService } from '../../services/stompWebSocketService';
import { chatService } from '../../services/chatService';
import type { ChatRoom as ChatRoomType, ChatMessage as ChatMessageType } from '../../services/chatService';

interface Props {
  room: ChatRoomType;
  currentUserId: number;
  currentUserNickname: string;
  onClose: () => void;
  onMessageUpdate: (messageId: number, updatedMessage: ChatMessageType) => void;
  onMessageDelete: (messageId: number) => void;
}

export const ChatRoom: React.FC<Props> = ({
  room,
  currentUserId,
  currentUserNickname,
  onClose,
  onMessageUpdate,
  onMessageDelete,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessageType[]>([]);
  const [lastConnected, setLastConnected] = useState<Date | undefined>();
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // 자동 스크롤 (강화)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToBottomImmediate = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  // 🎯 자동 스크롤 체크
  const shouldAutoScroll = useCallback(() => {
    if (!messagesContainerRef.current) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px 이내면 맨 아래로 간주
    
    return isNearBottom;
  }, []);

  // 스크롤 위치 저장
  const saveScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      scrollPositionRef.current = messagesContainerRef.current.scrollTop;
    }
  }, []);

  // 스크롤 위치 복원
  const restoreScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, []);

  // 🎯 메시지 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    // 메시지 변경 시 displayedMessages 업데이트
    setDisplayedMessages(messages);
  }, [messages]);

  // 🎯 초기 메시지가 있으면 로딩 상태 해제
  useEffect(() => {
    if (messages.length > 0) {
      setIsLoading(false);
      console.log(`📄 초기 메시지 ${messages.length}개 로드됨`);
    }
  }, [messages]);

  // 메시지 로드 (백엔드 수정 후)
  const loadMessages = useCallback(async (page: number = 0, append: boolean = false) => {
    try {
      setIsLoadingMore(true);
      console.log(`📄 메시지 로딩 시작: 채팅방 ${room.chatRoomId}, 페이지 ${page}`);
      
      const newMessages = await chatService.getMessages(room.chatRoomId, page, 20);
      console.log(`📄 로딩된 메시지: ${newMessages.length}개`);
      
      if (append) {
        // 이전 메시지를 앞에 추가 (중복 제거 포함)
        setMessages(prev => {
          const existingIds = new Set(prev.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
          const combined = [...uniqueNewMessages, ...prev];
          console.log(`📄 추가 페이지 메시지 병합: 기존 ${prev.length}개 + 새로 ${uniqueNewMessages.length}개 = ${combined.length}개`);
          return combined;
        });
        setHasMoreMessages(newMessages.length === 20);
      } else {
        // 초기 로드 시 메시지를 시간순으로 정렬 (최신이 아래로)
        const sortedMessages = newMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        setHasMoreMessages(newMessages.length === 20);
      }
      
      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [room.chatRoomId]);

  // 검색 결과 처리
  const handleSearchResult = useCallback((filteredMessages: ChatMessageType[]) => {
    setDisplayedMessages(filteredMessages);
  }, []);

  // 더 많은 메시지 로드
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    saveScrollPosition();
    await loadMessages(currentPage + 1, true);
    setTimeout(restoreScrollPosition, 100);
  }, [isLoadingMore, hasMoreMessages, currentPage, loadMessages, saveScrollPosition, restoreScrollPosition]);

  // 읽음 처리 (마지막으로 본 메시지 ID를 기준으로 처리)
  const handleMarkAsRead = useCallback(async (messageId: number) => {
    try {
      console.log(`📖 읽음 처리: 메시지 ID ${messageId} (채팅방 ${room.chatRoomId})`);
      await chatService.markAsRead(room.chatRoomId, messageId);
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  }, [room.chatRoomId]);

  // 채팅방 나갈 때 화면에 보이는 마지막 메시지 읽음 처리
  const handleLeaveChatRoom = useCallback(async () => {
    console.log(`🚪 채팅방 나가기 시작: ${room.chatRoomId}`);
    console.log(`🚪 현재 메시지 개수: ${messages.length}`);
    
    if (messages.length > 0) {
      // 🎯 화면에 보이는 메시지들 중 마지막 메시지 찾기
      const visibleMessages = messages.filter(msg => !msg.isDeleted);
      const lastVisibleMessage = visibleMessages[visibleMessages.length - 1];
      
      if (lastVisibleMessage) {
        console.log(`🚪 화면 마지막 메시지 읽음 처리 시작: ID=${lastVisibleMessage.id}, 내용="${lastVisibleMessage.content}"`);
        
        try {
          await chatService.markAsRead(room.chatRoomId, lastVisibleMessage.id);
          console.log(`✅ 읽음 처리 완료: 채팅방 ${room.chatRoomId}, 메시지 ${lastVisibleMessage.id}`);
        } catch (error) {
          console.error(`❌ 읽음 처리 실패:`, error);
        }
      } else {
        console.log(`🚪 화면에 보이는 메시지가 없음: 채팅방 ${room.chatRoomId}`);
      }
    } else {
      console.log(`🚪 읽을 메시지가 없음: 채팅방 ${room.chatRoomId}`);
    }
  }, [messages, room.chatRoomId]);

  // 새 메시지 수신 처리 (중복 제거 강화)
  const handleNewMessage = useCallback((message: ChatMessageType) => {
    console.log('📨 새 메시지 수신:', message);
    console.log(`🎯 현재 채팅방: ${room.chatRoomId}, 메시지 채팅방: ${message.chatRoomId}`);
    
    // 현재 채팅방의 메시지만 처리
    if (message.chatRoomId === room.chatRoomId) {
      setMessages(prev => {
        // 🎯 삭제된 메시지 처리
        if (message.isDeleted) {
          console.log(`🗑️ 삭제된 메시지 처리: ID=${message.id}`);
          return prev.map(existingMessage => 
            existingMessage.id === message.id 
              ? { ...existingMessage, isDeleted: true, content: '삭제된 메시지입니다.' }
              : existingMessage
          );
        }
        
        // 🎯 중복 메시지 제거 (messageId 기준)
        const isDuplicate = prev.some(existingMessage => existingMessage.id === message.id);
        if (isDuplicate) {
          console.log(`⚠️ 중복 메시지 무시: ID=${message.id}`);
          return prev;
        }
        
        // 🎯 추가 중복 체크 (내용과 시간으로도 체크)
        const isContentDuplicate = prev.some(existingMessage => 
          existingMessage.content === message.content && 
          Math.abs(new Date(existingMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000
        );
        
        if (isContentDuplicate) {
          console.log(`⚠️ 내용 중복 메시지 무시: ID=${message.id}, 내용="${message.content}"`);
          return prev;
        }
        
        console.log(`✅ 새 메시지 추가: ID=${message.id}, 발신자=${message.senderNickname}, 내 메시지=${message.isMyMessage}`);
        return [...prev, message];
      });
    } else {
      console.log(`⚠️ 다른 채팅방 메시지 무시: ${message.chatRoomId} vs ${room.chatRoomId}`);
    }
  }, [room.chatRoomId]);

  // WebSocket 연결
  const connectWebSocket = useCallback(async () => {
    try {
      setConnectionAttempts(prev => prev + 1);
      await stompWebSocketService.connect(
        room.chatRoomId,
        currentUserId,
        currentUserNickname,
        handleNewMessage
      );
      setIsConnected(true);
      setLastConnected(new Date());
      setConnectionAttempts(0);
      setError(null);
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      setError('실시간 연결에 실패했습니다.');
      setIsConnected(false);
    }
  }, [room.chatRoomId, currentUserId, currentUserNickname, handleNewMessage]);

  // 메시지 전송
  const handleSendMessage = useCallback(async (content: string, messageType: 'TEXT' | 'FILE' | 'IMAGE' = 'TEXT') => {
    if (!content.trim()) return;

    try {
      if (isConnected) {
        // STOMP로 실시간 전송
        stompWebSocketService.sendMessage(content);
      } else {
        // REST API 사용
        const newMessage = await chatService.sendMessage(room.chatRoomId, content);
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  }, [isConnected, room.chatRoomId]);

  // 파일 업로드 처리
  const handleFileUploaded = useCallback(async (fileInfo: {fileId: string; fileName: string; fileUrl: string}) => {
    try {
      const messageContent = `📎 ${fileInfo.fileName}`;
      await handleSendMessage(messageContent, 'FILE');
    } catch (error) {
      console.error('파일 메시지 전송 실패:', error);
      alert('파일 메시지 전송에 실패했습니다.');
    }
  }, [handleSendMessage]);

  // 메시지 수정 처리
  const handleMessageUpdate = useCallback((messageId: number, updatedMessage: ChatMessageType) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? updatedMessage : msg
    ));
    onMessageUpdate(messageId, updatedMessage);
  }, [onMessageUpdate]);

  // 메시지 삭제 처리
  const handleMessageDelete = useCallback((messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    onMessageDelete(messageId);
  }, [onMessageDelete]);

  // 스크롤 이벤트 처리
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 100 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  // 초기화
  useEffect(() => {
    loadMessages();
    connectWebSocket();

    return () => {
      stompWebSocketService.disconnect();
    };
  }, [loadMessages, connectWebSocket]);

  // 연결 상태 모니터링
  useEffect(() => {
    const checkConnection = () => {
      const isWebSocketConnected = stompWebSocketService.getConnectionStatus();
      setIsConnected(isWebSocketConnected);
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '12px'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ margin: 0 }}>{room.name || `채팅방 ${room.chatRoomId}`}</h3>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
            <div>메시지를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: '12px'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0' }}>
            {room.name || `채팅방 ${room.chatRoomId}`}
          </h3>
          <div style={{ fontSize: '14px', color: '#666' }}>
            👥 {room.participantCount || 0}명 참여 중
          </div>
          <div style={{ marginTop: '5px' }}>
            <ConnectionStatus
              isConnected={isConnected}
              lastConnected={lastConnected}
              connectionAttempts={connectionAttempts}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
              color: showSearch ? '#007bff' : '#666'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="메시지 검색"
          >
            🔍
          </button>
                  <button
          onClick={async () => {
            console.log('🔘 X 버튼 클릭됨 - 채팅방 나가기 시작');
            await handleLeaveChatRoom();
            console.log('🔘 채팅방 닫기 실행');
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="채팅방 닫기 (읽음 처리 포함)"
        >
          ✕
        </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderBottom: '1px solid #f5c6cb',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 메시지 영역 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#f8f9fa',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {/* 검색 컴포넌트 */}
        {showSearch && (
          <MessageSearch
            messages={messages}
            onSearchResult={handleSearchResult}
            onClose={() => setShowSearch(false)}
          />
        )}
        {/* 더 많은 메시지 로드 버튼 */}
        {hasMoreMessages && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
              📄 페이지 {currentPage + 1} • 메시지 {messages.length}개 • 더 로드 가능
            </div>
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              style={{
                padding: '8px 16px',
                backgroundColor: isLoadingMore ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isLoadingMore ? '로딩 중...' : '이전 메시지 더보기'}
            </button>
          </div>
        )}

        {/* 메시지 목록 */}
        {displayedMessages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
            <h3>메시지가 없습니다</h3>
            <p>첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          <>
            {displayedMessages.map((message, index) => (
              <ChatMessage
                key={`${message.id}-${index}`}
                message={message}
                chatRoomId={room.chatRoomId}
                onMessageUpdate={handleMessageUpdate}
                onMessageDelete={handleMessageDelete}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 입력 영역 */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #eee',
        backgroundColor: 'white'
      }}>
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileUploaded={handleFileUploaded}
          disabled={!isConnected}
          placeholder={isConnected ? "메시지를 입력하세요..." : "연결을 기다리는 중..."}
        />
      </div>
    </div>
  );
}; 