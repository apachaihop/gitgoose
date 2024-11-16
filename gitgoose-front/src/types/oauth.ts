export type OAuthProvider = 'github' | 'google' | 'gitlab';

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: OAuthProvider;
  accessToken: string;
  providerData?: {
    username?: string;
    profileUrl?: string;
    [key: string]: any;
  };
}

export interface OAuthState {
  provider: OAuthProvider;
  redirectUrl: string;
}