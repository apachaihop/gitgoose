'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/graphql/auth';
import { HTTP_ROUTES } from '../../routes';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (token: string) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  
  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const login = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      localStorage.setItem('access_token', token);
      const profile = await getProfile();
      setUser(profile);
      router.push('/repositories');
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await loginMutation({
        variables: { 
          input: { email, password }
        },
      });
      if (data.login.access_token) {
        await login(data.login.access_token);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${HTTP_ROUTES.AUTH.REGISTER.path}`, {
        method: HTTP_ROUTES.AUTH.REGISTER.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const responseData = await response.json();
      await login(responseData.access_token);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (): Promise<User> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${HTTP_ROUTES.AUTH.PROFILE.path}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  };

  const logout = async () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/signin');
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        loginWithCredentials,
        register,
        logout,
        getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}