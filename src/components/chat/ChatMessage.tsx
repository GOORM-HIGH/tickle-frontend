import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '../../services/chatService';
import { chatService } from '../../services/chatService';

interface Props {
  message: ChatMessageType;
  chatRoomId: number;
  onMessageUpdate: (messageId: number, updatedMessage: ChatMessageType) => void;
  onMessageDelete: (messageId: number) => void;
  onMarkAsRead: (messageId: number) => void;
}

export const ChatMessage: React.FC<Props> = ({
  message,
  chatRoomId,
  onMessageUpdate,
  onMessageDelete,
  onMarkAsRead
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // 메시지가 내 메시지인지 확인
  const isMyMessage = message.isMyMessage;

  // 읽음 처리 비활성화 (채팅방 나갈 때만 처리하도록 변경)
  // useEffect(() => {
  //   if (!isMyMessage && !message.isRead) {
  //     const timer = setTimeout(() => {
  //       onMarkAsRead(message.id);
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [message.id, isMyMessage, message.isRead, onMarkAsRead]);

  // 외부 클릭 시 옵션 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 수정 모드 진입 시 포커스
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setShowOptions(false);
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }

    setIsEditingMessage(true);
    try {
      const updatedMessage = await chatService.editMessage(chatRoomId, message.id, editContent);
      onMessageUpdate(message.id, updatedMessage);
      setIsEditing(false);
    } catch (error) {
      console.error('메시지 수정 실패:', error);
      alert('메시지 수정에 실패했습니다.');
    } finally {
      setIsEditingMessage(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log(`🗑️ 메시지 삭제 시도: ID=${message.id}, 채팅방=${chatRoomId}`);
      await chatService.deleteMessage(chatRoomId, message.id);
      console.log(`✅ 메시지 삭제 성공: ID=${message.id}`);
      onMessageDelete(message.id);
    } catch (error: any) {
      console.error('메시지 삭제 실패:', error);
      // 더 구체적인 에러 메시지 제공
      if (error.response?.status === 403) {
        alert('삭제 권한이 없습니다. 본인이 보낸 메시지만 삭제할 수 있습니다.');
      } else if (error.response?.status === 404) {
        alert('메시지를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.');
      } else {
        alert(`메시지 삭제에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
      }
    } finally {
      setIsDeleting(false);
      setShowOptions(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessageContent = () => {
    if (message.messageType === 'SYSTEM') {
      return (
        <div style={{
          textAlign: 'center',
          color: '#6c757d',
          fontSize: '12px',
          fontStyle: 'italic',
          margin: '10px 0'
        }}>
          {message.content}
        </div>
      );
    }

    // 탈퇴 회원 메시지 처리 (ERD의 chat_sender_status 활용)
    if (message.senderStatus === false || message.senderNickname === '탈퇴한 회원' || message.senderNickname === 'Withdrawn Member') {
      return (
        <div style={{
          color: '#999',
          fontStyle: 'italic',
          opacity: 0.7
        }}>
          {message.content === '삭제된 메시지입니다.' ? '삭제된 메시지입니다.' : message.content}
        </div>
      );
    }

    // 삭제된 메시지 처리 (ERD의 chat_is_deleted 활용)
    if (message.isDeleted) {
      return (
        <div style={{
          color: '#999',
          fontStyle: 'italic',
          opacity: 0.5,
          textAlign: 'center'
        }}>
          삭제된 메시지입니다.
        </div>
      );
    }

    if (message.messageType === 'IMAGE') {
      return (
        <div>
          <img 
            src={message.content} 
            alt="채팅 이미지"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            onClick={() => window.open(message.content, '_blank')}
          />
        </div>
      );
    }

    if (message.messageType === 'FILE') {
      const fileName = message.fileName || message.content.split('/').pop() || '파일';
      const fileSize = message.fileSize ? formatFileSize(message.fileSize) : '';
      
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
        onClick={() => window.open(message.content, '_blank')}
        >
          📎 {fileName}
          {fileSize && (
            <span style={{ fontSize: '11px', color: '#666' }}>
              ({fileSize})
            </span>
          )}
        </div>
      );
    }

    return <div>{message.content}</div>;
  };

  if (message.messageType === 'SYSTEM') {
    return renderMessageContent();
  }

  return (
    <div
      style={{
        marginBottom: '15px',
        display: 'flex',
        justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
        position: 'relative'
      }}
    >
      <div style={{
        maxWidth: '70%',
        position: 'relative'
      }}>
        {/* 발신자 정보 */}
        {!isMyMessage && (
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '5px',
            opacity: 0.8,
            color: '#666'
          }}>
            {message.senderNickname}
          </div>
        )}

        {/* 메시지 버블 */}
        <div
          style={{
            padding: '10px 15px',
            borderRadius: '18px',
            backgroundColor: isMyMessage ? '#007bff' : 'white',
            color: isMyMessage ? 'white' : 'black',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            position: 'relative',
            cursor: isMyMessage ? 'pointer' : 'default'
          }}
          onMouseEnter={() => isMyMessage && setShowOptions(true)}
          onMouseLeave={() => isMyMessage && setTimeout(() => setShowOptions(false), 1000)}
        >
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                ref={editInputRef}
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEditSubmit()}
                onKeyDown={(e) => e.key === 'Escape' && handleEditCancel()}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: 'black'
                }}
              />
              <button
                onClick={handleEditSubmit}
                disabled={isEditingMessage}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isEditingMessage ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                {isEditingMessage ? '수정 중...' : '저장'}
              </button>
              <button
                onClick={handleEditCancel}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                취소
              </button>
            </div>
          ) : (
            <>
              {renderMessageContent()}
              
              {/* 시간 및 읽음 표시 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '5px',
                fontSize: '11px',
                opacity: 0.7
              }}>
                <span>{formatTime(message.createdAt)}</span>
                {message.isEdited && (
                  <span style={{ fontSize: '10px', color: '#666' }}>
                    (수정됨)
                  </span>
                )}
                {isMyMessage && (
                  <span style={{ fontSize: '10px' }}>
                    {message.isRead ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* 옵션 메뉴 */}
        {isMyMessage && showOptions && !isEditing && (
          <div
            ref={optionsRef}
            style={{
              position: 'absolute',
              top: '-30px',
              right: '0',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              gap: '4px',
              padding: '4px',
              zIndex: 10
            }}
          >
            <button
              onClick={handleEdit}
              style={{
                padding: '4px 8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontSize: '11px'
              }}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 