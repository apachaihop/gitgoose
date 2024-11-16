export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: 'ADMIN' | 'USER' | 'MAINTAINER';
  }
  
  export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
  }