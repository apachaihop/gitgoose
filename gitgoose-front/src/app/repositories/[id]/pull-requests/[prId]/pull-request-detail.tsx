'use client';

import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PullRequest } from '@/types/pull-request';
import MarkdownPreview from '@/components/markdown-preview';

const GET_PULL_REQUEST = gql`
  query GetPullRequest($repositoryId: ID!, $pullRequestId: ID!) {
    pullRequest(repositoryId: $repositoryId, pullRequestId: $pullRequestId) {
      id
      title
      description
      state
      sourceBranch
      targetBranch
      author {
        id
        name
        avatarUrl
      }
      reviewers {
        id
        name
        avatarUrl
      }
      createdAt
      updatedAt
      comments
      commits
      additions
      deletions
    }
  }
`;

const MERGE_PULL_REQUEST = gql`
  mutation MergePullRequest($pullRequestId: ID!) {
    mergePullRequest(id: $pullRequestId) {
      id
      state
    }
  }
`;

export default function PullRequestDetail({ 
  repositoryId, 
  pullRequestId 
}: { 
  repositoryId: string;
  pullRequestId: string;
}) {
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');

  const { data, loading, error } = useQuery(GET_PULL_REQUEST, {
    variables: { repositoryId, pullRequestId },
  });

  const [mergePullRequest, { loading: merging }] = useMutation(MERGE_PULL_REQUEST, {
    onCompleted: () => setMergeDialogOpen(false),
  });

  if (loading) return null;
  if (error) throw error;

  const pr: PullRequest = data.pullRequest;

  const handleMerge = async () => {
    await mergePullRequest({
      variables: { 
        pullRequestId,
        message: commitMessage,
      },
    });
  };

  return (
    <>
      <Paper className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <Typography variant="h4" component="h1">
              {pr.title} #{pr.id}
            </Typography>
            
            <div className="flex items-center gap-2 mt-2">
              <Chip 
                label={pr.state.toLowerCase()} 
                color={
                  pr.state === 'OPEN' ? 'success' : 
                  pr.state === 'MERGED' ? 'primary' : 
                  'default'
                }
              />
              <Typography color="text.secondary">
                {pr.author.name} opened this pull request {formatDistanceToNow(new Date(pr.createdAt))} ago
              </Typography>
            </div>
          </div>

          {pr.state === 'OPEN' && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => setMergeDialogOpen(true)}
            >
              Merge Pull Request
            </Button>
          )}
        </div>

        <div className="mt-6 flex gap-8">
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Commits
            </Typography>
            <Typography>{pr.commits}</Typography>
          </div>
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Changes
            </Typography>
            <Typography className="text-green-600">+{pr.additions}</Typography>
            <Typography className="text-red-600">-{pr.deletions}</Typography>
          </div>
        </div>

        <div className="mt-6">
          <Typography variant="subtitle1" className="mb-2">
            Description
          </Typography>
          <Paper variant="outlined" className="p-4">
            <MarkdownPreview content={pr.description} />
          </Paper>
        </div>

        <div className="mt-6">
          <Typography variant="subtitle1" className="mb-2">
            Reviewers
          </Typography>
          <AvatarGroup max={5}>
            {pr.reviewers.map((reviewer) => (
              <Avatar
                key={reviewer.id}
                src={reviewer.avatarUrl}
                alt={reviewer.name}
              />
            ))}
          </AvatarGroup>
        </div>
      </Paper>

      <Dialog 
        open={mergeDialogOpen} 
        onClose={() => setMergeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Merge Pull Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Commit message"
            multiline
            rows={4}
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="mt-4"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setMergeDialogOpen(false)}
            disabled={merging}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleMerge}
            disabled={merging}
          >
            Confirm Merge
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}