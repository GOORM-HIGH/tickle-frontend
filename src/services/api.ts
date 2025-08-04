import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/signIn', { email, password });
    return response.data;
  }
};

export const chatAPI = {
  getMessages: async (chatRoomId: number) => {
    const response = await api.get(`/api/v1/chat/rooms/${chatRoomId}/messages`);
    return response.data.data;
  },
  
  sendMessage: async (chatRoomId: number, content: string) => {
    const response = await api.post(`/api/v1/chat/rooms/${chatRoomId}/messages`, {
      messageType: 'TEXT',
      content
    });
    return response.data.data;
  },
  
  joinRoom: async (chatRoomId: number) => {
    const response = await api.post(`/api/v1/chat/participants/rooms/${chatRoomId}/join`, {
      message: '채팅방에 입장했습니다.'
    });
    return response.data.data;
  }
};
