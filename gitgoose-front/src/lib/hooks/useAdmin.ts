import { useMutation, useQuery } from '@apollo/client';
import { GET_USER_STATS, GET_USERS, PROMOTE_TO_ADMIN, SUSPEND_USER } from '@/lib/graphql/queries/admin';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  inactiveUsers: number;
}

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export const useUserStats = () => {
  return useQuery<{ userStats: UserStats }>(GET_USER_STATS);
};

export const useUsers = () => {
  return useQuery<{ users: User[] }>(GET_USERS);
};

export const usePromoteToAdmin = () => {
  return useMutation<
    { promoteToAdmin: User },
    { userId: string; roles: string[] }
  >(PROMOTE_TO_ADMIN);
};

export const useSuspendUser = () => {
  return useMutation<
    { suspendUser: User },
    { userId: string }
  >(SUSPEND_USER);
};