import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface EventSearchBarProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  placeholder?: string;
  searchKeyword?: string;
}

export const EventSearchBar: React.FC<EventSearchBarProps> = ({ 
  onSearch, 
  onFilter, 
  placeholder = "이벤트명, 공연명으로 검색해보세요...",
  searchKeyword = ""
}) => {
  const [inputValue, setInputValue] = useState(searchKeyword);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch?.(value);
  };

  const handleFilterClick = () => {
    onFilter?.();
  };

  return (
    <div style={{
      marginBottom: '2rem',
      padding: '0 1rem'
    }}>
      <div style={{
        position: 'relative',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: '50px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #f0f0f0',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.5rem',
            color: '#666'
          }}>
            <Search size={20} />
          </div>
                      <input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleSearchChange}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '1rem 0',
                fontSize: '1rem',
                backgroundColor: 'transparent',
                color: '#333'
              }}
            />
          <button 
            onClick={handleFilterClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '0 50px 50px 0',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}>
            <Search size={16} />
            검색
          </button>
        </div>
      </div>
    </div>
  );
}; 