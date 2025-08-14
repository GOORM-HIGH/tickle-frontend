import { useState, useCallback } from 'react';
import { stompWebSocketService } from '../services/stompWebSocketService';
import { ChatMessage } from '../types/chat';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async (
    chatRoomId: number, 
    userId: number, 
    nickname: string, 
    onMessage: (message: ChatMessage) => void
  ) => {
    try {
      await stompWebSocketService.connect(chatRoomId, userId, nickname, onMessage);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    stompWebSocketService.disconnect();
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((content: string) => {
    stompWebSocketService.sendMessage(content);
  }, []);

  return { isConnected, connect, disconnect, sendMessage };
};
