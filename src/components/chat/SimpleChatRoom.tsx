import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { MessageSearch } from './MessageSearch';
import { ConnectionStatus } from './ConnectionStatus';
import { FileUpload } from './FileUpload';
import { stompWebSocketService } from '../../services/stompWebSocketService';
import { chatService } from '../../services/chatService';
import type { ChatRoom, ChatMessage as ChatMessageType } from '../../services/chatService';

interface Props {
  room: ChatRoom;
  currentUserId: number;
  currentUserNickname: string;
  onClose: () => void;
  onMessageUpdate: (messageId: number, updatedMessage: ChatMessageType) => void;
  onMessageDelete: (messageId: number) => void;
}

export const SimpleChatRoom: React.FC<Props> = ({
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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessageType[]>([]);
  
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
      console.log(`📄 메시지 상세:`, newMessages);
      
      // 🎯 삭제된 메시지 확인
      const deletedMessages = newMessages.filter(msg => msg.isDeleted);
      console.log(`📄 삭제된 메시지: ${deletedMessages.length}개`, deletedMessages);
      
      if (append) {
        // 이전 메시지를 앞에 추가 (중복 제거 포함)
        setMessages(prev => {
          const existingIds = new Set(prev.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
          return [...uniqueNewMessages, ...prev];
        });
      } else {
        setMessages(newMessages);
      }
      
      // 더 불러올 메시지가 있는지 확인
      setHasMoreMessages(newMessages.length === 20);
      setCurrentPage(page);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      // 테스트용 메시지
      const testMessages: ChatMessageType[] = [
        {
          id: 1,
          chatRoomId: room.chatRoomId,
          memberId: 1,
          messageType: 'TEXT',
          content: '안녕하세요! 채팅방에 오신 것을 환영합니다! 👋',
          createdAt: new Date(Date.now() - 60000).toISOString(),
          senderNickname: '시스템',
          isMyMessage: false,
        },
        {
          id: 2,
          chatRoomId: room.chatRoomId,
          memberId: currentUserId,
          messageType: 'TEXT',
          content: '안녕하세요! 반갑습니다! 😊',
          createdAt: new Date(Date.now() - 30000).toISOString(),
          senderNickname: currentUserNickname,
          isMyMessage: true,
        },
      ];
      setMessages(testMessages);
    } finally {
      setIsLoadingMore(false);
    }
  }, [room.chatRoomId, currentUserId, currentUserNickname]);

  // 더 많은 메시지 로드
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    const nextPage = currentPage + 1;
    await loadMessages(nextPage, true);
  }, [isLoadingMore, hasMoreMessages, currentPage, loadMessages]);

  // 읽음 처리
  const handleMarkAsRead = useCallback(async (messageId: number) => {
    try {
      await chatService.markAsRead(room.chatRoomId, messageId);
      console.log(`✅ 메시지 ${messageId} 읽음 처리 완료`);
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  }, [room.chatRoomId]);

  // 새 메시지 수신 처리 (고급 중복 제거 포함)
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
    // 🎯 삭제된 메시지를 화면에서 제거하지 않고 "삭제된 메시지입니다"로 표시
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: '삭제된 메시지입니다.', isDeleted: true }
        : msg
    ));
    onMessageDelete(messageId);
  }, [onMessageDelete]);

  // 메시지 검색
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      const filtered = messages.filter(msg => 
        msg.content.toLowerCase().includes(keyword.toLowerCase()) ||
        msg.senderNickname.toLowerCase().includes(keyword.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [messages]);

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
    const initializeChatRoom = async () => {
      try {
        // 1. 메시지 로드
        await loadMessages();
        
        // 2. WebSocket 연결
        await connectWebSocket();
        
        // 3. 🎯 읽음 처리 (채팅방 입장 시)
        try {
          console.log('📖 채팅방 입장 - 읽음 처리 시작');
          // 모든 메시지를 읽음 처리 (가장 최근 메시지 ID 사용)
          if (messages.length > 0) {
            const latestMessageId = Math.max(...messages.map(m => m.id));
            await chatService.markAsRead(room.chatRoomId, latestMessageId);
            console.log('📖 읽음 처리 완료 - 최근 메시지 ID:', latestMessageId);
            
            // 🎯 로컬 상태에서도 읽음 처리
            setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
          } else {
            console.log('📖 읽을 메시지가 없음');
          }
        } catch (error) {
          console.error('📖 읽음 처리 실패:', error);
        }
        
        // 4. 🎯 채팅방 목록 새로고침 (읽음 처리 후)
        try {
          console.log('🔄 채팅방 목록 새로고침 시작');
          // 부모 컴포넌트의 loadMyChatRooms 호출을 위해 이벤트 발생
          window.dispatchEvent(new CustomEvent('chatRoomListRefresh'));
          console.log('🔄 채팅방 목록 새로고침 이벤트 발생');
          
          // 🎯 강제 새로고침 (읽음 처리 확실히 반영)
          setTimeout(() => {
            console.log('🔄 강제 새로고침 실행');
            window.dispatchEvent(new CustomEvent('chatRoomListRefresh'));
          }, 1000);
        } catch (error) {
          console.error('🔄 채팅방 목록 새로고침 실패:', error);
        }
      } catch (error) {
        console.error('채팅방 초기화 실패:', error);
      }
    };

    initializeChatRoom();

    return () => {
      stompWebSocketService.disconnect();
    };
  }, [loadMessages, connectWebSocket, room.chatRoomId]);

  // 연결 상태 모니터링
  useEffect(() => {
    const checkConnection = () => {
      const isWebSocketConnected = stompWebSocketService.getConnectionStatus();
      setIsConnected(isWebSocketConnected);
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // 자동 스크롤 처리
  useEffect(() => {
    if (shouldAutoScroll()) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8f9fa'
    }}>
      {/* 헤더 없음 - 모달 헤더만 사용 */}

      {/* 검색 영역 */}
      {showSearch && (
        <div style={{
          padding: '10px',
          backgroundColor: 'white',
          borderBottom: '1px solid #eee',
        }}>
          <MessageSearch
            messages={messages}
            onSearchResult={(filteredMessages) => setDisplayedMessages(filteredMessages)}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* 연결 상태 표시 */}
      <ConnectionStatus
        isConnected={isConnected}
        lastConnected={lastConnected}
        connectionAttempts={connectionAttempts}
      />

      {/* 메시지 영역 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>메시지를 불러오는 중...</p>
          </div>
        ) : displayedMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <p>아직 메시지가 없습니다.</p>
            <p>첫 번째 메시지를 보내보세요! 💬</p>
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
        padding: '10px',
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
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

export default SimpleChatRoom; 