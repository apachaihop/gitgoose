import { AUTH_CONFIG } from '@/config/auth';

export class GoogleAuthService {
  static initiateLogin() {
    window.location.href = AUTH_CONFIG.API_ROUTES.GOOGLE_AUTH;
  }

  static async handleCallback(code: string) {
    const response = await fetch(`${AUTH_CONFIG.API_ROUTES.GOOGLE_CALLBACK}?code=${code}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Google authentication failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data.user;
  }
}