import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      access_token
      user {
        id
        email
        username
        name
        avatarUrl
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($createUserInput: CreateUserInput!) {
    register(createUserInput: $createUserInput) {
      id
      email
      username
      name
      bio
      location
      website
      avatarUrl
    }
  }
`;