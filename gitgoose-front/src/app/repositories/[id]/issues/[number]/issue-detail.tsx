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
  Autocomplete,
} from '@mui/material';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Issue, IssueLabel } from '@/types/issue';
import MarkdownPreview from '@/components/markdown-preview';

const GET_ISSUE = gql`
  query GetIssue($repositoryId: ID!, $number: Int!) {
    issue(repositoryId: $repositoryId, number: $number) {
      id
      title
      description
      state
      priority
      number
      author {
        id
        name
        avatarUrl
      }
      assignees {
        id
        name
        avatarUrl
      }
      labels {
        id
        name
        color
      }
      createdAt
      updatedAt
      commentsCount
    }
  }
`;

const UPDATE_ISSUE = gql`
  mutation UpdateIssue($input: UpdateIssueInput!) {
    updateIssue(input: $input) {
      id
      state
      labels {
        id
        name
      }
      assignees {
        id
        name
      }
    }
  }
`;

export default function IssueDetail({ 
  repositoryId, 
  issueNumber 
}: { 
  repositoryId: string;
  issueNumber: string;
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<IssueLabel[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<any[]>([]);

  const { data, loading, error } = useQuery(GET_ISSUE, {
    variables: { 
      repositoryId, 
      number: parseInt(issueNumber) 
    },
  });

  const [updateIssue] = useMutation(UPDATE_ISSUE, {
    refetchQueries: ['GetIssue'],
  });

  if (loading) return null;
  if (error) throw error;

  const issue: Issue = data.issue;

  const handleStateChange = async () => {
    await updateIssue({
      variables: {
        input: {
          id: issue.id,
          state: issue.state === 'OPEN' ? 'CLOSED' : 'OPEN',
        },
      },
    });
  };

  const handleUpdate = async () => {
    await updateIssue({
      variables: {
        input: {
          id: issue.id,
          labelIds: selectedLabels.map(label => label.id),
          assigneeIds: selectedAssignees.map(user => user.id),
        },
      },
    });
    setEditDialogOpen(false);
  };

  return (
    <>
      <Paper className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <Typography variant="h4" component="h1">
              {issue.title} #{issue.number}
            </Typography>
            
            <div className="flex items-center gap-2 mt-2">
              <Chip 
                label={issue.state.toLowerCase()} 
                color={issue.state === 'OPEN' ? 'success' : 'default'}
              />
              <Typography color="text.secondary">
                {issue.author.name} opened this issue {formatDistanceToNow(new Date(issue.createdAt))} ago
              </Typography>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outlined"
              onClick={() => setEditDialogOpen(true)}
            >
              Edit
            </Button>
            <Button 
              variant="contained"
              onClick={handleStateChange}
              color={issue.state === 'OPEN' ? 'error' : 'success'}
            >
              {issue.state === 'OPEN' ? 'Close Issue' : 'Reopen Issue'}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Paper variant="outlined" className="p-4">
            <MarkdownPreview content={issue.description} />
          </Paper>
        </div>

        <div className="mt-6 flex gap-4">
          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Labels
            </Typography>
            <div className="flex gap-1 mt-1">
              {issue.labels.map((label) => (
                <Chip
                  key={label.id}
                  label={label.name}
                  size="small"
                  style={{ backgroundColor: label.color }}
                />
              ))}
            </div>
          </div>

          <div>
            <Typography variant="subtitle2" color="text.secondary">
              Assignees
            </Typography>
            <AvatarGroup max={5} className="mt-1">
              {issue.assignees.map((assignee) => (
                <Avatar
                  key={assignee.id}
                  src={assignee.avatarUrl}
                  alt={assignee.name}
                />
              ))}
            </AvatarGroup>
          </div>
        </div>
      </Paper>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Issue</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <Autocomplete
              multiple
              options={data.labels || []}
              value={selectedLabels}
              onChange={(_, newValue) => setSelectedLabels(newValue)}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Labels" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    style={{ backgroundColor: option.color }}
                  />
                ))
              }
            />

            <Autocomplete
              multiple
              options={data.users || []}
              value={selectedAssignees}
              onChange={(_, newValue) => setSelectedAssignees(newValue)}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Assignees" />
              )}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}