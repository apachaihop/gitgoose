import { useMutation, useQuery } from '@apollo/client';
import { GET_ISSUE, GET_ISSUES_BY_REPOSITORY } from '@/lib/graphql/queries/issue';
import { 
  CREATE_ISSUE, 
  UPDATE_ISSUE, 
  ASSIGN_ISSUE,
  ADD_LABEL,
  CHANGE_ISSUE_STATE,
  REMOVE_LABEL,
  UNASSIGN_ISSUE
} from '@/lib/graphql/mutations/issue';
import type {
  IssueData,
  IssuesByRepositoryData,
  IssueVariables,
  IssuesByRepositoryVariables
} from '@/lib/types/queries';
import type {
  CreateIssueData,
  UpdateIssueData,
  AssignIssueData,
  AddLabelData,
  ChangeIssueStateData,
  CreateIssueVariables,
  UpdateIssueVariables,
  AssignIssueVariables,
  AddLabelVariables,
  ChangeIssueStateVariables,
  RemoveLabelData,
  RemoveLabelVariables,
  UnassignIssueData,
  UnassignIssueVariables
} from '@/lib/types/mutations';

export const useIssue = (id: string) => {
  return useQuery<IssueData, IssueVariables>(GET_ISSUE, {
    variables: { id },
  });
};

export const useIssuesByRepository = (repositoryId: string) => {
  return useQuery<IssuesByRepositoryData, IssuesByRepositoryVariables>(
    GET_ISSUES_BY_REPOSITORY,
    { variables: { repositoryId } }
  );
};

export const useCreateIssue = () => {
  return useMutation<CreateIssueData, CreateIssueVariables>(CREATE_ISSUE);
};

export const useUpdateIssue = () => {
  return useMutation<UpdateIssueData, UpdateIssueVariables>(UPDATE_ISSUE);
};

export const useAssignIssue = () => {
  return useMutation<AssignIssueData, AssignIssueVariables>(ASSIGN_ISSUE);
};

export const useAddLabel = () => {
  return useMutation<AddLabelData, AddLabelVariables>(ADD_LABEL);
};

export const useChangeIssueState = () => {
  return useMutation<ChangeIssueStateData, ChangeIssueStateVariables>(
    CHANGE_ISSUE_STATE
  );
};

export const useRemoveLabel = () => {
  return useMutation<RemoveLabelData, RemoveLabelVariables>(REMOVE_LABEL);
};

export const useUnassignIssue = () => {
  return useMutation<UnassignIssueData, UnassignIssueVariables>(UNASSIGN_ISSUE);
};