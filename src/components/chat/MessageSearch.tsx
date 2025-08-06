import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../services/chatService';

interface Props {
  messages: ChatMessage[];
  onSearchResult: (filteredMessages: ChatMessage[]) => void;
  onClose: () => void;
}

export const MessageSearch: React.FC<Props> = ({
  messages,
  onSearchResult,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'content' | 'sender'>('content');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 검색 실행
  const performSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      onSearchResult(messages);
      return;
    }

    setIsSearching(true);
    
    // 검색 로직 (실제로는 백엔드 API 호출)
    setTimeout(() => {
      const filtered = messages.filter(message => {
        const term = searchTerm.toLowerCase();
        
        if (searchBy === 'content') {
          return message.content.toLowerCase().includes(term);
        } else if (searchBy === 'sender') {
          return message.senderNickname.toLowerCase().includes(term);
        }
        
        return false;
      });

      setSearchResults(filtered);
      onSearchResult(filtered);
      setIsSearching(false);
    }, 300);
  };

  // 검색어 변경 시 검색 실행
  useEffect(() => {
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchBy]);

  // 검색 결과 하이라이트
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>
          {part}
        </mark>
      ) : part
    );
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      // 선택된 메시지로 스크롤 (실제 구현에서는 메시지 위치로 스크롤)
      console.log('선택된 메시지:', searchResults[highlightedIndex]);
    }
  };

  // 검색 결과 클릭
  const handleResultClick = (message: ChatMessage) => {
    // 메시지 위치로 스크롤 (실제 구현에서는 메시지 ID로 스크롤)
    console.log('메시지로 이동:', message);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      borderBottom: '1px solid #eee',
      padding: '15px',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '18px' }}>🔍</div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지 검색..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value as 'content' | 'sender')}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="content">내용</option>
          <option value="sender">발신자</option>
        </select>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          ✕
        </button>
      </div>

      {/* 검색 결과 */}
      {searchTerm && (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              검색 중...
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '10px'
              }}>
                {searchResults.length}개의 결과
              </div>
              {searchResults.map((message, index) => (
                <div
                  key={`${message.id}-${index}`}
                  onClick={() => handleResultClick(message)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    marginBottom: '5px',
                    cursor: 'pointer',
                    backgroundColor: highlightedIndex === index ? '#f0f8ff' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    {message.senderStatus === false ? '탈퇴한 회원' : message.senderNickname} 
                    {message.isEdited && ' (수정됨)'} • {new Date(message.createdAt).toLocaleString('ko-KR')}
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {searchBy === 'content' 
                      ? highlightText(message.content, searchTerm)
                      : message.content
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}

      {/* 검색 힌트 */}
      <div style={{
        fontSize: '11px',
        color: '#999',
        marginTop: '10px'
      }}>
        Enter: 선택된 메시지로 이동 | ↑↓: 결과 탐색 | Esc: 검색 닫기
      </div>
    </div>
  );
}; 