import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_REPOSITORIES, 
  GET_REPOSITORY, 
  GET_REPOSITORY_FILES,
  GET_REPOSITORY_DETAILS 
} from '@/lib/graphql/queries/repository';
import { 
  CREATE_REPO, 
  UPDATE_REPO, 
  SET_REPO_VISIBILITY 
} from '@/lib/graphql/mutations/repository';
import type {
  RepositoryData,
  RepositoryFilesData,
  RepositoryDetailsData,
  RepositoryVariables,
  RepositoryFilesVariables,
  RepositoryDetailsVariables
} from '@/lib/types/queries';
import type {
  CreateRepoData,
  UpdateRepoData,
  SetVisibilityData,
  CreateRepoVariables,
  UpdateRepoVariables,
  SetVisibilityVariables
} from '@/lib/types/mutations';
import type { Repository } from '@/lib/types';
export const useRepositories = () => {
  return useQuery<{ repos: Repository[] }>(GET_REPOSITORIES, {
    fetchPolicy: 'network-only',
  });
};

export const useRepository = (id: string) => {
  return useQuery<RepositoryData, RepositoryVariables>(GET_REPOSITORY, {
    variables: { id },
  });
};

export const useRepositoryFiles = (variables: RepositoryFilesVariables) => {
  return useQuery<RepositoryFilesData, RepositoryFilesVariables>(
    GET_REPOSITORY_FILES,
    { variables }
  );
};

export const useRepositoryDetails = (variables: RepositoryDetailsVariables) => {
  return useQuery<RepositoryDetailsData, RepositoryDetailsVariables>(
    GET_REPOSITORY_DETAILS,
    { variables }
  );
};

export const useCreateRepository = () => {
  return useMutation<CreateRepoData, CreateRepoVariables>(CREATE_REPO);
};

export const useUpdateRepository = () => {
  return useMutation<UpdateRepoData, UpdateRepoVariables>(UPDATE_REPO);
};

export const useSetRepositoryVisibility = () => {
  return useMutation<SetVisibilityData, SetVisibilityVariables>(SET_REPO_VISIBILITY);
};