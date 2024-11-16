import { gql } from '@apollo/client';

export const OAUTH_URL_QUERY = gql`
  query GetOAuthUrl($provider: String!, $redirectUrl: String!, $state: String!) {
    oauthUrl(provider: $provider, redirectUrl: $redirectUrl, state: $state)
  }
`;

export const OAUTH_LOGIN_MUTATION = gql`
  mutation OAuthLogin($input: OAuthLoginInput!) {
    oauthLogin(input: $input) {
      access_token
      user {
        id
        email
        name
      }
    }
  }
`;