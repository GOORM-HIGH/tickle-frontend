export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}
