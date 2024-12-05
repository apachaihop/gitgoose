import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_PULL_REQUEST, 
  GET_PULL_REQUESTS_BY_REPOSITORY 
} from '@/lib/graphql/queries/pullRequest';
import { 
  CREATE_PULL_REQUEST, 
  UPDATE_PULL_REQUEST, 
  MERGE_PULL_REQUEST 
} from '@/lib/graphql/mutations/pullRequest';
import type {
  PullRequestData,
  PullRequestsByRepositoryData,
  PullRequestVariables,
  PullRequestsByRepositoryVariables
} from '@/lib/types/queries';
import type {
  CreatePullRequestData,
  UpdatePullRequestData,
  MergePullRequestData,
  CreatePullRequestVariables,
  UpdatePullRequestVariables,
  MergePullRequestVariables
} from '@/lib/types/mutations';

export const usePullRequest = (id: string) => {
  return useQuery<PullRequestData, PullRequestVariables>(GET_PULL_REQUEST, {
    variables: { id },
  });
};

export const usePullRequestsByRepository = (repositoryId: string) => {
  return useQuery<PullRequestsByRepositoryData, PullRequestsByRepositoryVariables>(
    GET_PULL_REQUESTS_BY_REPOSITORY,
    { variables: { repositoryId } }
  );
};

export const useCreatePullRequest = () => {
  return useMutation<CreatePullRequestData, CreatePullRequestVariables>(
    CREATE_PULL_REQUEST
  );
};

export const useUpdatePullRequest = () => {
  return useMutation<UpdatePullRequestData, UpdatePullRequestVariables>(
    UPDATE_PULL_REQUEST
  );
};

export const useMergePullRequest = () => {
  return useMutation<MergePullRequestData, MergePullRequestVariables>(
    MERGE_PULL_REQUEST
  );
};