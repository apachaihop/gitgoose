'use client';

import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from '@/contexts/AuthContext';
import { apolloClient } from '@/lib/apollo-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}