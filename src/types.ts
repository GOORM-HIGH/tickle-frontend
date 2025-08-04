export interface ChatMessage {
  id: number;
  content: string;
  senderNickname: string;
  createdAt: string;
  isMyMessage: boolean;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
}

export interface LoginData {
  email: string;
  password: string;
}
