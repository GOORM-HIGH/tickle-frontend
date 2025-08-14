import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { profanityFilter } from '../../utils/profanityFilter';

interface Props {
  onSendMessage: (content: string, messageType?: 'TEXT' | 'FILE' | 'IMAGE') => void;
  onFileUploaded: (fileInfo: {fileId: string; fileName: string; fileUrl: string}) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<Props> = ({
  onSendMessage,
  onFileUploaded,
  disabled = false,
  placeholder = "메시지를 입력하세요..."
}) => {
  const [message, setMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 이모지 목록
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
    '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
  ];

  // 타이핑 상태 관리
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.trim()) {
      setIsTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    // 비속어 필터링 적용
    const filteredMessage = profanityFilter.filterByLevel(message.trim(), 'MEDIUM');
    
    onSendMessage(filteredMessage);
    setMessage('');
    setShowFileUpload(false);
    setShowEmojiPicker(false);
    
    // 포커스 유지
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileUploaded = (fileInfo: {fileId: string; fileName: string; fileUrl: string}) => {
    onFileUploaded(fileInfo);
    setShowFileUpload(false);
  };

  const handleFileError = (error: string) => {
    alert(error);
  };

  const autoResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  return (
    <div style={{ position: 'relative' }}>
      {/* 파일 업로드 영역 */}
      {showFileUpload && (
        <div style={{ marginBottom: '10px' }}>
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onError={handleFileError}
          />
        </div>
      )}

      {/* 이모지 피커 */}
      {showEmojiPicker && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '0',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '10px',
          maxWidth: '300px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '5px'
        }}>
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 타이핑 표시 */}
      {isTyping && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '5px 10px',
          fontSize: '12px',
          color: '#666',
          marginBottom: '5px'
        }}>
          ⌨️ 타이핑 중...
        </div>
      )}

      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '24px',
        padding: '8px 12px'
      }}>
        {/* 파일 첨부 버튼 */}
        <button
          type="button"
          onClick={() => setShowFileUpload(!showFileUpload)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background-color 0.2s',
            color: showFileUpload ? '#007bff' : '#666'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="파일 첨부"
        >
          📎
        </button>

        {/* 이모지 버튼 */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background-color 0.2s',
            color: showEmojiPicker ? '#007bff' : '#666'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="이모지"
        >
          😊
        </button>

        {/* 메시지 입력창 */}
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '14px',
            lineHeight: '1.4',
            maxHeight: '120px',
            minHeight: '20px',
            fontFamily: 'inherit'
          }}
        />

        {/* 전송 버튼 */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          style={{
            padding: '8px 16px',
            backgroundColor: message.trim() && !disabled ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          title="전송 (Enter)"
        >
          전송
        </button>
      </form>

      {/* 입력 힌트 */}
      <div style={{
        fontSize: '11px',
        color: '#999',
        marginTop: '5px',
        textAlign: 'center'
      }}>
        Enter: 전송 | Shift+Enter: 줄바꿈 | 📎: 파일 첨부 | 😊: 이모지
      </div>
    </div>
  );
}; 