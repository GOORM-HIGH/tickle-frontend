export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    nickname: string;
    memberRole: string;
    pointBalance: number;
    createdAt: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}
