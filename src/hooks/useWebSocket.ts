import { useState, useCallback } from 'react';
import { websocketService } from '../services/websocketService';
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
      await websocketService.connect(chatRoomId, userId, nickname, onMessage);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((content: string) => {
    websocketService.sendMessage(content);
  }, []);

  return { isConnected, connect, disconnect, sendMessage };
};
