import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
    }
  }
`;

export function useAuth() {
  const { data, loading, error } = useQuery(GET_CURRENT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!data?.me);
  }, [data]);

  return {
    user: data?.me,
    isAuthenticated,
    loading,
    error,
  };
}