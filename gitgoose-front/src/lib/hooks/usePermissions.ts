import { useQuery } from '@apollo/client';
import { CHECK_PERMISSION } from '@/lib/graphql/queries/auth';
import type { CheckPermissionVariables } from '@/lib/types/queries';

interface CheckPermissionResponse {
  checkPermission: boolean;
}

export const useCheckPermission = (variables: CheckPermissionVariables) => {
  return useQuery<CheckPermissionResponse, CheckPermissionVariables>(
    CHECK_PERMISSION,
    { variables }
  );
};

export const useIsRepoAdmin = (repoId: string, userId: string) => {
  return useCheckPermission({
    repoId,
    userId,
    permission: 'admin',
  });
};

export const useCanPush = (repoId: string, userId: string) => {
  return useCheckPermission({
    repoId,
    userId,
    permission: 'push',
  });
};

export const useCanPull = (repoId: string, userId: string) => {
  return useCheckPermission({
    repoId,
    userId,
    permission: 'pull',
  });
};