import api from './api';
import { LoginRequest, LoginResponse } from '../types/auth';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/sign-in', credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
  },
};
