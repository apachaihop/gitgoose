export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
}
  
  export interface LoginInput {
    email: string;
    password: string;
  }
  
  export interface CreateUserInput {
    email: string;
    username: string;
    password: string;
    name: string;
    bio?: string;
    location?: string;
    website?: string;
  }
  
  export interface AuthResponse {
    access_token: string;
    user: User;
  }
  
  export interface LoginResponse {
    access_token: string;
    user: {
      id: string;
      email: string;
      username: string;
    };
  }