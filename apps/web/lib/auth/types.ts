export interface User {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
