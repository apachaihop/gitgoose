import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    from,
  } from '@apollo/client';
  import { setContext } from '@apollo/client/link/context';
  import { onError } from '@apollo/client/link/error';
  
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  });
  
  const authLink = setContext((_, { headers }) => {
    const accessToken = localStorage.getItem('accessToken');
    return {
      headers: {
        ...headers,
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    };
  });
  
  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions?.code === 'UNAUTHENTICATED') {
          // Trigger refresh token flow or logout
          return forward(operation);
        }
      }
    }
  
    if (networkError) {
      console.error('Network error:', networkError);
    }
  });
  
  export const apolloClient = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });