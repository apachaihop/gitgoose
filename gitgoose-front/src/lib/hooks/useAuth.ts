import { useMutation, useQuery } from '@apollo/client';
import { ME_QUERY } from '@/lib/graphql/queries/auth';
import { 
  LOGIN_MUTATION, 
  REGISTER_MUTATION 
} from '@/lib/graphql/mutations/auth';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import type { CreateUserInput } from '@/lib/types/auth';
import Cookies from 'js-cookie';

interface RegisterResponse {
  register: User;
}

interface LoginResponse {
  login: {
    access_token: string;
    user: User;
  };
}
interface LoginVariables {
    loginInput: {
      email: string;
      password: string;
    };
  }

  export const useLogin = () => {
    return useMutation<LoginResponse, LoginVariables>(LOGIN_MUTATION);
  };

interface MeResponse {
  me: User;
}


export const useRegister = () => {
  return useMutation<RegisterResponse, { createUserInput: CreateUserInput }>(
    REGISTER_MUTATION
  );
};

export const useMe = () => {
  const { setUser } = useAuthStore();
  const token = typeof window !== 'undefined' ? Cookies.get('token') : null;

  return useQuery<MeResponse>(ME_QUERY, {
    skip: !token,
    context: {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    },
    onCompleted: (data) => {
      setUser(data.me);
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return () => {
    Cookies.remove('token');
    clearAuth();
    router.push('/login');
  };
};