import React, { useState } from 'react';

interface Props {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<Props> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      padding: '20px',
      backgroundColor: 'white',
      borderTop: '1px solid #eee'
    }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
        disabled={disabled}
        style={{
          flex: 1,
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '20px',
          marginRight: '10px',
          outline: 'none'
        }}
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
      >
        전송
      </button>
    </form>
  );
};

export default MessageInput;
