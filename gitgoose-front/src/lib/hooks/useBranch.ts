import { useMutation, useQuery } from '@apollo/client';
import { GET_BRANCHES, GET_BRANCH } from '@/lib/graphql/queries/branch';
import { 
  CREATE_BRANCH, 
  UPDATE_BRANCH, 
  SET_BRANCH_PROTECTION 
} from '@/lib/graphql/mutations/branch';
import type {
  BranchesData,
  BranchData,
  BranchesVariables,
  BranchVariables
} from '@/lib/types/queries';
import type {
  CreateBranchData,
  UpdateBranchData,
  SetBranchProtectionData,
  CreateBranchVariables,
  UpdateBranchVariables,
  SetBranchProtectionVariables
} from '@/lib/types/mutations';

export const useBranches = (repositoryId: string) => {
  return useQuery<BranchesData, BranchesVariables>(GET_BRANCHES, {
    variables: { repositoryId },
  });
};

export const useBranch = (id: string) => {
  return useQuery<BranchData, BranchVariables>(GET_BRANCH, {
    variables: { id },
  });
};

export const useCreateBranch = () => {
  return useMutation<CreateBranchData, CreateBranchVariables>(CREATE_BRANCH);
};

export const useUpdateBranch = () => {
  return useMutation<UpdateBranchData, UpdateBranchVariables>(UPDATE_BRANCH);
};

export const useSetBranchProtection = () => {
  return useMutation<SetBranchProtectionData, SetBranchProtectionVariables>(
    SET_BRANCH_PROTECTION
  );
};