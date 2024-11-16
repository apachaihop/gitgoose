export const AUTH_CONFIG = {
    API_ROUTES: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      GOOGLE_AUTH: '/auth/google',
      GOOGLE_CALLBACK: '/auth/google/redirect'
    },
    TOKEN_HEADER: 'Authorization: Bearer',
    GUARDS: {
      HTTP: 'JwtAuthGuard',
      GRAPHQL: 'GqlAuthGuard',
      OAUTH: 'GoogleOAuthGuard'
    }
  };