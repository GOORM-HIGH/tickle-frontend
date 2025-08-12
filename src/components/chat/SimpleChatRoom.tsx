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
  showSearch?: boolean; // 🎯 검색 상태 추가
  onSearchToggle?: (show: boolean) => void; // 🎯 검색 토글 함수 추가
}

export const SimpleChatRoom: React.FC<Props> = ({
  room,
  currentUserId,
  currentUserNickname,
  onClose,
  onMessageUpdate,
  onMessageDelete,
  showSearch = false, // 🎯 props에서 받아오기
  onSearchToggle, // 🎯 props에서 받아오기
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessageType[]>([]);
  const [lastConnected, setLastConnected] = useState<Date | undefined>();
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessageType[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false); // 🎯 읽지 않은 메시지 상태 추가
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // 자동 스크롤 (개선된 버전)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToBottomImmediate = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  // 🎯 읽지 않은 메시지 체크 함수
  const checkUnreadMessages = useCallback(() => {
    const unreadMessages = messages.filter(msg => !msg.isRead && !msg.isMyMessage);
    setHasUnreadMessages(unreadMessages.length > 0);
    console.log(`📖 읽지 않은 메시지: ${unreadMessages.length}개`);
  }, [messages]);

  // 🎯 읽지 않은 메시지로 스크롤하는 함수
  const scrollToUnreadMessages = useCallback(() => {
    const unreadMessages = messages.filter(msg => !msg.isRead && !msg.isMyMessage);
    if (unreadMessages.length > 0) {
      // 가장 오래된 읽지 않은 메시지 찾기
      const oldestUnreadMessage = unreadMessages.reduce((oldest, current) => 
        new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
      );
      
      console.log(`📖 가장 오래된 읽지 않은 메시지로 스크롤: ID=${oldestUnreadMessage.id}`);
      
      // 해당 메시지 요소 찾기
      const messageElement = document.querySelector(`[data-message-id="${oldestUnreadMessage.id}"]`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // 요소를 찾지 못하면 맨 아래로 스크롤
        scrollToBottom();
      }
    }
  }, [messages, scrollToBottom]);

  // 🎯 스크롤 위치 저장
  const saveScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      scrollPositionRef.current = messagesContainerRef.current.scrollTop;
    }
  }, []);

  // 🎯 스크롤 위치 복원
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

  // 🎯 메시지 변경 시 읽지 않은 메시지 체크
  useEffect(() => {
    checkUnreadMessages();
  }, [messages, checkUnreadMessages]);

  // 🎯 초기 메시지 로드 후 스크롤 처리
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      console.log(`📄 초기 메시지 ${messages.length}개 로드됨`);
      
      // 🎯 초기 로드 시에만 읽지 않은 메시지 체크 (새 메시지 수신 시에는 제외)
      const hasUnreadMessages = messages.some(msg => !msg.isRead && !msg.isMyMessage);
      if (hasUnreadMessages) {
        console.log('📖 읽지 않은 메시지가 있음 - 맨 아래로 스크롤');
        setTimeout(() => {
          scrollToBottomImmediate();
        }, 100);
      } else {
        console.log('📖 모든 메시지를 읽음 - 현재 위치 유지');
      }
    }
  }, [isLoading, scrollToBottomImmediate]); // 🎯 messages 의존성 제거

  // 메시지 로드 (개선된 버전)
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
          const updatedMessages = [...uniqueNewMessages, ...prev];
          
          // 🎯 이전 메시지 추가 시 스크롤 위치 복원
          setTimeout(() => {
            restoreScrollPosition();
          }, 100);
          
          return updatedMessages;
        });
      } else {
        // 🎯 초기 로드 시 스크롤 위치 저장
        saveScrollPosition();
        setMessages(newMessages);
        
        // 🎯 초기 로드 완료 후 로딩 상태 해제
        setIsLoading(false);
      }
      
      // 더 불러올 메시지가 있는지 확인
      setHasMoreMessages(newMessages.length === 20);
      setCurrentPage(page);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      setIsLoading(false);
      setIsLoadingMore(false);
      
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
  }, [room.chatRoomId, currentUserId, currentUserNickname, saveScrollPosition, restoreScrollPosition]);

  // 더 많은 메시지 로드
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    const nextPage = currentPage + 1;
    await loadMessages(nextPage, true);
  }, [isLoadingMore, hasMoreMessages, currentPage, loadMessages]);

  // 새 메시지 수신 처리 (개선된 버전)
  const handleNewMessage = useCallback((message: ChatMessageType) => {
    console.log('📨 새 메시지 수신:', message);
    
    // 현재 채팅방의 메시지만 처리
    if (message.chatRoomId === room.chatRoomId) {
      setMessages(prev => {
        // 삭제된 메시지 처리
        if (message.isDeleted) {
          console.log(`🗑️ 삭제된 메시지 처리: ID=${message.id}`);
          return prev.map(existingMessage => 
            existingMessage.id === message.id 
              ? { ...existingMessage, isDeleted: true, content: '삭제된 메시지입니다.' }
              : existingMessage
          );
        }
        
        // 중복 메시지 제거 (messageId 기준)
        const isDuplicate = prev.some(existingMessage => existingMessage.id === message.id);
        if (isDuplicate) {
          console.log(`⚠️ 중복 메시지 무시: ID=${message.id}`);
          return prev;
        }
        
        console.log(`✅ 새 메시지 추가: ID=${message.id}, 발신자=${message.senderNickname}, 내 메시지=${message.isMyMessage}`);
        const newMessages = [...prev, message];
        
        // 🎯 내 메시지만 자동 스크롤 (상대방 메시지는 스크롤 위치 강제 유지)
        setTimeout(() => {
          if (message.isMyMessage) {
            console.log('📜 내 메시지 - 자동 스크롤');
            scrollToBottom();
          } else {
            console.log('📜 상대방 메시지 - 스크롤 위치 강제 유지');
            // 🎯 상대방 메시지일 때는 현재 스크롤 위치를 강제로 유지
            if (messagesContainerRef.current) {
              const currentScrollTop = messagesContainerRef.current.scrollTop;
              const currentScrollHeight = messagesContainerRef.current.scrollHeight;
              const currentClientHeight = messagesContainerRef.current.clientHeight;
              
              // 스크롤 위치를 강제로 복원
              setTimeout(() => {
                if (messagesContainerRef.current) {
                  messagesContainerRef.current.scrollTop = currentScrollTop;
                }
              }, 10);
            }
          }
        }, 50);
        
        return newMessages;
      });
    } else {
      console.log(`⚠️ 다른 채팅방 메시지 무시: ${message.chatRoomId} vs ${room.chatRoomId}`);
    }
  }, [room.chatRoomId, scrollToBottom]);

  // 읽음 처리 (개선된 버전)
  const handleMarkAsRead = useCallback(async (messageId: number) => {
    try {
      await chatService.markAsRead(room.chatRoomId, messageId);
      console.log(`✅ 메시지 ${messageId} 읽음 처리 완료`);
      
      // 🎯 로컬 상태에서도 읽음 처리
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      
      // 🎯 채팅방 목록 새로고침
      window.dispatchEvent(new CustomEvent('chatRoomListRefresh'));
      
      // 🎯 강제 새로고침 (읽음 처리 확실히 반영)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('chatRoomListRefresh'));
      }, 1000);
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  }, [room.chatRoomId]);

  // 메시지 삭제 처리 (개선된 버전)
  const handleMessageDelete = useCallback((messageId: number) => {
    // 🎯 삭제된 메시지를 화면에서 제거하지 않고 "삭제된 메시지입니다"로 표시
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: '삭제된 메시지입니다.', isDeleted: true }
        : msg
    ));
    onMessageDelete(messageId);
  }, [onMessageDelete]);

  // 검색 결과 처리
  const handleSearchResult = useCallback((filteredMessages: ChatMessageType[]) => {
    setDisplayedMessages(filteredMessages);
  }, []);

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

  // 메시지 전송 (개선된 버전)
  const handleSendMessage = useCallback(async (content: string, messageType: 'TEXT' | 'FILE' | 'IMAGE' = 'TEXT') => {
    if (!content.trim()) return;

    try {
      if (isConnected) {
        // STOMP로 실시간 전송
        console.log('📤 STOMP로 메시지 전송:', content);
        stompWebSocketService.sendMessage(content);
        
        // 🎯 메시지 전송 후 자동 스크롤
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        // REST API 사용
        console.log('📤 REST API로 메시지 전송:', content);
        const newMessage = await chatService.sendMessage(room.chatRoomId, content);
        setMessages(prev => [...prev, newMessage]);
        
        // 🎯 메시지 전송 후 자동 스크롤
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  }, [isConnected, room.chatRoomId, scrollToBottom]);

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

  // 🎯 자동 스크롤 처리 제거 - handleNewMessage에서 개별 처리하도록 변경

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8f9fa'
    }}>
      {/* 헤더 없음 - 모달 헤더만 사용 */}

      {/* 검색 영역 */}
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
          position: 'relative'
        }}
      >
        {/* 🎯 검색 영역을 모달창 내 중앙에 배치 */}
        {showSearch && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '400px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid #ddd',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(15px)',
            zIndex: 1001
          }}>
            <MessageSearch
              messages={messages}
              onSearchResult={handleSearchResult}
              onClose={() => onSearchToggle?.(false)}
              onMessageClick={(messageId: number) => {
                // 🎯 메시지 클릭 시 해당 메시지로 스크롤
                const messageElement = document.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement;
                if (messageElement) {
                  messageElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                  });
                  // 🎯 메시지에 하이라이트 효과 추가
                  messageElement.style.backgroundColor = '#fff3cd';
                  messageElement.style.borderRadius = '8px';
                  messageElement.style.padding = '8px';
                  messageElement.style.margin = '-8px';
                  setTimeout(() => {
                    messageElement.style.backgroundColor = '';
                    messageElement.style.borderRadius = '';
                    messageElement.style.padding = '';
                    messageElement.style.margin = '';
                  }, 2000);
                }
              }}
            />
          </div>
        )}

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
        position: 'relative' // 🎯 상대 위치 설정
      }}>
        {/* 🎯 읽지 않은 메시지 스크롤 버튼 */}
        {hasUnreadMessages && (
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100
          }}>
            <button
              onClick={scrollToBottom} // 🎯 가장 마지막 메시지로 스크롤
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #ddd',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                color: '#666',
                transition: 'background-color 0.2s ease',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              }}
              title="최신 메시지로 이동"
            >
              ⬇️
            </button>
          </div>
        )}

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